const BizflyProvider = require('../bizfly')
const { PROVIDER_ENDPOINT_BIZFLY_HN } = require('../../constants')

describe('AWS Provider', () => {
  describe('Valid Provider', () => {
    test('Create new provider instance', () => {
      const provider = new BizflyProvider({})
      expect(provider).toBeTruthy()
    })
  })

  describe('initializeConfig', () => {
    const cdn = 'https://cdn.example'
    const provider = new BizflyProvider({ cdn, bucket: 'mybucket' })

    test('Set $cdn to provider instance', () => {
      expect(provider.$cdn).toEqual(cdn)
    })

    test('Set apiVersions to configuration', () => {
      expect(provider.$s3.config.apiVersions.s3).toEqual('2006-03-01')
    })

    test('Region & Endpoint will be set to default', () => {
      expect(provider.$s3.config.region).toEqual('hn')
      expect(provider.$s3.config.endpoint).toEqual(PROVIDER_ENDPOINT_BIZFLY_HN)
    })
  })
})
