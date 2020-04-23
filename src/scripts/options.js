
module.exports.optionDefaults = Object.freeze({
  active:true,
  dnsMode:'bas',
  netchain:'ropsten',
  from:'0xFd30d2c32E6A22c2f026225f1cEeA72bFD9De865',
  basDomain:'rdns.baschain.org'
})

/**
 * `storage` browser.storage.local
 */
module.exports.storeLosedOptions = async (read,defaults,storage) => {
  const requiredKeys = Object.keys(defaults)

  const result = {}
  const has = (obj,key) =>Object.prototype.hasOwnProperty.call(obj,key)

  for( const key of requiredKeys ) {
    if(!has(read,key) || read[key] === defaults[key]){
      const data = await storage.get(key)
      if(!has(data,key)){
        result[key] = defaults[key]
      }
    }
  }

  await storage.set(result)
  return result
}