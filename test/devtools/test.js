const browserify = require('browserify'),
path = require('path')

var b = browserify()

const rtjs = './src/lib/runtime-info.js'
console.log(rtjs)

b.add(path.resolve(rtjs)).bundle().pipe(process.stdout)