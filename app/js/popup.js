'use strict'
//bas,dns
const BAS_MODE = "BAS"
const DNS_MODE = "DNS"

const AppSettings = {
  "ExtName":"BAS",
  "Version":"1.0.0"
}
upAppInfo();


angular.module('p3OptionsApp',[]).controller('p3Ctrl',['$scope',function($s){
  var storage = chrome.storage.local;

  $s.mode = BAS_MODE
  $s.extVersion = AppSettings.Version
  $s.extName = AppSettings.ExtName
  $s.networks = CommonUtils.networks
  //$s.chainId = basexer.Storage.get('chainId')

  storage.get({chainId:''},function(obj){
    console.log('get from storage',obj)
    $s.chainId = obj.chainId
    $s.$apply()
  })

  $s.networkChange = function(){
    const networkId = $s.chainId
    console.log('Current chainId:',networkId);
    storage.set({chainId:networkId},function(){
      console.log('Update local storage chainId',networkId)
    })
  }

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