const { ServiceBroker } = require('moleculer')

process.env.S3_ACCESS_KEY_ID = ''
process.env.S3_SECRET_ACCESS_KEY = ''
process.env.S3_BUCKET = ''

const S3 = require('../index')

const broker = new ServiceBroker()

broker.createService({
  name: 'test',
  // settings: {
  //   cdn: 'https://xx.cdn.vccloud.vn'
  // },
  mixins: [S3('bizfly')],
})

broker.start().then(() => broker.repl())
