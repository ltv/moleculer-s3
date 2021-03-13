const { ServiceBroker } = require('moleculer')

process.env.S3_REGION = 'hn'
process.env.S3_ACCESS_KEY_ID = ''
process.env.S3_SECRET_ACCESS_KEY = ''
process.env.S3_BUCKET = ''
process.env.S3_ENDPOINT = 'https://ss-hn-1.bizflycloud.vn'

const S3 = require('./index')

const broker = new ServiceBroker()

broker.createService({
  name: 'test',
  mixins: [S3('aws')],
})

broker.start().then(() => broker.repl())
