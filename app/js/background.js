'use strict'

// const DApp = {
//   abiManager:new AbiManager('ropsten'),
//   searcherParser:new EngineParser(false),
//   init:async ()=>{
//     try{
//       let _providerUrl = DApp.abiManager.getProvideUrl('http')
//       DApp.web3 = await new Web3(Web3.providers.HttpProvider(_providerUrl))
//       let _MGR = DApp.abiManager.getContract('BAS_Manager_Simple')
//       let _OPTS = DApp.abiManager.getContractOptions() //from

//       DApp.BasManager = await new DApp.web3.eth.Contract(_MGR.abi,_MGR.address,_OPTS)

//       DApp.state = 'completed'
//     }catch(e){
//       console.error(e)
//       DApp.state = false;
//     }

//     return this;
//   },
//   queryDNS:async (alias) =>{
//     let result = false;
//     if(typeof alias ==='undefined' || DApp.BasManager) return Promise.reject(false);
//     return new Promise((resolve,reject)=>{
//       DApp.BasManager.methods.queryByString(alias).call((err,data)=>{
//         if(!err){
//           resolve(data)
//         }else{
//           reject(err)
//         }
//       })
//     })
//   }
// }