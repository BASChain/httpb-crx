'use strict'

//bas ,dns
const DEF_MODE = "bas"


class SearcherParser {
  constructor(isDns) {
    if(isDns){
      this.mode = DEF_MODE
    }else{
      this.mode = "dns"
    }
    this.httpbRule = SearcherParser.HttpbRule
    this.supportEngines = SearcherParser.SupportEngines
  }

  handleURL2Details(details) {
    let json = {
      originUrl:null,
      redirectUrl:null,
      bas:null
    }
    if(typeof(details ==='string' && details.length)){
      json.originUrl = details
    }else if(typeof details === 'object' && details.url){
      json.originUrl = details.url
    }else {
      return json
    }

    let r =null;
    if(this.searchingOff(json.originUrl)){
      r = _parseHttpbURL.call(this,json.originUrl)
    }else{
      r = _parseSearchURL.call(this,json.originUrl)
    }

    return r ? Object.assign(json,r) : json ;
  }

  searchingOff(url){
    return SearcherParser.ValidHttpbRegex.test(url)
  }

  handleRedirectUrl(r,ip){
    if(!r || !r.bas)return r;


  }
}

function _concatRedirectUrl(bas,ip){
  let _ip = ip || bas.ipv4 || bas.ipv6 ||false
  if(_ip)return ''

  let url = SearcherParser.HttpbSchema + _ip
  if(bas.port) url += bas.port
  if(bas.path) url += bas.path
  if(bas.params) url += "?"+bas.params
  if(bas.hash) url += "#"+bas.hash

  return url
}

/**
 * {
 *   originUrl:"",
 *   redirectUrl:"",
 *   bas:{
 *     alias:"",
 *     ip:"",
 *     ipv4:"",
 *     ipv6:"",
 *     bcaddr:"",
 *     "port":""
 *     "domain":"",//dns used
 *   }
 * }
 */
function _parseSearchURL(url) {
  let searchMatches = SearcherParser.SearchRule.exec(url)
  if(!searchMatches || searchMatches.length != 8){
    this.lastError = 'not matched search engines.'
    return null
  }

  if(!searchMatches[3] || !searchMatches[6]){
    this.lastError = 'not httpb protocol'
    return null
  }

  let sDomain = searchMatches[3]
  let sParamsString = searchMatches[6]
  let enginer = SearcherParser.SupportEngines.filter(en => en.domain.test(sDomain))

  if(enginer.length !=1){
    this.lastError = 'multi matched search engines.'
    return null
  }

  let params = sParamsString.split(/\&/)
    .filter(s => decodeURIComponent(s).match(enginer[0].sKey))

  if(params.length < 1 ||
    !SearcherParser.ValidHttpbRegex.test(decodeURIComponent(params[0]))){
    this.lastError = 'not matched httpb protocol'
    return null
  }
  let encodeHttbUrl = params[0].substring(enginer[0].keyLen)
  let r ={
    isHttpb:false,
    encodeHttbUrl:encodeHttbUrl,
    bas:{
      decodeHttbUrl:decodeURIComponent(encodeHttbUrl)
    }
  }

  let basMatches = SearcherParser.HttpbRule.exec(r.bas.decodeHttbUrl)
  if(!basMatches || basMatches.length !=8 ){
    this.lastError = 'not matched https protocol'
    return null
  }

  r.isHttpb = true
  r.bas.alias = basMatches[3]
  r.bas.port = basMatches[4] || ''
  r.bas.path = basMatches[5] || ''
  r.bas.params = basMatches[6] || ''
  r.bas.hash = basMatches[7] || ''

  return r
}

function _parseHttpbURL(url) {
  let r = {
    isHttpb:false,
    encodeHttbUrl:url,
    bas:{
      decodeHttbUrl:decodeURIComponent(url)
    }
  }
  let basMatches = SearcherParser.HttpbRule.exec(r.encodeHttbUrl)
  if(!basMatches || basMatches.length !=8 ){
    this.lastError = 'not matched https protocol'
    return null
  }

  if(!basMatches[3] || !basMatches[3].length){
    this.lastError = 'not matched https protocol'
    return null
  }

  r.isHttpb = true
  r.bas.alias = basMatches[3]
  r.bas.port = basMatches[4] ||''
  r.bas.path = basMatches[5] || ''
  r.bas.params = basMatches[6]||''
  r.bas.hash = basMatches[7]||''

  return r
}


SearcherParser.ValidHttpbRegex = /^httpb:\/\/.*$/
SearcherParser.HttpbSchema = "httpb://"
SearcherParser.HttpSchema = "http://"
SearcherParser.SearchRule = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/
SearcherParser.HttpbRule = /^(?:([A-Za-z]+):)?(\/{0,3})([^?#:/]*)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/

SearcherParser.SupportEngines = [
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


module.exports = SearcherParser