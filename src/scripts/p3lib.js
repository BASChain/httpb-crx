'use strict'

const base64Url = require('base64url'),
  Web3 = require('web3')
const browser = require('webextension-polyfill')
const { networks, getNetwork } = require('./abi-manager/index.js')
const {Info , Storage ,BrowerInfo , BindThisProperties} = require('./runtime')

class BasexerP3 {
  constructor(browser){
    BindThisProperties.call(this,Info)
    this.BwInfo = new BrowerInfo()
    if(browser)this.runtime = browser.runtime
    this.Storage = Storage
  }
}

global.basexer = new BasexerP3(browser)

global.CommonUtils = {
  Web3,
  base64Url,
  networks,
  getNetwork
}