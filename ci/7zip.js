const pkgJson = require('../package.json'),
  projectJson = require('../.config/project.json'),
  dotenv = require('dotenv'),
  path = require('path'),
  shell = require('shelljs'),
  zip = require('bestzip')

const envArgs = dotenv.config({
  path:path.resolve(process.cwd(),'.config/.env'),
  encoding:'utf8'
})

if(envArgs.error){
  throw envArgs.error
}
const NODE_ENV = process.env.NODE_ENV || 'development'
const AppName = process.env.APP_NAME || pkgJson.name
const Target = process.env.DEST_TARGET || "chromium"
const AppVersion = process.env.APP_VER || pkgJson.version

const BASE_DIR = process.cwd()

const gulpPaths = Object.assign({
  APP:"./app",
  BUILD:"./build",
  DEST:"./dist",
  CONFIG:".config"
},projectJson)

Dest7zip()

function Dest7zip() {
  let srcDir = `${gulpPaths.BUILD}/${Target}`
  let zipName = isDevelopmentMode() ? `pre-${AppName}-${AppVersion}.zip` : `${AppName}-${AppVersion}-${Target}.zip`
  let DEST_FILE = path.join(BASE_DIR,gulpPaths.DEST,Target,zipName)
  console.log(DEST_FILE)
  shell.cd(srcDir)
  let opt = {
    source:'*',
    destination:DEST_FILE
  }

  zip(opt).then(()=>{
    console.log('Zip Completed.',DEST_FILE);
    shell.cd(BASE_DIR)
  }).catch((e)=>{
    console.error(e)
    shell.cd(BASE_DIR)
  })
}

function isDevelopmentMode(){
  return NODE_ENV == 'development'
}