const Info = require('./info.json')
const BrowerInfo = require('./check-runtime.js')
const { createRuntimeInfo, hasChromeSocketsForTCP,BindThisProperties } = require('./check-utils.js')
const Storage = require('./storage.js')

module.exports = {
  Info,
  Storage,
  BrowerInfo,
  BindThisProperties,
  createRuntimeInfo,
  hasChromeSocketsForTCP
}