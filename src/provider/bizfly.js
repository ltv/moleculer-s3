'use strict'

const merge = require('lodash.merge')

const BaseProvider = require('./base')
const { handleError } = require('./error')
const constants = require('../constants')

class BizflyProvider extends BaseProvider {
  $cdn = null

  constructor(config) {
    super(config)

    this.$cdn = config.cdn
  }

  /**
   * Modify initial config if needed
   *
   * @param {*} initialConfig
   * @returns
   */
  initialConfig(config) {
    const bizflyConfig = {
      apiVersions: {
        s3: '2006-03-01',
      },
    }
    const region = 'hn'
    const endpoint =
      constants[`PROVIDER_ENDPOINT_BIZFLY_${region.toUpperCase()}`]

    if (!['hn', 'hcm'].includes(config.region)) {
      bizflyConfig.region = 'hn'
    }

    if (!config.endpoint) {
      bizflyConfig.endpoint = endpoint
    }

    return merge(config, bizflyConfig)
  }

  /**
   * Returns signed url for an existing file
   */
  async getSignedUrl(location, options = {}) {
    try {
      const resp = await super.getSignedUrl(location, options)

      // console.log('[getSignedUrl] > ', this.$cdn)
      if (this.$cdn) {
        resp.signedUrl = this.getCdnUrl(resp.signedUrl)
      }

      return resp
    } catch (e) {
      throw handleError(e, location, this.$bucket)
    }
  }

  /**
   * getCdnUrl if configured
   */
  getCdnUrl(signedUrl) {
    if (!signedUrl) return
    return signedUrl.replace(/^https?:\/\/([^\/]+)(?=\/)/, this.$cdn)
  }
}

module.exports = BizflyProvider
