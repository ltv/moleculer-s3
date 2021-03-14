'use strict'

const BaseProvider = require('./base')
class AWSProvider extends BaseProvider {
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
}

module.exports = AWSProvider
