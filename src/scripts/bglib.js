'use strict'

const punycode = require('punycode'),
  base64Url = require('base64url'),
  Web3 = require('web3'),
  { AbiManager,promisity } = require('./bas-contract/index.js'),
  EngineParser = require('./engine-parser/index.js')

global.CommonUtils = {
  punycode,
  base64Url,
  Web3,
  EngineParser
}

class DApp {
  constructor(){
    this.abiManager = new AbiManager('ropsten')
    this.searcherParser = new EngineParser(false)
    this.promisity = promisity
    this.providerUrl = this.abiManager.getProvideUrl('http')
    return this
  }
}

global.BasDApp = new DApp()