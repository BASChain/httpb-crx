'use strict'

const debug = require('debug')
const log = debug('basexter:main')
log.error = debug('basexter:main:error')

const browser = require('webextension-polyfill')
const { createRuntimeInfo } = require('./runtime-info.js')
const { createRequestModifier, redirectOutHint } = require('./request-modifier.js')
const ParsingEngine = require('./parsing-engine.js')
const { initState } = require('./state.js')

const punycode = require('punycode')
const $ = require('jquery');
global.$ = global.jQuery = $;


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
    //console.log('createRuntimeInfo')
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
      ['blocking',"extraHeaders", "requestBody"]
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

/*    browser.webRequest.onCompleted.addListener(
      onCompleted,
      {urls: ['<all_urls>'] ,types:['main_frame']},
      ['blocking','responseHeaders']
    )*/

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
    const parEngine = getParsingEngine();

    console.log(JSON.stringify(request))
    const parseData = parEngine.parseUrl(request.url,request.requestId);
    console.log(JSON.stringify(request))
    if(!parseData || !parseData.alias)return

    let _alias = punycode.toASCII(parseData.alias)
    let queryDns = parEngine.getQueryDns(_alias)
    console.log('queryDns>>>',queryDns)
    let redirectObj = {}
    $.ajax({
      type:"GET",
      url:queryDns,
      dataType:"json",
      async:false,
      success:function (res){
        console.log(res)
        if(res.Status==0){
          let dat = parEngine.parseDns(res);
          if(dat && dat.length>0){
            console.log('data',dat)
            let reUrl = parEngine.buildRedirectUrl(parseData,dat[0].data)
            redirectObj= {redirectUrl:reUrl}

          }
        }

        //redirectObj= {redirectUrl:"http://www.baidu.com"}
      },
      error:function(e){
        console.log(e.message)
      }
    })
    return redirectObj;
    //return requestModifier.onBeforeRequest(request,basDApp)
  }


  function onBeforeSendHeaders (request) {
    //return requestModifier.onBeforeSendHeaders(request,basDApp)
  }

  function onHeadersReceived (request) {
    //return requestModifier.onHeadersReceived(request,basDApp)
  }

  function onErrorOccurred (request) {
   // return requestModifier.onErrorOccurred(request,basDApp)
  }

  function onCompleted (request) {
    console.log('onCompleted',JSON.stringify(request,null,2))
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