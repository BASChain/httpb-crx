'use strict'

const pkgJson = require('./package.json'),
  projectJson = require('./.config/project.json'),
	gulp = require('gulp')

const AppName = process.env.APP_NAME || pkgJson.name
const Target = process.env.DEST_TARGET || "chromium"

const gulpPaths = Object.assign({
  APP:"./app",
  BUILD:"./build"
},projectJson)

const browserPlatforms = [
  'firefox',
  'chromium'
]

const commonPlatforms = [...browserPlatforms,]