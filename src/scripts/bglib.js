const _$ = require('jquery')
const basCompanion = require('./bas-companion.js')
const { Info , BrowerInfo } = require('./runtime')

if(!window.$ || !window.jQuery){
  global.$ = global.jQuery = _$
}

function log(...msg){
  if(log.enabled){
    console.log(...msg)
  }
}

log.enabled = true

global.Log = log

class Basexer {
  constructor(){
    _basexerInit.call(this)
  }

  reloadCompanion(){
    _initCompanion.call(this)
  }
}

function _basexerInit(){
  let keys = Object.keys(Info)

  for(var i = 0;i<keys.length;i++){
    let key = keys[i]
    if(typeof Info[key] !== 'undefined')this[key]=Info[key]
  }

  this.BwInfo = new BrowerInfo()
}

async function _initCompanion(){
  this.state = 0;
  try{
    this.basCompanion = await basCompanion();
    this.state = 1;
  }catch(e){
    Log(e.message)
    this.state = -1
  }
}


global.basexer = new Basexer();
global.basexer.reloadCompanion()