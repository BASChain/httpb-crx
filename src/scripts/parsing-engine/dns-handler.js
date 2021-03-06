'use strict'

const DEF_DOH_DOMAIN = 'http://dns.ppn.one:8053/dns-query?name=nbs'
const TRA_TYPE = 10
const TRA_DATA = "TraditionSystemName"
const {getNetwork} = require('../abi-manager/networks.js')

const IsIPv4OrIPv6 = (ip) => {
  return /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/.test(ip)
}
class DohHandler {
  constructor(opts){
    _initDohHandler.call(this,opts)
  }

  getQueryUrl (alias){
    //punycode transfer
    const dnsQuery = `${this.QSchema}://${this.QDomain}:${this.QPort}/dns-query?name=`

    return dnsQuery + alias
  }

  setQDomain(chainId){
    if(!chainId)chainId = 3
    const nw = getNetwork(chainId)
    this.QDomain = nw.dns;
    console.log('new QueryDns:',`${this.QSchema}://${this.QDomain}:${this.QPort}/dns-query?name=`)
  }

  parseData(json) {
    if(!json || json.Status != 0)return false

    let origin = QuestionName(json.Question[0].name.toString())
    let answer = json.Answer

    if(!json.Answer) return false;

    //alias name
    if(isAliasName(json.Answer)){
      return answer[0].data
    }

    /**
     * Tradition Domain
     */
    let tradResults = json.Answer.filter(item => IsTraditionDomain(item))
    if(tradResults.length > 0){
      return origin
    }

    let resultArr = json.Answer.filter(item => IsIPv4OrIPv6(item.data))
    if(resultArr.length==0)return false

    return resultArr[0].data
  }
}

const QuestionName = (name) => {
  return name.endsWith('.') ? name.substring(0,name.length-1) : name
}

function isAliasName(answer){
  if(!answer||!answer.length){
    return false
  }

  return answer.find(item => item.type == 10 && item.data === 'AliasName') ? true : false;
}

/**
 * 10 ,
 * @DateTime 2020-04-03
 * @param    {[type]}   item [description]
 * @return   {[type]}        [description]
 */
const IsTraditionDomain = (item) => {
  return item && item.type == TRA_TYPE && item.data == TRA_DATA
}

function _initDohHandler(opts){
  this.QSchema = 'http'
  this.QDomain = 'extdns.ppn.one'
  this.QPort = 8053
  this.QPreUri = `${this.QSchema}://${this.QDomain}:${this.QPort}/dns-query?name=`
  this.isMatch = (ip) =>{return IPv46Regex.test(ip)}
}



module.exports = DohHandler