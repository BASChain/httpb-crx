/**
 *     ____  ___   _____
 *    / __ )/   | / ___/
 *   / __  / /| | \__ \
 *  / /_/ / ___ |___/ /
 * /_____/_/  |_/____/
 *
 * Copyright (c) 2019 BAS,orchid2ev
 * E-mail :dev-fronter@gmail.com
 * git@flash:BASChain/httpb-crx.git
 *
 */
'use strict'
window.LiveReloadOptions = {host:'localhost',port:"36489"}

var lastReload = false;

var Conn = new WebSocket('ws://'+LiveReloadOptions.host +':'+LiveReloadOptions.port +'/livereload')

chrome.runtime.onInstalled.addListener(function(details){
  lastReload = new Date()
})

Conn.onerror = function(error) {

}

Conn.onmessage = function(e) {
  if(e.data){
    let data = JSON.parse(e.data);
    if(data && data.command ==='reload'){
      let currentTime = Date.now()
      if(lastReload && currentTime - lastReload > 30000) {
        chrome.runtime.reload()
        chrome.developerPrivate.reload(chrome.runtime.id, {failQuietly: true});
      }

    }
  }
}