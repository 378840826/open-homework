const gulp = require('gulp')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const htmlmin = require('gulp-htmlmin')
const minifyCss = require('gulp-minify-css')
const autoprefix = require('gulp-autoprefixer')

function js() {
  // 排除 jquery utils
  return gulp.src(['./src/js/*.js', '!src/js/{jquery}.js'])
    .pipe(babel())
    .pipe(uglify({
      mangle: {
        // 顶层变量
        toplevel: true,
        // // 排除混淆关键字
        // reserved: [
        //   'changeStoreBindState',
        // ],
      },
      // compress: { drop_console: true },
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js'))
}

function css() {
  return gulp.src('./src/css/*.css')
    .pipe(autoprefix())
    .pipe(minifyCss())
    .pipe(gulp.dest('./dist/css'))
}

function html() {
  const options = {
    collapseWhitespace: true,
    removeComments: true,
    collapseBooleanAttributes: true,
    removeEmptyAttributes: true,
    babel: true,
  };
  return gulp.src('./src/html/*.html')
    .pipe(htmlmin(options))
    .pipe(gulp.dest('./dist/html'))
}

function transferJquery() {
  return gulp.src('./src/js/jquery.js')
    .pipe(gulp.dest('./dist/js'))
}

// function transferImg() {
//   return gulp.src('./src/icon/*.png')
//     .pipe(gulp.dest('./dist/icon'))
// }

function transferManifest() {
  return gulp.src('./src/manifest.json')
    .pipe(gulp.dest('./dist/'))
}

function transferReadme() {
  return gulp.src('./src/readme.md')
    .pipe(gulp.dest('./dist/'))
}

function __main() {
  js()
  css()
  html()
  transferJquery()
  // transferImg()
  transferManifest()
  transferReadme()
}

__main()
