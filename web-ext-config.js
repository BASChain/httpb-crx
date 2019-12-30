const pkgJson = require('./package.json'),
  projectJson = require('./.config/project.json'),
  path = require('path'),
  dotenv = require('dotenv')

const envArgs = dotenv.config({
  path:path.resolve(process.cwd(),'.config/.env'),
  encoding:'utf8'
})

if(envArgs.error){
  throw envArgs.error
}

//console.log(process.env.WEB_EXT_TARGET)

const gulpPaths = Object.assign({
  APP:"./app",
  BUILD:"./build",
  DEST:"./dist"
},projectJson)

const TARGET = process.env.BUILD_TARGET || 'firefox'

module.exports = {
  verbose: true,
  run:{

  },
  sourceDir:`${gulpPaths.BUILD}/${TARGET}`,
  artifactsDir:`${gulpPaths.DEST}/${TARGET}`
}