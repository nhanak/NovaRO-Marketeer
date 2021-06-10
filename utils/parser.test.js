const toInt = require('./parser')

test('Change "400,000,000z" to 400000000', () => {
  expect(toInt('400,000,000z')).toBe(400000000)
})
