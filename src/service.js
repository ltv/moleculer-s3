'use strict'

const pkg = require('../package.json')
const env = require('./utils/env')

const PROVIDERS = {
  aws: (config) => {
    const AWSS3 = require('./provider/aws')
    return new AWSS3(config)
  },
  bizfly: (config) => {
    const Bizfly = require('./provider/bizfly')
    return new Bizfly(config)
  },
}

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
        contentType: {
          type: 'string',
          optional: true,
        },
        ACL: {
          type: 'enum',
          values: ['public-read', 'private'],
          optional: true,
        },
      },
      handler(ctx) {
        const { location, expiry, type, contentType, ACL } = ctx.params
        return this.provider.getSignedUrl(location, {
          expiry,
          type,
          contentType,
          ACL,
        })
      },
    },
  },

  methods: {
    init() {
      this.provider = PROVIDERS[this.settings.provider || 'aws'](this.settings)
    },
  },

  created() {
    this.init()
  },
}

module.exports = (provider = 'aws') => {
  if (typeof provider === 'string') {
    serviceSchema.settings.provider = provider
  } else {
    serviceSchema.provider = provider
  }
  return serviceSchema
}
