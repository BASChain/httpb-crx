'use strict'

const debug = require('debug')
const log = debug('basexter:main')
log.error = debug('basexter:main:error')

const browser = require('webextension-polyfill')
const { createRuntimeInfo } = require('./runtime-info.js')
const { createRequestModifier, redirectOutHint } = require('./request-modifier.js')
const EnginesParser = require('./engine-parser.js')

const enginesParser = new EnginesParser(false)
module.exports.BasUtils = {
  enginesParser
}


module.exports.BasCompanion = async function init(BasDApp){
  var BasDApp = BasDApp

  var bas //bas
  var state // local cache of various states
  var runtime
  var modifyRequest
  const idleInSecs = 5 * 60

  try{
    runtime = await createRuntimeInfo(browser)
    console.log('createRuntimeInfo')
  }catch(error) {
    log.error('Unable to initilaize addon due to error',error)
    throw error
  }

  function getState (){
    return state
  }

  function registerListeners() {

  }

  const API = {
    get version(){
      return 'api-1.0'
    },
    get state () {
      return state
    },
    get rumtime () {
      return runtime
    }

  }

  return API
}