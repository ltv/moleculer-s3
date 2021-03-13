const AWSProvider = require('../aws')

describe('AWS Provider', () => {
  describe('Valid Provider', () => {
    test('Create new awsS3 provider instance', () => {
      const awsS3 = new AWSProvider({})
      expect(awsS3).toBeTruthy()
    })
  })
})
