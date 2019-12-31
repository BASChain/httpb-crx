'use strict'
const debug = require('debug')
const log = debug('basexter:request')
log.error = debug('basexter:request:error')

const LRU = require('lru-cache')

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
  const requestCacheCfg = {max:128,maxAge:1000*30}
  const ignoreRequests = new LRU(requestCacheCfg)
  const ignore = (id) =>ignoreRequests.set(id,true)
  const isIgnored = (id) => ignoreRequests.get(id) !== undefined

  //origin details chrome
  const originUrls = new LRU(requestCacheCfg)

  /**
   * @DateTime 2019-11-25
   * @param    {Object}   request
   * handle webRequest
   */
  const originUrl = (request) => {

  }

  const lookupInBas = (request) => {

  }

  return {
    onBeforeRequest (request) {
      const state = getState()
    },
    onBeforeSendHeaders (request) {
      const state = getState()
      if(!state.active) return
    },
    onHeadersReceived (request) {
      const state = getState()
      if(!state.active) return
    },
    onErrorOccurred (request) {
      const state = getState()
      if (!state.active) return
    },
    onComplated (request) {
      const state = getState()
      if (!state.active) return
    }
  }
}


module.exports = {
  createRequestModifier,
  redirectOutHint
}