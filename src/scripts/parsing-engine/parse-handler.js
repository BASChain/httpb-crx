
'use strict'

/**
 * Object JSON Model
 * {
 *   interceptUrl: webRequest intercept url
 *   alias: domain or bas alias,
 *   engine:'',//google,baidu,none
 *   redirectUrl:"",
 *   httpbEnUrl: sub of interceptUrl or null
 *   subHttpb:{
 *     deUrl:
 *     path:
 *     params,
 *     hash,
 *     isFqdn:is tradition domain
 *   }
 *   bas:{} // bas
 * }
 */
class EngineHandler {

  constructor() {
    this.supportEngines = EngineHandler.SupportEngines
    this.httpbRule = EngineHandler.HttpbRule
    this.engineRule = EngineHandler.SearchRule
  }

  parseUrl(url,requestId){
    if(!url)return {
      matched:false
    }
    let json = {
      matched:false,
      interceptUrl:url,
      redirectUrl:""
    }
    if(typeof requestId !== 'undefined'){
      json.requestId = requestId
    }

    if(this.validHttpb(url)){
      json.engine = 'none'
      json = Object.assign(json,_parseNoEngineURL.call(this,url))
    }else{
      json = Object.assign(json,_parseEngineURL.call(this,url))
    }

    return json;
  }

  validHttpb(url){
    return EngineHandler.ValidHttpbRegex.test(url)
  }

  buildRedirectUrl(parseData,alias) {
    let bas = parseData.subHttpb
    let _url = EngineHandler.HttpSchema + alias

    if(bas.port) _url += ":" + bas.port
    if(bas.path) _url += "/" + bas.path
    if(bas.params) _url += "?"+bas.params
    if(bas.hash) _url += "#"+bas.hash
    return _url
  }
}

function _parseEngineURL(url){
  let r = {
    matched:false
  }
  let searchMatches = this.engineRule.exec(url)
  if(!searchMatches || searchMatches.length <7
    || !searchMatches[3] || !searchMatches[6]){
    this.lastError = 'not match searching httpb protocol'
    return r
  }

  let sDomain = searchMatches[3],
    sParamsString = searchMatches[6]

  let enginer = this.supportEngines.filter(en => en.domain.test(sDomain))
  if(enginer.length != 1){
    this.lastError = 'not matched searching engines'
    return r
  }

  let params = sParamsString.split(/\&/)
    .filter(s => decodeURIComponent(s).match(enginer[0].sKey))

  if(params.length < 1 ||
    !this.validHttpb(decodeURIComponent(params[0].substring(enginer[0].keyLen)))){
    this.lastError = 'not matched httpb protocol'
    return r
  }

  let encodeHttbUrl = params[0].substring(enginer[0].keyLen)
  r.httpbEnUrl = encodeHttbUrl
  let subHttpb = {
    deUrl:decodeURIComponent(encodeHttbUrl)
  }

  let subMatches = this.httpbRule.exec(subHttpb.deUrl)

  if(!subMatches || subMatches.length != 8 || subMatches[3] == null ){
    this.lastError = 'not matched httpb protocol'
    return r
  }
  r.engine = enginer[0].name
  r.matched = true
  r.alias = subMatches[3]
  subHttpb.port = subMatches[4] ||''
  subHttpb.path = subMatches[5] ||''
  subHttpb.params = subMatches[6] ||''
  subHttpb.hash = subMatches[7] ||''

  r.subHttpb = subHttpb

  return r
}

function _parseNoEngineURL(url){
  let r = {
    httpbEnUrl:url,
    subHttpb:{
      deUrl:decodeURIComponent(url)
    }
  }
  let basMatches = this.httpbRule.exec(r.subHttpb.deUrl)
  if(!basMatches || basMatches.length != 8){
    this.lastError = 'not matched https protocol'
    return r
  }

  if(basMatches[3]==null || !basMatches[3].length){
    this.lastError = 'not matched https protocol,mybe no alias'
    return r
  }

  r.matched = true
  r.alias = basMatches[3]
  r.subHttpb.port = basMatches[4] ||''
  r.subHttpb.path = basMatches[5] ||''
  r.subHttpb.params = basMatches[6] ||''
  r.subHttpb.hash = basMatches[7] ||''

  return r
}

EngineHandler.ValidHttpbRegex = /^httpb:\/\/.*$/
EngineHandler.HttpbSchema = "httpb://"
EngineHandler.HttpSchema = "http://"
EngineHandler.SearchRule = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/
EngineHandler.HttpbRule = /^(?:([A-Za-z]+):)?(\/{0,3})([^?#:/]*)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/

EngineHandler.SupportEngines = [
  {
    "name":"google",
    "domain":/^www.google.com$/,
    "sKey":/^q=httpb:\/\/.+$/g,
    "keyLen":2
  },
  {
    "name":"baidu",
    "domain":/^www.baidu.com$/,
    "sKey":/^wd=httpb:\/\/.+$/g,
    "keyLen":3
  },
  {
    "name":"bing",
    "domain":/^[a-z]+.bing.com$/,
    "sKey":/^q=httpb:\/\/.+$/g,
    "keyLen":2
  },
  {
    "name":"sogou",
    "domain":/^www.sogou.com$/,
    "sKey":/^query=httpb:\/\/.+$/g,
    "keyLen":6
  },
  {
    "name":"360",
    "domain":/^www.so.com$/,
    "sKey":/^q=httpb:\/\/.+$/g,
    "keyLen":2
  }
]

module.exports = EngineHandler