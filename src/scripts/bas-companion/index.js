'use strict'

const debug = require('debug')
const log = debug('basexter:main')
log.error = debug('basexter:main:error')

const browser = require('webextension-polyfill')
const { createRuntimeInfo } = require('./runtime-info.js')
const { } = require('./request-modifier.js')



module.exports = async function init(){
  var bas //bas
  var state // local cache of various states
  var rumtime
  var modifyRequest
  const idleInSecs = 5 * 60

  try{
    rumtime = await createRuntimeInfo(browser)

  }catch(error) {
    log.error('Unable to initilaize addon due to error',error)
    throw error
  }

  function getState (){
    return state
  }

  function registerListeners() {

  }

}