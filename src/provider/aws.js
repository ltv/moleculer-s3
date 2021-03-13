'use strict'

const S3 = require('aws-sdk/clients/s3')

const {
  NoSuchBucket,
  FileNotFound,
  PermissionMissing,
  UnknownException,
} = require('../errors')

function handleError(err, path, bucket) {
  switch (err.name) {
    case 'NoSuchBucket':
      return new NoSuchBucket(err, bucket)
    case 'NoSuchKey':
      return new FileNotFound(err, path)
    case 'AllAccessDisabled':
      return new PermissionMissing(err, path)
    default:
      return new UnknownException(err, err.name, path)
  }
}

class AWSProvider {
  $s3 = null
  $bucket = null
  $cdn = null

  constructor(initialConfig = {}) {
    const { accessKeyId, secretAccessKey, region, endpoint } = initialConfig
    const apiVersions = {
      s3: '2006-03-01',
    }
    const configs = {
      accessKeyId,
      secretAccessKey,
      region,
      endpoint,
    }

    // apiVersions could be change later in another version
    if (apiVersions) {
      configs.apiVersions = apiVersions
    }

    this.$bucket = initialConfig.bucket
    this.$cdn = initialConfig.cdn
    this.$s3 = new S3(configs)
  }

  /**
   * Copy a file to a location.
   */
  async copy(src, dest) {
    const params = {
      Key: dest,
      Bucket: this.$bucket,
      CopySource: `/${this.$bucket}/${src}`,
    }

    try {
      const result = await this.$s3.copyObject(params).promise()
      return { raw: result }
    } catch (e) {
      throw handleError(e, src, this.$bucket)
    }
  }

  /**
   * Delete existing file.
   */
  async delete(location) {
    const params = { Key: location, Bucket: this.$bucket }

    try {
      const result = await this.$s3.deleteObject(params).promise()
      // Amazon does not inform the client if anything was deleted.
      return { raw: result, wasDeleted: null }
    } catch (e) {
      throw handleError(e, location, this.$bucket)
    }
  }

  /**
   * Determines if a file or folder already exists.
   */
  async exists(location) {
    const params = { Key: location, Bucket: this.$bucket }

    try {
      const result = await this.$s3.headObject(params).promise()
      return { exists: true, raw: result }
    } catch (e) {
      if (e.statusCode === 404) {
        return { exists: false, raw: e }
      } else {
        throw handleError(e, location, this.$bucket)
      }
    }
  }

  /**
   * Returns the file contents.
   */
  async get(location, encoding = 'utf-8') {
    const bufferResult = await this.getBuffer(location)
    return {
      content: bufferResult.content.toString(encoding),
      raw: bufferResult.raw,
    }
  }

  /**
   * Returns the file contents as Buffer.
   */
  async getBuffer(location) {
    const params = { Key: location, Bucket: this.$bucket }

    try {
      const result = await this.$s3.getObject(params).promise()

      // S3.getObject returns a Buffer in Node.js
      const body = result.Body

      return { content: body, raw: result }
    } catch (e) {
      throw handleError(e, location, this.$bucket)
    }
  }

  /**
   * Returns signed url for an existing file
   */
  async getSignedUrl(location, options = {}) {
    const { expiry = 60, ACL, type = 'getObject', ContentType } = options

    try {
      const params = {
        Key: location,
        Bucket: this.$bucket,
        Expires: expiry,
      }

      if (['public-read', 'private'].includes(ACL)) {
        params.ACL = ACL
      }

      if (type === 'putObject') {
        params.ContentType = ContentType
      }

      const result = await this.$s3.getSignedUrlPromise(type, params)
      const resp = { signedUrl: result, raw: result }

      if (this.$cdn) {
        resp.signedUrl = this.getCdnUrl(resp.signedUrl)
      }

      return resp
    } catch (e) {
      throw handleError(e, location, this.$bucket)
    }
  }

  /**
   * Returns file's size and modification date.
   */
  async getStat(location) {
    const params = { Key: location, Bucket: this.$bucket }

    try {
      const result = await this.$s3.headObject(params).promise()
      return {
        size: result.ContentLength,
        modified: result.LastModified,
        raw: result,
      }
    } catch (e) {
      throw handleError(e, location, this.$bucket)
    }
  }

  /**
   * Returns the stream for the given file.
   */
  getStream(location) {
    const params = { Key: location, Bucket: this.$bucket }

    return this.$s3.getObject(params).createReadStream()
  }

  /**
   * Returns url for a given key.
   */
  getUrl(location) {
    const { href } = this.$s3.endpoint

    if (href.startsWith('https://s3.amazonaws')) {
      return `https://${this.$bucket}.s3.amazonaws.com/${location}`
    }

    return `${href}${this.$bucket}/${location}`
  }

  /**
   * getCdnUrl if configured
   */
  getCdnUrl(signedUrl) {
    if (!signedUrl) return

    return signedUrl.replace(/^https?:\/\/([^\/]+)(?=\/)/, this.$cdn)
  }
}

module.exports = AWSProvider
