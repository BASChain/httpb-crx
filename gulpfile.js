'use strict'

const pkgJson = require('./package.json'),
  projectJson = require('./.config/project.json'),
  assign = require('lodash.assign'),
  browserify = require('browserify'),
  buffer = require('vinyl-buffer'),
  del = require('del'),

  envify = require('envify/custom'),
	gulp = require('gulp'),
  gutil = require('gulp-util'),
  livereload = require('gulp-livereload'),

  pify = require('pify'),
  rename = require('gulp-rename'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  terser = require('gulp-terser-js'),
  watchify = require('watchify')


const endOfStream = pify(require('end-of-stream'))

const AppName = process.env.APP_NAME || pkgJson.name
const Target = process.env.DEST_TARGET || "chromium"

const materialUIDeps = ['@material-ui/core']


const externalDepsMap = {
  background:[
    'web3'
  ],
  popup:[
    ...materialUIDeps,
  ]
}

const gulpPaths = Object.assign({
  APP:"./app",
  BUILD:"./build",
  DEST:"./dist"
},projectJson)

const browserPlatforms = [
  'firefox',
  'chromium'
]

const commonPlatforms = [...browserPlatforms,]

const BundleJsDestinations = browserPlatforms.map(platform => `${gulpPaths.BUILD}/${platform}/bundles`)

gulp.task('clean',function clean(){
  return del([`${gulpPaths.BUILD}/*`])
})


// gulp.task('dev:copy',
//   gulp.series(

//   )
// )

gulp.task('dev:extension',
  gulp.series(
    'clean',
    // 'dev:scss',
    // gulp.parallel(
    //   'dev:copy'
    // )
  )
)

/* ====================== Build scss ============================ */

function createScssBuildTask({ src, dest, devMode, pattern }) {
  return function () {
    if(devMode) {
      //TODO hotreload

    }

  }

  function buildScssWithSourceMaps () {
    return gulp.src(src)
      .pipe(sourcemaps.init())

  }
}


/* ======================== Build Js and deps  ============================= */
const buildJsFiles = [
  'background',
  'popup'
]



//createTasksForBuildJsDeps({filename:'bg-libs',key:'background'})
//createTasksForBuildJsExtension({ buildJsFiles, taskPrefix:'dev:extension:js',devMode:true})

createTasks4BuildJSModules({
  taskPrefix:"dev:modules:bundle",
  jsModules: buildJsFiles,
  devMode:false,
  destinations:BundleJsDestinations,
})


// bundle JS
function createTasksForBuildJsDeps({key,filename}) {
  const destinations = browserPlatforms.map(platform => `${gulpPaths.DEST}/${platform}`)

  const bundleTaskOpts = Object.assign({
    buildSourceMaps:true,
    sourceMapDir:'../sourcemaps',
    minifyBuild:true,
    devMode:false,
  })

  gulp.task(`build:extension:js:deps:${key}`,bundleTask(Object.assign({
    label:filename,
    filename:`${filename}.js`,
    destinations,
    dependenciesToBundle:externalDepsMap[key]
  },bundleTaskOpts)))
}

/**
 * @DateTime 2019-12-25
 * @param    {Object JSON}   opts
 *                           buildSourceMaps(boolean),minifyBuild(boolean),destinations(array)
 *                           watch(boolean),devMode(boolean),buildWithFullPaths(array)
 */
function bundleTask (opts) {
  let bundler

  return performBundle

  function performBundle () {
    if(!bundler) {
      bundler = generateBundler(opts,performBundle)
      bundler.on('log',gutil.log) // output build logs to terminal
    }

    let buildStream = bundler.bundle()

    buildStream.on('error',(err) => {
      beep()
      if(opts.watch){
        console.warn(err.stack)
      }else{
        throw err
      }
    })

    //
    buildStream = buildStream
      .pipe(source(opts.filename))
      .pipe(buffer())

    if(opts.buildSourceMaps){
      //loads map from browserify file
      buildStream = buildStream
        .pipe(sourcemaps.init({loadMaps:true}))
    }

    //minitication
    if(opts.minifyBuild){
      buildStream = buildStream
        .pipe(terser({
          mangle:{
            reserved:['Bas','BASChain']
          }
        }))
    }

    //Finalize Source Maps
    if(opts.buildSourceMaps) {
      if(opts.devMode){
        //https://bugs.chromium.org/p/chromium/issues/detail?id=931675
        buildStream = buildStream.pipe(sourcemaps.write())
      }else{
        buildStream = buildStream
          .pipe(sourcemaps.write(opts.sourceMapDir))
      }
    }

    //ooutput completed bundles
    opts.destinations.forEach((dest) =>{
      buildStream = buildStream.pipe(gulp.dest(dest))
    })

    return buildStream
  }
}


/**
 * @DateTime 2019-12-25
 * @param    {Object JSON}   opts      see function bundleTask
 * @param    {[type]}   platformBundle [description]
 * @return   {[type]}                  [description]
 */
function generateBundler(opts,platformBundle) {
  const browserifyOpts = assign({},watchify.args,{
    plugin:[],
    transform:[],
    debug:opts.buildSourceMaps,
    fullPaths:opts.buildWithFullPaths,
  })

  const bundleName = opts.filename.split('.')[0]

  const activateAutoConfig = Boolean(process.env.SESIFY_AUTOGEN)

  let bundler = browserify(browserifyOpts)
    .transform('babelify')
    // .transform('babelify',{
    //   only:[
    //     './**/node_modules'
    //   ]
    // })
    .transform('brfs')

  if(opts.buildLib) {
    bundler = bundler.require(opts.dependenciesToBundle)
  }

  bundler.transform(envify({
    NODE_ENV:opts.devMode ? 'development' : 'production',
    INFURA_PROJECT_ID:process.env.INFURA_PROJECT_ID ||'',
    INFURA_SECRET:process.env.INFURA_SECRET ||''
  }),{
    global:true
  })

  if(opts.watch){
    bundler = watchify(bundler)

    //on any file changed,re-runs the bundler
    bundler.on('update',async (ids) => {
      const stream = performBundle()
      await endOfStream(stream)
      livereload.changed(`${ids}`)
    })

  }

  return bundler
}

//build modules
function createTasks4BuildJSModules ({
  taskPrefix, jsModules, devMode, destinations, bundleTaskOpts = {}
}) {
  //console.log(typeof jsModules)
  const rootDir = gulpPaths.SRC

  bundleTaskOpts = Object.assign({
    devMode,
    sourceMapDir:'../sourcemaps',
    watch:false,
    buildSourceMaps:true,
    minifyBuild:!devMode
  },bundleTaskOpts)

  let subTasks = []
  jsModules.forEach((modu) =>{
    let label = `${taskPrefix}:${modu}`
    gulp.task(label,createTasks4Module(Object.assign({
      label:label,
      filename:`${modu}.js`,
      filepath:`${rootDir}/scripts/${modu}.js`,
      destinations,
    },bundleTaskOpts)))

    subTasks.push(label)
  })

  gulp.task(taskPrefix,gulp.series(subTasks))
}

function createTasks4Module (opts) {
  let suffixName = opts.devMode ? '-bundle.js' : '.min.js'
  let bundler

  return performBundle

  function performBundle () {
    if(!bundler) {
      bundler = generateBrowserify(opts,performBundle)
      bundler.on('log',gutil.log)
    }

    let buildStream = bundler.bundle()

    buildStream.on('error',(err) => {
      beep()
      if(opts.watch){
        console.warn(err.stack)
      }else{
        throw err
      }
    })

    buildStream = buildStream
      .pipe(source(opts.filename))
      .pipe(buffer())

    console.log('buildSourceMaps',JSON.stringify(opts,null,2))
    if(opts.buildSourceMaps) {
      buildStream = buildStream
        .pipe(sourcemaps.init({loadMaps:true}))
    }

    if(opts.minifyBuild){
      buildStream = buildStream
        .pipe(terser({
          mangle: {
            reserved:['BAS']
          }
        }))
    }


    buildStream = buildStream
      .pipe(rename({extname:suffixName}))

    //Finalize Source Maps
    if(opts.buildSourceMaps) {
      if(opts.devMode){
        //https://bugs.chromium.org/p/chromium/issues/detail?id=931675
        buildStream = buildStream.pipe(sourcemaps.write())
      }else{
        buildStream = buildStream
          .pipe(sourcemaps.write(opts.sourceMapDir))
      }
    }

    opts.destinations.forEach((dest) => {
      buildStream = buildStream.pipe(gulp.dest(dest))
    })

    return buildStream
  }
}

/**
 * @DateTime 2019-12-26
 * @param    {Object JSON}   opts
 *                           buildSoureMaps,
 *                           jsFile
 *
 * @param    {[type]}   performBundle [description]
 * @return   {[type]}                 [description]
 */
function generateBrowserify(opts,performBundle) {
  const browserifyOpts = assign({},watchify.args,{
    plugin:[],
    transform: [],
    debug: opts.buildSourceMaps,
    entries:opts.filepath
  })

  let b = browserify(browserifyOpts)
    .transform('babelify')
    .transform('brfs')

  b.transform(envify({
    NODE_ENV:opts.devMode ? 'development' : 'production'
  }),{
    global:true
  })

  return b
}


function beep() {
  process.stdout.write('\x07')
}

//Default
gulp.task('default',gulp.series('dev:extension'))