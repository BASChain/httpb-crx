const Info = require('./info.json')
const BrowerInfo = require('./check-runtime.js')
const { createRuntimeInfo, hasChromeSocketsForTCP } = require('./check-utils.js')

module.exports = {
  Info,
  BrowerInfo,
  createRuntimeInfo,
  hasChromeSocketsForTCP
}