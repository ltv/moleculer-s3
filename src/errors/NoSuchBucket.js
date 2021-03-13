/**
 * moleculer-s3
 *
 * @license MIT
 * @copyright Luc <luc@ltv.vn>
 */

const { RuntimeException } = require('node-exceptions')

class NoSuchBucket extends RuntimeException {
  raw = null
  constructor(err, bucket) {
    super(
      `The bucket ${bucket} doesn't exist\n${err.message}`,
      500,
      'E_NO_SUCH_BUCKET'
    )
    this.raw = err
  }
}

module.exports = NoSuchBucket
