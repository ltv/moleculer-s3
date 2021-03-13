/**
 * moleculer-s3
 *
 * @license MIT
 * @copyright Luc <luc@ltv.vn>
 */

const { RuntimeException } = require('node-exceptions')

class PermissionMissing extends RuntimeException {
  raw = null
  constructor(err, path) {
    super(
      `Missing permission for file ${path}\n${err.message}`,
      500,
      'E_PERMISSION_MISSING'
    )
    this.raw = err
  }
}

module.exports = PermissionMissing
