'use strict'

const pkgJson = require('./package.json'),
  projectJson = require('./.config/project.json'),
  assign = require('lodash.assign'),
  browserify = require('browserify'),
  buffer = require('vinyl-buffer'),
  del = require('del'),
  dotenv = require('dotenv'),
  envify = require('envify/custom'),
	gulp = require('gulp'),
  gutil = require('gulp-util'),
  jsoneditor = require('gulp-json-editor'),
  livereload = require('gulp-livereload'),
  merge = require('gulp-merge-json'),
  path = require('path'),
  pify = require('pify'),
  rename = require('gulp-rename'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  terser = require('gulp-terser-js'),
  watchify = require('watchify'),
  zip = require('gulp-zip')


const endOfStream = pify(require('end-of-stream'))

const envArgs = dotenv.config({
  path:path.resolve(process.cwd(),'.config/.env'),
  encoding:'utf8'
})

if(envArgs.error){
  throw envArgs.error
}

const AppName = process.env.APP_NAME || pkgJson.name
const Target = process.env.DEST_TARGET || "chromium"

const materialUIDeps = ['@material-ui/core']
const NODE_ENV = process.env.NODE_ENV || 'development';
console.log('currentBuildMode',NODE_ENV)
const DEV_MODE = process.env.DEV_MODE || true

const livereloadPort = 36489
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

gulp.task('dev:reload',function(){
  livereload.listen({
    port:livereloadPort
  })
})

//Gulp Task
const copyTaskNames = []
const copyDevTaskNames = []

createCopyTasks('locales',{
  source:`${gulpPaths.APP}/_locales/`,
  pattern:'**/*.json',
  destinations:commonPlatforms.map(platform => `${gulpPaths.BUILD}/${platform}/_locales`)
})

createCopyTasks('icons',{
  source:`${gulpPaths.APP}/icons/`,
  destinations:commonPlatforms.map(platform => `${gulpPaths.BUILD}/${platform}/icons`)
})

createCopyTasks('images',{
  source:`${gulpPaths.APP}/images/`,
  destinations:commonPlatforms.map(platform => `${gulpPaths.BUILD}/${platform}/images`)
})

createCopyTasks('css',{
  source:`${gulpPaths.APP}/css/`,
  destinations:commonPlatforms.map(platform => `${gulpPaths.BUILD}/${platform}/css`)
})

createCopyTasks('vendor',{
  source:`${gulpPaths.APP}/vendor/`,
  destinations:commonPlatforms.map(platform => `${gulpPaths.BUILD}/${platform}/vendor`)
})

createCopyTasks('js',{
  source:`${gulpPaths.APP}/js/`,
  destinations:commonPlatforms.map(platform => `${gulpPaths.BUILD}/${platform}/js`)
})


createCopyTasks('html',{
  source:`${gulpPaths.APP}/`,
  pattern:'**/*.html',
  devMode:true,
  destinations:commonPlatforms.map(platform => `${gulpPaths.BUILD}/${platform}`)
})


//merge manifest json task
createCopyMergeManifestTask(commonPlatforms)


/* ====================== Copy Files ============================ */
function createCopyTasks (label, opts) {
  if(!opts.devOnly) {
    const copyTaskName = `copy:${label}`
    copyTask(copyTaskName,opts)
    copyTaskNames.push(copyTaskName)
  }
  const copyDevTaskName = `dev:copy:${label}`
  copyTask(copyDevTaskName,Object.assign({devMode:isDevelopmentMode()},opts))
  copyDevTaskNames.push(copyDevTaskName)
}

function copyTask(taskName,opts) {
  const source = opts.source
  const destination = opts.destination
  const destinations = opts.destinations || [destination]
  const pattern = opts.pattern || '**/*'
  const devMode = opts.devMode
  //console.log(source + pattern)
  return gulp.task(taskName,() => {
    // if(devMode){
    //   watch(source+pattern,(event) =>{
    //     console.log(' copy watch',event.path)
    //     livereload.changed(event.path)
    //     performCopy()
    //   })
    // }

    return performCopy()
  })

  function performCopy() {
    let stream = gulp.src(source + pattern,{base:source})

    destinations.forEach(function(dest) {
      stream = stream.pipe(gulp.dest(dest))
    })

    return stream
  }

}

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
  'bglib',
  'p3lib'
]



//createTasksForBuildJsDeps({filename:'bg-libs',key:'background'})
//createTasksForBuildJsExtension({ buildJsFiles, taskPrefix:'dev:extension:js',devMode:true})

createTasks4BuildJSModules({
  taskPrefix:"dev:modules:bundle",
  jsModules: buildJsFiles,
  devMode:isDevelopmentMode(),
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
    watch:isDevelopmentMode(),
    buildSourceMaps:!isDevelopmentMode(),
    minifyBuild:!isDevelopmentMode()
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

  gulp.task(taskPrefix,gulp.parallel(...subTasks))
}

function createTasks4Module (opts) {
  let suffixName = getBundleSuffix(opts.devMode)
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

    //console.log(opts.filename,'<-->',opts.filepath)
    buildStream = buildStream
      .pipe(source(opts.filename))
      .pipe(buffer())

    //console.log('buildSourceMaps',JSON.stringify(opts,null,2))
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

/*  if(opts.watch){
    b = watchify(b)

    b.on('update',async (ids) =>{
      console.log('ids',ids)
      const stream = performBundle()
      await endOfStream(stream)
      livereload.changed(`${ids}`)
    })
  }*/

  return b
}


function createCopyMergeManifestTask(platforms) {
  let targets = platforms || commonPlatforms

  targets.map(target => {
    let mergeTaskName = `copy:merge:${target}`
    let opts = {
      "devMode":isDevelopmentMode()
    }
    opts.src = `${gulpPaths.SRC}/${target}.manifest.json`
    opts.dest = `${gulpPaths.BUILD}/${target}`
    mergeManifestTask(mergeTaskName,opts);
    copyTaskNames.push(mergeTaskName)

    let devMergeTaskName = `dev:copy:merge:${target}`
    mergeManifestTask(devMergeTaskName,opts);
    copyDevTaskNames.push(devMergeTaskName)
  })
}

function isDevelopmentMode(){
  return NODE_ENV =='development'
}

function getBundleSuffix(devMode){
  return devMode ? '-bundle.js' : '.min.js'
}

function mergeManifestTask(taskName,opts) {
  const commonSrc = `${gulpPaths.SRC}/common.manifest.json`
  let devMode = opts.devMode || false

  return gulp.task(taskName,function(){
    return gulp.src([
      commonSrc,
      opts.src
    ]).pipe(merge())
    .pipe(jsoneditor((json) =>{
      json = handleChromeManifest(json,devMode)
      return json
    }))
    .pipe(rename('manifest.json'))
    .pipe(gulp.dest(opts.dest,{overwrite:true}))
  })
}

function handleChromeManifest(json,devMode){
  if(pkgJson.version)json.version = pkgJson.version
  if(pkgJson.author)json.author = pkgJson.author

  if(devMode){
    json.permissions = [...json.permissions,'developerPrivate']
  }
  let suffixName = getBundleSuffix(devMode)

  let bgBundles = buildJsFiles.filter(name => /^bg.*$/g.test(name)).map(filename => `bundles/${filename}${suffixName}`)
  if(bgBundles.length && json.background){
    json.background.scripts = json.background.scripts ? [...bgBundles,...json.background.scripts] : [...bgBundles]
  }

  return json
}


/*======================== Task Manager ===========================*/
gulp.task('dev:copy',
  gulp.series(gulp.parallel(...copyDevTaskNames))
)

gulp.task('dev:extension',
  gulp.series(
    'clean',
    // 'dev:scss',
    gulp.parallel(
      'dev:modules:bundle',
      'dev:copy'
    )
  )
)

//zip
gulp.task('zip:chrome',zipTask('chromium'))
gulp.task('zip:firefox',zipTask('firefox'))

gulp.task('zip:all',gulp.series(
  'dev:extension','zip:chrome','zip:firefox'
  )
)

function zipTask(target) {
  return ()=>{
    const zipSrc = `${gulpPaths.BUILD}/${target}/**`
    const zipName = `${AppName}-${pkgJson.version}.zip`
    const zipDest = `${gulpPaths.DEST}/${target}`
    return gulp.src(zipSrc)
      .pipe(zip(zipName))
      .pipe(gulp.dest(zipDest,{overwrite:true}))
  }
}

function beep() {
  process.stdout.write('\x07')
}

//Default
gulp.task('default',gulp.series('dev:extension'))