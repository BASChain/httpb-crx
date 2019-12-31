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
const ABIS = require('./abi.js')
const NWConfigs = require('./nwconfigs.js')
const { parseBas } = require('./basutils.js')

const Infura = {
  wssSchema:"wss",
  httpSchema:"https",
  projectId:"1362a998079949baaea80eb017fe1f0f",
  defaccAddress:"0xFd30d2c32E6A22c2f026225f1cEeA72bFD9De865",
  insec:"4fed2035cab14c39ae7602bc54e7f297"
}
const DEF_NETWORK = 'ropsten'
class AbiManager {
  constructor(network,opts){
    this.projectId = Infura.projectId

    this.gasPrice = "20000000000"
    if(typeof(network) ==='string' &&(network =='ropsten' || network =='mainnet')){
      this.network = network
    }else{
      this.network = DEF_NETWORK
    }

    if(typeof opts === 'object'){
      this.options = opts;
      this.secret = opts.secret || Infura.secret
    }else if(typeof opts === 'string'){
      this.secret = opts || Infura.secret
    }else{
      this.secret = Infura.insec ||'none'
    }

    _loadContractABI.call(this,this.network)
  }

  getContract(contractName){
    if(!this.Contracts || !this.Contracts[contractName])return null
    return this.Contracts[contractName]
  }

  setGasPrice(gasPrice){
    this.gasPrice = gasPrice
  }

  getContractOptions(from){
    let _form = from ||Infura.defaccAddress
    return {
      from:_form,
      gasPrice:this.gasPrice
    }
  }

  getProvideUrl(type,secret){
    switch(type){
      case "http":
        _providerHttpUrl.call(this)
        break
      case "httpSec":
        _providerSecretHttpUrl.call(this,secret)
        break
      case "wss":
        _providerWssUrl.call(this)
        break
      default:
        _providerSecretHttpUrl.call(this,secret)
        break
    }

    return this.providerUrl
  }
}

function _providerSecretHttpUrl(secrct){
  let _projectId = this.projectId ||Infura.projectId
  let _secret = secrct || this.secret
  let _network = this.network
  this.providerUrl =  `${Infura.httpSchema}://:${_secret}@${_network}.infura.io/v3/${_projectId}`
  return this.providerUrl
}

function _providerHttpUrl(){
  let _projectId = this.projectId || Infura.projectId
  let _network = this.network
  this.providerUrl = `${Infura.httpSchema}://${_network}.infura.io/v3/${_projectId}`
  return  this.providerUrl
}

function _providerWssUrl(){
  _projectId = this.projectId || Infura.projectId
  let _network = this.network
   this.providerUrl = `${Infura.wssSchema}://${_network}.infura.io/ws/v3/${_projectId}`
  return  this.providerUrl
}

function _loadContractABI(network){
  let addresses = NWConfigs[network] || NWConfigs[DEF_NETWORK]
  let Contracts = {}
  Object.keys(addresses).forEach((key) =>{
    Contracts[key] = {
      "address":addresses[key]
    }
    if(ABIS[key])Contracts[key]["abi"] = ABIS[key]
  })

  this.Contracts = Contracts;
}

const promisity = (inner) =>
  new Promise((resolve,reject) => {
    inner((err,data) => {
      if(!err){
        resolve(data)
      }else{
        reject(err)
      }
    })
  });

module.exports = {
  "AbiManager":AbiManager,
  parseBas,
  promisity
}