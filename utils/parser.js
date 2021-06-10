function toInt(string) {
  const reg = /[,z±]/g
  return parseInt(string.replace(reg, ''))
}

module.exports = toInt
