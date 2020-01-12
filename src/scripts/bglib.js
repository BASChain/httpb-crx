const browser = require('webextension-polyfill')
const { DnsHandler } = require('./dns-parser')

const {Info,BrowerInfo} = require('./runtime/index.js')
global.AppRuntime = Object.assign({},Info,new BrowerInfo(window.navigator.userAgent))
global.AppUtils = {
  DnsHandler:new DnsHandler()
}


function log(...msg){
  if(log.enabled){
    console.log(...msg)
  }
}

log.enabled = true