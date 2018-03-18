const babelify = require('babelify')
const browserify = require('browserify')
const browserSync = require('browser-sync').create()
const buffer = require('vinyl-buffer')
const butternut = require('gulp-butternut')
const changed = require('gulp-changed')
const clean = require('gulp-dest-clean')
const csso = require('gulp-csso')
const gulp = require('gulp')
const gulpIf = require('gulp-if')
const imagemin = require('gulp-imagemin')
const inject = require('gulp-inject')
const htmlmin = require('gulp-htmlmin')
const mozjpeg = require('imagemin-mozjpeg')
const pipe = require('multipipe')
const plumber = require('gulp-plumber')
const postcss = require('gulp-postcss')
const pngquant = require('imagemin-pngquant')
const pug = require('gulp-pug')
const rename = require('gulp-rename')
const rev = require('gulp-rev')
const source = require('vinyl-source-stream')

const isProduction = process.env.NODE_ENV === 'production'


/**
 * Working paths
 */
const paths = {}
// source
paths.src = {}
paths.src.dir = 'src'
paths.src.js = `${paths.src.dir}/javascript`
paths.src.other = `${paths.src.dir}/other`
paths.src.styles = `${paths.src.dir}/styles`
// application
paths.app = {}
paths.app.dir = 'build'
paths.app.img = `${paths.app.dir}/static/img`
paths.app.js = `${paths.app.dir}/static/js`
paths.app.styles = `${paths.app.dir}/static/css`

/**
 * JavaScript
 */
gulp.task('javascript', () => pipe(
  browserify(`${paths.src.js}/main.js`)
    .transform(babelify, { global: true })
    .bundle(),
  source('main.js'),
  buffer(),
  plumber(),
  gulpIf(isProduction, rename({ suffix: '.min' })),
  gulpIf(isProduction, butternut({})), // minify
  gulpIf(isProduction, rev()), // append content hash to filename
  gulp.dest(paths.app.js)
))

/**
 * JavaScript: ServiceWorker
 */
gulp.task('javascript:sw', () =>
  gulp.src(`${paths.src.js}/serviceWorker.js`).pipe(gulp.dest(paths.app.dir)))

/**
 * Styles
 */
gulp.task('styles', () => {
  // PostCSS processors
  const processors = [
    require('postcss-easy-import')({ prefix: '_' }),
    require('postcss-discard-comments'),
    require('postcss-simple-vars'),
    require('postcss-nested'),
    require('postcss-assets')({
      loadPaths: [`${paths.app.dir}/**/*`],
      relative: paths.app.styles,
      cachebuster: true
    }),
    require('postcss-hexrgba'),
    require('autoprefixer'),
    require('postcss-combine-duplicated-selectors')
  ]

  return pipe(
    gulp.src(`${paths.src.dir}/*.css`),
    plumber(),
    postcss(processors),
    gulpIf(isProduction, rename({ suffix: '.min' })),
    gulpIf(isProduction, csso({ comments: 'none' })), // minify
    gulpIf(isProduction, rev()), // append content hash to filename
    clean(paths.app.styles), // remove files from the destination folder
    gulp.dest(paths.app.styles)
  )
})

/**
 * Images
 */
gulp.task('images', () => pipe(
  gulp.src(`${paths.src.dir}/blocks/**/*.{png,jpg,gif,svg}`),
  plumber(),
  rename({ dirname: '' }), // remove a folder structure
  clean(paths.app.img), // remove files from the destination folder
  // changed(paths.app.img),
  gulp.dest(paths.app.img)
))

gulp.task('images:optim', () => pipe(
  gulp.src(`${paths.app.img}/*.{png,jpg,gif,svg}`),
  plumber(),
  imagemin([
    mozjpeg({ progressive: true }),
    pngquant({ nofs: true }),
    imagemin.svgo(),
    imagemin.gifsicle({ interlaced: true, optimizationLevel: 3 })
  ], { verbose: true }),
  gulp.dest(paths.app.img)
))

/**
 * HTML
 */
gulp.task('html', () => pipe(
  gulp.src(`${paths.src.dir}/*.pug`),
  plumber(),
  pug(),
  inject(
    gulp.src([`${paths.app.dir}/**/*.js`, `${paths.app.dir}/**/*.css`], { read: false }),
    {
      addRootSlash: false,
      ignorePath: `${paths.app.dir}/`,
      removeTags: true,
      transform (filepath) {
        if (filepath.slice(-3) === '.js') return `<script src="${filepath}" async></script>`
        // Use the default transform as fallback
        return inject.transform.apply(inject.transform, arguments)
      }
    }
  ),
  inject(gulp.src(`${paths.app.dir}/**/*.css`), {
    removeTags: true,
    starttag: '<!-- inject:head:{{ext}} -->',
    transform (filePath, file) {
      return file.contents.toString('utf8')
    }
  }),
  inject(gulp.src(`${paths.app.js}/*.js`), {
    removeTags: true,
    starttag: '<!-- inject:body:{{ext}} -->',
    transform (filePath, file) {
      return file.contents.toString('utf8')
    }
  }),
  gulpIf(
    isProduction,
    htmlmin({
      collapseWhitespace: true,
      decodeEntities: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true
    })
  ),
  gulp.dest(paths.app.dir)
))

/**
 * Manage static files
 */
gulp.task('static', () => pipe(
  gulp.src(`${paths.src.other}/**/*`),
  plumber(),
  changed(paths.app.dir),
  gulp.dest(paths.app.dir)
))

/**
 * Clean "build" path
 */
gulp.task('clean', () => gulp.src(paths.app.dir, { allowEmpty: true, read: false }).pipe(clean(paths.app.dir)))

/**
 * LiveReload server
 */
gulp.task('server', () => {
  browserSync.init({
    server: { baseDir: paths.app.dir },
    ghostMode: false,
    logConnections: true,
    // tunnel: '343dev',
    open: false // local, external, ui, tunnel
  })

  gulp.watch(`${paths.app.dir}/**/*`).on('change', path => pipe(
    gulp.src(path),
    browserSync.reload({ stream: true })
  ))
})

/**
 * Watcher
 */
gulp.task('watch', () => {
  // assets
  gulp.watch(`${paths.src.other}/**/*`, gulp.series('static'))
  gulp.watch(`${paths.src.dir}/blocks/**/*.{png,jpg,gif,svg}`, gulp.series('images'))

  // sources
  gulp.watch(`${paths.src.js}/**/*.js`, gulp.series('javascript', 'javascript:sw'))
  gulp.watch(`${paths.src.dir}/**/*.css`, gulp.series('styles'))
  gulp.watch(`${paths.src.dir}/**/*.pug`, gulp.series('html'))
})

/**
 * Default task.
 * Build all stuff. Create server and watch for changes.
 */
gulp.task('default', gulp.series(
  'clean',
  'static',
  'images',
  'styles',
  'javascript',
  'html',
  'javascript:sw',
  gulp.parallel('server', 'watch')
))

/**
 * Build task.
 * Just build all project stuff and exit.
 */
gulp.task('build', gulp.series(
  'clean',
  'static',
  'images',
  'images:optim',
  'styles',
  'javascript',
  'html',
  'javascript:sw'
))
