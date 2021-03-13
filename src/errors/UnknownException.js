/**
 * moleculer-s3
 *
 * @license MIT
 * @copyright Luc <luc@ltv.vn>
 */

const { RuntimeException } = require('node-exceptions')

class UnknownException extends RuntimeException {
  raw = null
  constructor(err, errorCode, path) {
    super(
      `An unknown error happened with the file ${path}.
Please open an issue at https://github.com/ltv/moleculer-s3/issues
Error code: ${errorCode}
Original stack:
${err.stack}`,
      500,
      'E_UNKNOWN'
    )
    this.raw = err
  }
}

module.exports = UnknownException
