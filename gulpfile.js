'use strict'

const pkgJson = require('./package.json'),
  projectJson = require('./.config/project.json'),
  assign = require('lodash.assign'),
  browserify = require('browserify'),
  buffer = require('vinyl-buffer'),
  chmod = require('gulp-chmod'),
  DateFormat = require('fast-date-format'),
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
  shell = require('shelljs'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  terser = require('gulp-terser-js'),
  watch = require('gulp-watch'),
  watchify = require('watchify'),
  zip = require('gulp-zip')


/* ==================== Global Constants Defined ======================  */
const endOfStream = pify(require('end-of-stream'))
const livereloadPort = 36489

const liveOpts = {
  port:livereloadPort
}

var dateFormat = new DateFormat('YYDDDD')
const isPreRelease = true

if(isPreRelease){
  dateFormat = new DateFormat('MMDDDD-HHmm')
}

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
console.log('currentBuildMode[',NODE_ENV,'],target[',Target,']')
const DEV_MODE = isDevelopmentMode()

/* ==================== Global Constants Defined End ======================  */
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
  DEST:"./dist",
  CONFIG:".config"
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
  devMode:isDevelopmentMode(),
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
    if(devMode){
     // console.log('CopyTask>>',JSON.stringify(opts,null,2))
      watch(source+pattern,(event) =>{
        console.log(' copy watch',event.path)
        livereload.changed(event.path)
        performCopy()
      })
    }

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

/* ======================= Edit Version =========================== */

gulp.task('set:appinfo',function(){
  const InfoFile = `${gulpPaths.CONFIG}/version-info.json`
  const Target = `${gulpPaths.SRC}/scripts/runtime/`
  //console.log(Target)
  return gulp.src(InfoFile)
    .pipe(jsoneditor((json) =>{
      //console.log(JSON.stringify(json,null,2))
      return editAppInfo(json)
    }))
    .pipe(rename('info.json'))
    .pipe(gulp.dest(Target,{overwrite:true}))
})

function editAppInfo(json) {
  if(!json)json = {
    name:"",
    version:""
  }

  let _ver = process.env.APP_VER || pkgJson.version
  let _tag = dateFormat.format(new Date())

  json.version = _ver
  json.author = pkgJson.author || process.env.APP_AUTHOR
  json.buildTag = `${_ver}_${_tag}`
  return json
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

  if(opts.watch){
    b = watchify(b)

    b.on('update',async (ids) =>{
      console.log('ids',ids)
      const stream = performBundle()
      await endOfStream(stream)
      livereload.changed(`${ids}`)
    })
  }

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
    ])
    //.pipe(chmod(0o777))
    .pipe(merge())
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

  if(devMode && isChromeTarget()){
    //,'developerPrivate'
    json.permissions = [...json.permissions,'developerPrivate']
  }
  let suffixName = getBundleSuffix(devMode)

  let bgBundles = buildJsFiles.filter(name => /^bg.*$/g.test(name)).map(filename => `bundles/${filename}${suffixName}`)
  if(bgBundles.length && json.background){
    json.background.scripts = json.background.scripts ? [...bgBundles,...json.background.scripts] : [...bgBundles]
  }

  return json
}

function isChromeTarget(){
  return Target == 'chromium'
}
/*======================== Task Manager ===========================*/
gulp.task('watch',async function(){
  livereload.listen(liveOpts)
})

gulp.task('start-chrome',async function(){
  shell.exec('npm run chrome')
})

gulp.task('dev:copy',
  gulp.series(gulp.parallel(...copyDevTaskNames))
)

//7zip
gulp.task('7zip:chrome',function(){

})

//zip
gulp.task('zip:chrome',zipTask('chromium'))
gulp.task('zip:firefox',zipTask('firefox'))

gulp.task('zip:all',gulp.series(
  'zip:chrome','zip:firefox'
  )
)



gulp.task('dev:extension',
  gulp.series(
    'set:appinfo',
    'clean',
    // 'dev:scss',
    gulp.parallel(
      'dev:modules:bundle',
      'dev:copy'
    ),
    'watch'
  )
)

gulp.task('prod:extension',
  gulp.series(
    'set:appinfo',
    'clean',
    // 'dev:scss',
    gulp.parallel(
      'dev:modules:bundle',
      'dev:copy'
    ),
    gulp.parallel(
      'zip:chrome',
      'zip:firefox'
    )
  )
)

function zipTask(target) {
  return ()=>{
    const zipSrc = `${gulpPaths.BUILD}/${target}/**`
    const zipName = `${AppName}-${pkgJson.version}-${target}.zip`
    const zipDest = `${gulpPaths.DEST}/${target}`
    return gulp.src(zipSrc)
      //.pipe(chmod(0o755))
      .pipe(zip(zipName))
      .pipe(gulp.dest(zipDest,{overwrite:true}))
  }
}

const ChmodPermission = () =>{
  return {
    owner: {
      read: true,
      write: true,
      execute: true
    },
    group: {
      read: true,
      execute: true
    },
    others: {
      read: true,
      execute: true
    }
  }
}

function beep() {
  process.stdout.write('\x07')
}
var DEF_TASK = "dev:extension"
if(isDevelopmentMode()){
  DEF_TASK = "dev:extension"
}else{
  DEF_TASK = "prod:extension"
}

//Default
gulp.task('default',gulp.series(DEF_TASK))