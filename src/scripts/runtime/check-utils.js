/**
 *     ____  ___   _____
 *    / __ )/   | / ___/
 *   / __  / /| | \__ \
 *  / /_/ / ___ |___/ /
 * /_____/_/  |_/____/
 *
 * Copyright (c) 2019 BAS,dev-fronter
 * E-mail :dev-fronter@gmail.com
 * git@flash:BASChain/httpb-crx.git
 *
 */
'use strict'

/**
 * @DateTime 2019-12-25
 * @param    {object}   browser
 * @return   {Object json}
 */
function getBrowserInfo(browser) {
  if(browser && browser.runtime && browser.runtime.getBrowserInfo) {
    return browser.runtime.getBrowserInfo()
  }
  return Promise.resolve({})
}

function getPlatFormInfo(browser) {
  if(browser && browser.runtime && browser.runtime.getPlatFormInfo){
    return browser.runtime.getPlatFormInfo()
  }
  return Promise.resolve()
}

function hasChromeSocketsForTCP() {
  return typeof chrome === 'object' &&
    typeof chrome.runtime === 'object' &&
    typeof chrome.runtime.id === 'string' &&
    typeof chrome.sockets === 'object' &&
    typeof chrome.sockets.tcpServer === 'object' &&
    typeof chrome.sockets.tcp === 'object'
}

async function createRuntimeInfo (browser) {
  const {name,version} = await getBrowserInfo(browser)

  const isFirefox = name && (name.includes('Firefox') || name.includes('Fennec'))

  const hasNativeProtocolHandler = !!(browser && browser.protocol && browser.protocol.registerStringProtocol)

  const platformInfo = await getPlatFormInfo(browser)
  const isAndroid = platformInfo ? platformInfo.os === 'android' : false

  return Object.freeze({
    browser,
    isFirefox,
    isAndroid,
    isBrave:hasChromeSocketsForTCP(),
    requireXHRCORSfix:!!(isFirefox && version && version.startsWith('68')),
    hasChromeSocketsForTCP:hasChromeSocketsForTCP(),
    hasNativeProtocolHandler
  })
}

module.exports = {
  createRuntimeInfo,hasChromeSocketsForTCP
}