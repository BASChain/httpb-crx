# httpb-crx

    try{

      let s = sur + "nbs."+Math.random(10)
      //let data = await promisity(cb => basDApp.basManager.methods.queryByString(s).call(cb));
      // console.log("dataResult>>>>",data);

      console.log('>>>bas>>',request.requestId)

       Promise((resolve,reject)=>{
          fetch(s).then(r=>r.text()).then(result=>{
            console.log(result,">>>>>",_redirectUrl)


          })
      })

      //return {redirectUrl:_redirectUrl}
      }catch(e){
      console.log(e.message);
      //return {}
      }


    console.log('>>async',JSON.stringify(request))
/*    return new Promise((resolve,reject) =>{
      console.log('>>async>>>>60000')
      window.setTimeout(()=>{
        return resolve({redirectUrl:"http://www.baidu.com"})
      },60000)
    })*/

    let sur = "http://dns.ppn.one:8053/dns-query?name="




    for(var i=0;i<1000;i++){
      window.setTimeout(function(){
        console.log('>>>>>>>>>>>>>>>',i)
      },2000)
    }