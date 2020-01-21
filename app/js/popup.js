'use strict'
//bas,dns
const BAS_MODE = "BAS"
const DNS_MODE = "DNS"

const AppSettings = {
  "ExtName":"Basexer",
  "Version":"0.0.4"
}
upAppInfo();


angular.module('p3OptionsApp',[]).controller('p3Ctrl',['$scope',function($s){
  var storage = chrome.storage.local;
  storage.set({"enable_bas":false})
  $s.mode = BAS_MODE
  $s.extVersion = AppSettings.Version
  $s.extName = AppSettings.ExtName

  storage.get({"enable_bas":false},function(obj){
    //console.log('mode',JSON.stringify(obj,null,2))
    $s.mode = 'v0.0.4'
    $s.$apply()
  })



/*  $s.chanageMode = function(){
    storage.get({"enable_bas":false},function(obj) {
      storage.set({"enable_bas" : !obj["enable_bas"] })
      $s.mode = (!obj["enable_bas"]) ? BAS_MODE : DNS_MODE
      //console.log('>>>',$s.mode)
      $s.$apply();
    })
  }*/
}]);

function upAppInfo(){
  if(chrome && chrome.runtime && chrome.runtime.getManifest){
    if(chrome.runtime.getManifest().version){
      AppSettings.Version =  chrome.runtime.getManifest().version
    }
    if(chrome.runtime.getManifest().name){
      AppSettings.ExtName = chrome.runtime.getManifest().name
    }
  }
}