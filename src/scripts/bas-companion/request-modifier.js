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
  const rtRoot = browser.runtime.getURL('/')
  const webExtOrigin = rtRoot ? new URL(rtRoot).origin : 'null'
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
    //firfox
    if(request.originUrl) return request.originUrl

    //chrome
    const cachedUrl = originUrls.get(request.requestId)
    if(cachedUrl)return cachedUrl

    if(request.requestHeaders){
      const referer = request.requestHeaders.find( h => h.name ==='Referer')
      if(referer) {
        originUrls.set(request.requestId,referer.value)
        return referer.value
      }
    }
  }

  const lookupInBas = (request) => {

  }

  return {
    onBeforeRequest (request) {
      https://github.com/ipfs-shipyard/ipfs-companion/issues/164#issuecomment-328374052
      const state = getState()
      logTest(request,'onBeforeRequest>>>>')
    },
    onBeforeSendHeaders (request) {
      const state = getState()
      //if(!state.active) return
      logTest(request,'onBeforeSendHeaders>>>>')
    },
    onHeadersReceived (request) {
      const state = getState()
      if(!state.active) return
      logTest(request,'onHeadersReceived>>>>')
    },
    onErrorOccurred (request) {
      const state = getState()
      if (!state.active) return
    },
    onComplated (request) {
      const state = getState()
      if (!state.active) return
      logTest(request,'onComplated>>>>')
    }
  }
}

function logTest(details,tag){
  console.log(tag||"test");
  console.log(JSON.stringify(details,null,2));
}


module.exports = {
  createRequestModifier,
  redirectOutHint
}