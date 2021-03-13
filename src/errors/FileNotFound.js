/**
 * moleculer-s3
 *
 * @license MIT
 * @copyright Luc <luc@ltv.vn>
 */

const { RuntimeException } = require('node-exceptions')

class FileNotFound extends RuntimeException {
  raw = null
  constructor(err, path) {
    super(
      `The file ${path} doesn't exist\n${err.message}`,
      500,
      'E_FILE_NOT_FOUND'
    )
    this.raw = err
  }
}

module.exports = FileNotFound
