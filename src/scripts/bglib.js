'use strict'

function log(...msg){
  if(log.enabled){
    console.log(...msg)
  }
}

log.enabled = true

const punycode = require('punycode'),
  base64Url = require('base64url'),
  Web3 = require('web3'),
  { AbiManager, parseBas, promisity } = require('./bas-contract/index.js'),
  EngineParser = require('./engine-parser/index.js')

global.promisity =promisity
global.CommonUtils = {
  log,
  punycode,
  base64Url,
  Web3,
  EngineParser
}

class DApp {
  constructor(){
    this.parseBasResult = parseBas
    let _abiManager = new AbiManager('ropsten')
    this.abiManager = _abiManager
    this.searcherParser = new EngineParser(false)
  }

  loadContractInst(name,inst){
    this[name] = inst
  }

  getMgrInst(){
    return this.BAS_Manager_Simple || null
  }

  getInst(name){
    return this[name]
  }

  getState(){
    if(this.web3 && this.basManager)
      return 'completed.'
    return false
  }
}

async function _initWeb3() {
  try{
    let _url = this.abiManager.getProvideUrl('http')
    console.log('provider',_url)
    let _web3;
    this.web3 = _web3 = await new Web3(new Web3.providers.HttpProvider(_url))
    this.version = this.web3.version;
    let _MGR = this.abiManager.getContract('BAS_Manager_Simple')
    let _OPTS = this.abiManager.getContractOptions() //from
    this.basManager = new _web3.eth.Contract(_MGR.abi,_MGR.address,_OPTS)
  }catch(e){
    this.lastError = e.message;
    console.error(e)
  }
}

const inst = new DApp();
_initWeb3.call(inst)

global.BasDApp = inst;