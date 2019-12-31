'use strict'

function parseBas(dataArr) {
  if(!dataArr || dataArr.length < 5 )return null;

  let json = {
    "nofund":true,
    "bastype":'unknow',
    "aliashash":dataArr[0]
  }
  if(!dataArr[5] || parseInt(dataArr[5]) == 0)return json;
  json.nofund = false
  json.owner = dataArr[5]


  if(!(/^(0x)?[0]{64}$/.test(dataArr[4]))) json.bastype = "BCAddress"
  if(parseInt(dataArr[1]) !=0 || parseInt(dataArr[2]) !=0)json.bastype = "IP"

  json.ipv4 = transHex2IPv4(dataArr[1])
  json.ipv6 = transHex2IPv6(dataArr[2])
  json.bcaddr = transHex2BCA(dataArr[4],dataArr[3])

  return json;
}

function transHex2IPv4 (hex) {
  if(hex.length < 8 || hex.length > 10)return hex
  if(hex.startsWith('0x'))hex = hex.substring(2)

  let temints = [4]
  for(var i = 0; i < 4 ; i++){
    temints[i] = parseInt(hex.substring(i*2,(i+1)*2),16)
  }

  return temints.join('.')
}

function transHex2IPv6(hex) {
  if(hex.length < 32 || hex.length > 34)return hex
  if(hex.startsWith('0x'))hex = hex.substring(2)

  let temints = [8]
  for(var j = 0; j < 8; j++) {
    temints[j] = hex.substring(j*4,(j+1)*4)
  }

  return temints.join(':')
}

function transHex2BCA(bchex,lenhex) {
  if(!bchex || !lenhex)return ''
  if(lenhex.startsWith('0x'))lenhex = lenhex.substring(2)
  if(bchex.startsWith('0x'))bchex = bchex.substring(2)

  let len = parseInt(lenhex,16)

  return bchex.length > len ? bchex.substring(0,len) : bchex
}

module.exports = {
  parseBas
}