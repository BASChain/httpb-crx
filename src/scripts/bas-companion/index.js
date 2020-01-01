'use strict'

const debug = require('debug')
const log = debug('basexter:main')
log.error = debug('basexter:main:error')

const browser = require('webextension-polyfill')
const { createRuntimeInfo } = require('./runtime-info.js')
const { createRequestModifier, redirectOutHint } = require('./request-modifier.js')
const ParsingEngine = require('./parsing-engine.js')
const { initState } = require('./state.js')

module.exports.BasUtils = {
  ParsingEngine
}


module.exports.BasCompanion = async function init(DAppInst,options){
  const parsingEngine = new ParsingEngine(0)
  var basDApp = DAppInst

  var bas //bas
  var state = initState(options) // local cache of various states
  var runtime
  var requestModifier
  const idleInSecs = 5 * 60

  try{
    runtime = await createRuntimeInfo(browser)
    console.log('createRuntimeInfo')
    requestModifier = createRequestModifier(getState,getParsingEngine,runtime)

    //registing Listeners
    registerListeners()
  }catch(error) {
    log.error('Unable to initilaize addon due to error',error)
    throw error
  }

  function getState (){
    return state
  }

  function getDapp (){
    return basDApp
  }

  function getParsingEngine(){
    return parsingEngine
  }

  function registerListeners() {
    const beforeSendInfoSpec = ['blocking','requestHeaders']
    const requestUrlFilter = { urls: ['http://*/*','https://*/*'],types:['main_frame'] }
    const requestUrlTypesFilter = { urls: ['<all_urls>'] ,types:['main_frame']}

    if(browser.webRequest.onBeforeSendHeadersOptions &&
      'EXTRA_HEADERS' in browser.webRequest.onBeforeSendHeadersOptions) {
      //Chrome 72+
      beforeSendInfoSpec.push('extraHeaders')
    }

    browser.webRequest.onBeforeRequest.addListener(
      onBeforeRequest,
      requestUrlTypesFilter,
      ['blocking']
    )

    browser.webRequest.onBeforeSendHeaders.addListener(
      onBeforeSendHeaders,
      requestUrlFilter,
      beforeSendInfoSpec
    )


    browser.webRequest.onHeadersReceived.addListener(
      onHeadersReceived,
      requestUrlTypesFilter,
      ['blocking','responseHeaders']
    )

    browser.webRequest.onErrorOccurred.addListener(
      onErrorOccurred,
      requestUrlTypesFilter
    )

  }

  /* ============== HTTP Request ================== */
  /**
   * chrome events:
   *   onBeforeRequest,onBeforeSendHeaders,onSendHeaders,
   *   onHeadersReceived,onAuthRequired,onBeforeRedirect,
   *   onResponseStarted,onCompleted
   *   onErrorOccurred
   * firefox:
   *   no onBeforeRedirect
   */
  function onBeforeRequest (request) {
    return requestModifier.onBeforeRequest(request,basDApp)
  }

  function onBeforeSendHeaders (request) {
    return requestModifier.onBeforeSendHeaders(request,basDApp)
  }

  function onHeadersReceived (request) {
    return requestModifier.onHeadersReceived(request,basDApp)
  }

  function onErrorOccurred (request) {
    return requestModifier.onErrorOccurred(request,basDApp)
  }

  const API = {
    get version(){
      return 'api-1.0'
    },
    get state () {
      return state
    },
    get rumtime () {
      return runtime
    },

    get basDApp (){
      return basDApp
    },
    get requestModifier (){
      return requestModifier
    },
    get parsingEngine (){
      return parsingEngine
    }
  }

  return API
}