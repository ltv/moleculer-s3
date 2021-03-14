# moleculer-s3

Moleculer Service Mixin for S3

## Use mixin in the service

```js
const S3 = require('moleculer-s3')

module.exports = {
  name: 's3',
  settings: {
    provider: 'aws', // aws | digitalocean | bizfly
    accessKeyId: '', // process.env.S3_ACCESS_KEY_ID
    secretAccessKey: // process.env.S3_SECRET_ACCESS_KEY
    region: '', // process.env.S3_REGION
    endpoint: '', // process.env.S3_ENDPOINT if you provide `provider` option, don't need to provide endpoint
    cdn: // process.env.S3_CDN,
    bucket: // process.env.S3_BUCKET,
  },
  mixins: [S3('aws')], // if provided `provider` in `settings` -> you don't need to provide here
}
```

## Actions

### getSignedUrl

Params:

```js
{
  location: 'string',
  expiry: 'number|integer|optional',
  type: {
    type: 'array',
    items: 'string',
    enum: ['getObject', 'putObject'],
    optional: true,
    default: 'getObject',
  },
}
```

Call from other service

```js
ctx.call('s3.getSignedUrl', { location: '/path/to/file/in/bucket' })
// { location: '/path/to/file', expiry: 60 * 1, type: 'putObject' }
```

Response

```js
{
  signedUrl: '',
  raw: ''
}
```
