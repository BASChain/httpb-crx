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
const NWConfigs = {
  "ropsten":{
    "BAS_Token":"0x3058A7Ed6a0E15691F9e309cbe982A820928e055",
    "BAS_Manager_Simple":"0x70BACAb31f1897dAFECa711475Fa81Fe49e5e04C"
  },
  "mainnet":{
    "BAS_Token":"0x3058A7Ed6a0E15691F9e309cbe982A820928e055",
    "BAS_Manager_Simple":"0x70BACAb31f1897dAFECa711475Fa81Fe49e5e04C"
  }
}

const DEF_NETWORK = 'ropsten'
class AbiManager {
  constructor(network){
    this.gasPrice = "20000000000"
    if(typeof(network) ==='string' &&(network =='ropsten' || network =='mainnet')){
      this.network = network
    }else{
      this.network = DEF_NETWORK
    }

    _loadContractABI.apply(this,this.network)
  }

  getContract(contractName){
    if(!this.Contracts || !this.Contracts[contractName])return null
    return this.Contracts[contractName]
  }

  setGasPrice(gasPrice){
    this.gasPrice = gasPrice
  }

  getContractOptions(from){
    return {
      from:from,
      gasPrice:this.gasPrice
    }
  }
}

function _loadContractABI(network){
  let addresses = NWConfigs[network] || NWConfigs[DEF_NETWORK]
  let Contracts = {}
  Object.keys(addresses).forEach((key) =>{
    Contracts[key] = {
      "address":addresses[key]
    }
    if(ABIS[key])Contracts[key][abi] = ABIS[key]
  })

  this.Contracts = Contracts;
}

const InfuraHandler = {
  projectId:"1362a998079949baaea80eb017fe1f0f",

}




module.exports = {
  "AbiManager":AbiManager
}