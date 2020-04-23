const Networks = [
  {chainId:1,name:'mainnet',state:true,dns:'mdns.baschain.org'},
  {chainId:3,name:'ropsten',state:true,dns:'rdns.baschain.org'},
  {chainId:4,name:'rinkeby',state:false,dns:'rdns.baschain.org'},
  {chainId:5,name:'goerili',state:false,dns:'gdns.baschain.org'},
  {chainId:42,name:'kovan',state:false,dns:'kdns.baschain.org'},
]

/**
 * @DateTime 2019-11-23
 * @param    {[type]}   chainId [description]
 * @return   {[type]}           [description]
 */
function getNetwork(chainId){
  let nw = Networks.find(item => item.chainId === parseInt(chainId) && item.state )
  if(!nw) nw = Networks.find(item => item.chainId === 3 )

  return nw;
}

module.exports = {
  networks:Networks.filter(item => item.state),
  getNetwork
}