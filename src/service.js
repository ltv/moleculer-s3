'use strict'

const pkg = require('../package.json')
const env = require('./utils/env')
const awsS3 = require('./provider/aws')

const serviceSchema = {
  provider: null,
  // service settings
  settings: {
    provider: 'aws',
    accessKeyId: env('S3_ACCESS_KEY_ID'),
    secretAccessKey: env('S3_SECRET_ACCESS_KEY'),
    region: env('S3_REGION'),
    endpoint: env('S3_ENDPOINT', undefined),
    cdn: env('S3_CDN'),
    bucket: env('S3_BUCKET'),
  },
  // Service's metadata
  metadata: {
    $category: 'storage',
    $description: 'Simple Cloud Storage Service',
    $official: false,
    $package: {
      name: pkg.name,
      version: pkg.version,
      repo: pkg.repository ? pkg.repository.url : null,
    },
  },

  actions: {
    getSignedUrl: {
      params: {
        location: 'string',
        expiry: 'number|integer|optional',
        type: {
          type: 'array',
          items: 'string',
          enum: ['getObject', 'putObject'],
          optional: true,
          default: 'getObject',
        },
      },
      handler(ctx) {
        const { location, expiry, type } = ctx.params
        return this.provider.getSignedUrl(location, { expiry, type })
      },
    },
  },

  methods: {
    init() {
      this.provider = new awsS3(this.settings)
    },
  },

  created() {
    this.init()
  },
}

module.exports = (provider = 'aws') => {
  return serviceSchema
}
