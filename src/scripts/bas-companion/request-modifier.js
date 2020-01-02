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
  const requestCacheCfg = {max:128,maxAge:1000*60}
  const ignoreRequests = new LRU(requestCacheCfg)
  const ignore = (id) =>ignoreRequests.set(id,true)
  const isIgnored = (id) => ignoreRequests.get(id) !== undefined

  //origin details chrome
  const originUrls = new LRU(requestCacheCfg)
  const basReadyes = new LRU(requestCacheCfg)
  const CheckRedirects = new LRU(requestCacheCfg)
  const Counter = new LRU(requestCacheCfg)

  const GetCount = (id) =>{
    let c = Counter.get(id) || 0;
    Counter.set(id,c+1)
    return Counter.get(id)
  }

  const checkRedirect = (id,alias) => {
    if(typeof alias !== 'undefined'){
      CheckRedirects.set(id,alias)
    }
    return  CheckRedirects.has(id) ?  CheckRedirects.get(id) : null;
  }

  const needRedirect = (id) => CheckRedirects.get(id) !== undefined

  const InitReady = (requestId,ready) => {
    let _ready = Boolean(ready)
    basReadyes.set(requestId,_ready)
    return basReadyes.get(requestId)
  }

  const NotReady = (id) =>{
    return !basReadyes.get(id)
  }




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
      return {cancel:true}
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

      let parsingEngine = getParsingEngine()
      const parseData = parsingEngine.parseUrl(request.url,request.requestId);
      if(preNormalizationSkip(request,parseData)){
        console.log('skip normal')
        return
      }


      if(!parseData || !parseData.alias){

        return
      }

      let _alias = punycode.toASCII(parseData.alias)

      //`http://dns.ppn.one:8053/dns-query?name=${_alias}`
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
            let dat = parsingEngine.parseDNS(res);
            if(dat && dat.length>0){
              console.log('data',dat)
              let reUrl = parsingEngine.buildRedirectUrl(parseData,dat[0].data)
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
/*      const state = getState()
      logTest(request,'onHeadersReceived>>>>')
      let rd = GetRedirectUrl(request.requestId)
      let dnsQuery = "http://dns.ppn.one:8053/dns-query?name=nbs"
      fetch(dnsQuery).then(r => r.text()).then(result =>{
        console.log(result)
      }).catch(err=>{
        console.log(err)
      })
      console.log('onHeadersReceived>>>',rd)
      if(rd)return rd;*/

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