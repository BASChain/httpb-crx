'use strict'
const isFQDN = require('is-fqdn')


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

class ParsingEngine {
  /**
   * @DateTime 2019-12-07
   * @param    {Enum}   dnsPloy : 0 ip only /1: ip first /2:dns first
   */
  constructor(dnsPloy){
    this.supportEngines = ParsingEngine.SupportEngines
    this.httpbRule = ParsingEngine.HttpbRule
    this.engineRule = ParsingEngine.SearchRule
    this.dnsPloy = (dnsPloy >= 0 && dnsPloy < 3 ) ? dnsPloy : 0;
    this.dohDomain = ParsingEngine.DoHDomain
    this.dohPort = ParsingEngine.DoHPort
  }

  //return parseJson
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

  buildRedirectUrl(json,ip) {
    if(!json || !json.alias || !json.subHttpb)return false;
    if(!this.dnsPloy){
      if(!ip)return false;
      return _handleRedirectUrl(json,ip)
    }else if(this.dnsPloy == 1){
      let _domain = isFQDN(json.alias) ? json.alias : ''
      if(ip)_domain = ip
      return _handleRedirectUrl(json,_domain)
    }else if(this.dnsPloy == 2){
      let _domain = isFQDN(json.alias) ? json.alias : ip
      return _handleRedirectUrl(json,_domain)
    }else{
      return false;
    }
    return _handleRedirectUrl(json,ip)
  }

  validHttpb(url){
    return ParsingEngine.ValidHttpbRegex.test(url)
  }

  getQueryDns(alias) {
    let url = `${ParsingEngine.HttpSchema}${this.dohDomain}:${this.dohPort}/dns-query?name=${alias}`
    return url
  }

  parseDns(result) {
    return _parseDNS.call(this,result)
  }
}

function _parseDNS(result){
  //Status 0 ,Answer Answer.type=1 (IP)
  if(result.Status != 0 || !result.Answer) return null;
  return result.Answer.filter(item => item.type == 1)
}

//ip :ip or domain(alias need punycode)
function _handleRedirectUrl (json,ip){
  if(typeof ip === 'undefined')return false;
  let bas = json.subHttpb
  let _url = ParsingEngine.HttpSchema + ip;

  if(bas.port) _url += ":" + bas.port
  if(bas.path) _url += "/" + bas.path
  if(bas.params) _url += "?"+bas.params
  if(bas.hash) _url += "#"+bas.hash

  return _url
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

  subHttpb.isFqdn = isFQDN(r.alias)

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

  r.subHttpb.isFqdn = isFQDN(r.alias)

  return r
}

ParsingEngine.ValidHttpbRegex = /^httpb:\/\/.*$/
ParsingEngine.HttpbSchema = "httpb://"
ParsingEngine.HttpSchema = "http://"
ParsingEngine.SearchRule = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/
ParsingEngine.HttpbRule = /^(?:([A-Za-z]+):)?(\/{0,3})([^?#:/]*)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/
ParsingEngine.DoHDomain = "dns.ppn.one"
ParsingEngine.DoHPort = 8053

ParsingEngine.SupportEngines = [
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

module.exports = ParsingEngine