const browserify = require('browserify'),
path = require('path')

var b = browserify()

const rtjs = './src/lib/runtime-info.js'
console.log(rtjs)

console.log('devMode',process.env.DEV_MODE)

b.add(path.resolve(rtjs)).bundle().pipe(process.stdout)