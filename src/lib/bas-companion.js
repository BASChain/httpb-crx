'use strict'
const debug = require('debug')
const log = debug('bas-companion:core')
log.error = debug('bas-companion:core:error')

const browser = require('webextension-polyfill'),
{ createRuntimeInfo } = require('./runtime-info')

module.exports = async function init() {
  /* APIS local cache */
  var state,runtime

  try{
    runtime = await createRuntimeInfo(browser)
  }
}