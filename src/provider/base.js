'use strict'

const merge = require('lodash.merge')

const S3 = require('aws-sdk/clients/s3')
const { handleError } = require('./error')

class BaseProvider {
  $s3 = null
  $bucket = null

  constructor(initialConfig = {}) {
    this.$s3 = new S3(this.configs(initialConfig))
  }

  /**
   * Modify initial config if needed
   *
   * @param {*} initialConfig
   * @returns
   */
  initialConfig(initialConfig) {
    return {}
  }

  configs(initialConfig) {
    const { accessKeyId, secretAccessKey, region, endpoint, bucket } =
      initialConfig
    const configs = merge(
      {
        accessKeyId,
        secretAccessKey,
        region,
        endpoint,
        bucket,
      },
      this.initialConfig(initialConfig)
    )

    this.$bucket = configs.bucket

    return configs
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
    const { expiry = 60, ACL, type = 'getObject', contentType } = options

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
        params.ContentType = contentType
      }

      const result = await this.$s3.getSignedUrlPromise(type, params)
      const resp = { signedUrl: result, raw: result }

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
    return `${this.$s3.endpoint}${this.$bucket}/${location}`
  }
}

module.exports = BaseProvider
