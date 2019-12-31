'use strict'
const debug = require('debug')
const log = debug('basexter:request')
log.error = debug('basexter:request:error')

/**
 * [recoverableNetworkErrors description]
 * @type {Set}
 */
const recoverableNetworkErrors = new Set([
  'NS_ERROR_UNKNOWN_HOST',
  'NS_ERROR_NET_TIMEOUT',
  'NS_ERROR_NET_RESET',
  'NS_ERROR_NET_ON_RESOLVED'
])

const redirectOutHint = 'x-bas-no-redirect'

function createRequestModifier (getState,runtime) {
  const browser = runtime.browser
}


module.exports = {
  createRequestModifier,
  redirectOutHint
}