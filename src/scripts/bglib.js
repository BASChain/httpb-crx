const {Info,BrowerInfo} = require('./runtime/index.js')
global.AppRuntime = Object.assign({},Info,new BrowerInfo(window.navigator.userAgent))