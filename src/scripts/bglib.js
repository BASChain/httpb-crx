'use strict'

const browser = require('webextension-polyfill'),
  punycode = require('punycode'),
  base64Url = require('base64url'),
  Web3 = require('web3'),
  { AbiManager, parseBas, promisity } = require('./bas-contract/index.js'),
  { storeLosedOptions , optionDefaults } = require('./options.js')


const { BasCompanion , BasUtils } = require('./bas-companion/index.js')


function log(...msg){
  if(log.enabled){
    console.log(...msg)
  }
}

log.enabled = true

global.promisity = promisity

global.BasUtils = BasUtils
global.CommonUtils = {
  log,
  punycode,
  base64Url,
  Web3,
  browser
}

class DApp {
  constructor(){
    this.promisity = promisity
    this.parseBasResult = parseBas

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
const FilterArgs = {
  urls:[
    '<all_urls>'
  ]
}

async function _initWeb3() {
  try{
    await storeLosedOptions(
      await browser.storage.local.get(),
      optionDefaults,
      browser.storage.local
    )

    const options = await browser.storage.local.get(optionDefaults)
    console.log(JSON.stringify(options,null,2))

    let _abiManager = new AbiManager(options.netchain)
    this.abiManager = _abiManager
    let _url = this.abiManager.getProvideUrl('http')
    console.log('provider',_url)
    let _web3;
    this.web3 = _web3 = await new Web3(new Web3.providers.HttpProvider(_url))
    this.version = this.web3.version;
    let _MGR = this.abiManager.getContract('BAS_Manager_Simple')
    let _OPTS = this.abiManager.getContractOptions(options.from) //from
    this.basManager = new _web3.eth.Contract(_MGR.abi,_MGR.address,_OPTS)

    global.basCompanion = await BasCompanion(this,options)
    // browser.webRequest.onBeforeRequest.addListener(onBeforeRequest,FilterArgs,['blocking'])

    // browser.webRequest.onHeadersReceived.addListener(onHeadersReceived, { urls: ['<all_urls>'] }, ['blocking', 'responseHeaders'])
    // browser.webNavigation.onCommitted.addListener(OnCommitted,{urls:['<all_urls>']})
    // browser.webNavigation.onDOMContentLoaded(OnDOMContentLoadedHandler)

  }catch(e){
    this.lastError = e.message;
    console.error(e)
  }
}

/* ++++++++++ TEMP +++++++++ */

function onBeforeRequest (details) {
  console.log('>>>onBeforeRequest')
  console.log(JSON.stringify(details,null,2))
}

function onHeadersReceived (details) {
  console.log('>>>onHeadersReceived')
  console.log(JSON.stringify(details,null,2))
}

function OnCommitted(details) {
  console.log('>>>OnCommitted')
  console.log(JSON.stringify(details,null,2))
  setTimeout(function(){
    console.log('>>>wait')
  },10000)
}

function OnDOMContentLoadedHandler (details) {
  console.log('>>>OnDOMContentLoadedHandler')
  console.log(JSON.stringify(details,null,2))
}

function navOnDOMContentLoadedFilter(){
  return {
    urls:[
      '*://*/*',
      "https://*/*",
      "http://*/*"
    ],
    types:['main_frame']
  }
}

_initWeb3.call(new DApp())