'use strict'
const debug = require('debug')
const log = debug('basexter:request')
log.error = debug('basexter:request:error')

const LRU = require('lru-cache'),
  punycode = require('punycode')

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

function createRequestModifier (getState,getParsingEngine,runtime) {

  const browser = runtime.browser
  const rtRoot = browser.runtime.getURL('/')
  const webExtOrigin = rtRoot ? new URL(rtRoot).origin : 'null'
  const requestCacheCfg = {max:128,maxAge:1000*30}
  const ignoreRequests = new LRU(requestCacheCfg)
  const ignore = (id) =>ignoreRequests.set(id,true)
  const isIgnored = (id) => ignoreRequests.get(id) !== undefined

  //origin details chrome
  const originUrls = new LRU(requestCacheCfg)




  const redirectUrls = new LRU(requestCacheCfg)
  const hasRedirectUrl = (id) => redirectUrls.get(id) !== undefined

  const GetRedirectUrl = (id,parseData,dapp) => {
    let _parseData = parseData;
    if(redirectUrls.has(id)){
      return {redirectUrl:redirectUrls.get(id)}
    }
    if(parseData && parseData.matched && parseData.alias && dapp){
      let _pAlias = punycode.toASCII(parseData.alias);
      console.log('alias',parseData.alias,'<<>>',_pAlias)
      dapp.basManager.methods.queryByString(_pAlias).call((err,data)=>{
        console.log("Data>>>>",parseData)
        if(!err){
          console.log(data)
        }

      })
      let rurl = "http://104.238.165.23"
      console.log('Set Cache>>>>>')
      redirectUrls.set(id,rurl,1000*40)
    }
    return null;


  }
  /* -------------------------- */


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

  //处理跳过的url
  const preNormalizationSkip = (request,parseData) =>{
    if(!parseData || !parseData.matched){
      ignore(request.requestId)
    }else{
      //todo cache need redirect alias→redirect

    }

    return isIgnored(request.requestId)
  }




  return {

    /**
     * @DateTime 2019-12-10
     *
     */
    onBeforeRequest (request,dapp) {
      //https://github.com/ipfs-shipyard/ipfs-companion/issues/164#issuecomment-328374052
      const state = getState()
      const parsingEngine = getParsingEngine()

      logTest(request,'onBeforeSendHeaders>>>>')
      const parseData = parsingEngine.parseUrl(request.url,request.requestId);
      console.log('>>>',JSON.stringify(parseData))

      if(preNormalizationSkip(request,parseData)){
        console.log('skip normal')
        return
      }

      return GetRedirectUrl(request.requestId,parseData,dapp)

    },
    /**
     * @DateTime 2019-12-15
     *
     */
    onBeforeSendHeaders (request,dapp) {
      const state = getState()
      //if(!state.active) return
      logTest(request,'onBeforeSendHeaders>>>>')
    },
    /**
     * @DateTime 2019-12-15
     *
     */
    onHeadersReceived (request,dapp) {
      const state = getState()
      logTest(request,'onHeadersReceived>>>>')
      let rd = GetRedirectUrl(request.requestId)

      console.log('onHeadersReceived>>>',rd)
      if(rd)return rd;


      if(!state.active) return

    },
    onErrorOccurred (request,dapp) {
      const state = getState()
      if (!state.active) return
      logTest(request,'onHeadersReceived>>>>')
    },
    onComplated (request,dapp) {
      const state = getState()
      logTest(request,'onComplated>>>>')
      if (!state.active) return
    },
    cacheReset(name){
      switch(name){
        case 'ignore':
          ignoreRequests.reset()
          break
        case 'originUrls':
          originUrls.reset()
          break
        case 'all':
          ignoreRequests.reset()
          originUrls.reset()
          break
        default:
          break
      }
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