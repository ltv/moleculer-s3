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

module.exports = {
  handleError,
}
