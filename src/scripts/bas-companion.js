const browser = require('webextension-polyfill')
const { EngineHandler,DohHandler } = require('./parsing-engine')

const { createRuntimeInfo } = require('./runtime')

const punycode = require('punycode')


async function init(opts){
  const engineHandlerInst = new EngineHandler()
  const dohHandlerInst = new DohHandler()
  var runtime

  try{
    runtime = await createRuntimeInfo(browser)

    registerListeners()
  }catch(error){
    Log(error.message)
    throw error
  }

  function registerListeners(){
    const beforeSendInfoSpec = ['blocking','requestHeaders']
    const requestUrlFilter = { urls: ['http://*/*','https://*/*'],types:['main_frame'] }
    const requestUrlTypesFilter = { urls: ['<all_urls>'] ,types:['main_frame']}

    if(browser.webRequest.onBeforeSendHeadersOptions &&
      'EXTRA_HEADERS' in browser.webRequest.onBeforeSendHeadersOptions) {
      //Chrome 72+
      beforeSendInfoSpec.push('extraHeaders')
    }

    browser.webRequest.onBeforeRequest.addListener(
      OnBeforeRequest,
      requestUrlTypesFilter,
      ['blocking',"extraHeaders", "requestBody"]
    )
  }

  /* ===================================== */
  function OnBeforeRequest (details) {
    console.log(JSON.stringify(details,null,2));
    const engineInst = getParsingInst()
    const dohInst = getDohHandler()
    const searchData = engineInst.parseUrl(details.url,details.requestId)
    if(!searchData || !searchData.alias ||!searchData.matched) return
    console.log(JSON.stringify(searchData,null,2));
    let _alias = punycode.toASCII(searchData.alias)

    let queryURL = dohInst.getQueryUrl(_alias)
    console.log('DNS url>',queryURL)

    let respData = QueryDns(queryURL)

    if(!respData){
      return
    }else{
      let respIPOrAlias = dohInst.parseData(respData)
      if(!respIPOrAlias)return
      let redUrl = engineInst.buildRedirectUrl(searchData,respIPOrAlias)
      return {redirectUrl:redUrl}
    }

  }

  /* ===================  ================== */
  function QueryDns(queryURL){
    let result = ''
    $.ajax({
      type:"GET",
      url:queryURL,
      dataType:"json",
      async:false,
      success:function(res) {
        console.log(res)
        if(!res || res.Status != 0 || !res.Answer)
          return false
        result = res;
      },
      error:function(err){
        console.error(err)
        result = false
      }
    })

    return result;
  }

  function getParsingInst(){
    return engineHandlerInst
  }

  function getDohHandler() {
    return dohHandlerInst
  }
}





module.exports = init