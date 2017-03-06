var gulp = require('gulp');
var less = require('gulp-less');
var rename = require('gulp-rename');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var debug = require('gulp-debug');
var ignore = require('gulp-ignore');
var watch = require('gulp-watch');
var imagemin = require('gulp-imagemin');

var BASE_DIR = { base: 'src/' }; 

function processJSSourceFile(source, sourceMap) {
    source = source
        .pipe(ignore.exclude("{commons/vendor/**,debug/**}"))
        .pipe(debug({title: 'compile js:'}))
    ;

    if (sourceMap) {
        source = source.pipe(sourcemaps.init());
    }

    source = source 
        .pipe(babel({
            plugins: [
                "transform-decorators-legacy"
            ],
            presets: [
                ['es2015', { loose: true }], 
                'stage-3'
            ]
        }))
        .on('error', console.error.bind(console))
    ;

    if (sourceMap) {
        source = source
            .pipe(sourcemaps.write('.'))
        ;
    }

    return source 
        .pipe(gulp.dest('dist'));
}

function processWXSSSourceFile(source) {
    return source
        .pipe(ignore.exclude('{commons/vendor/**,debug/**}'))
        .pipe(debug({title: 'compile wxss:'}))
        .pipe(less())
        .pipe(rename(function(path){
            path.extname = '.wxss';
        }))
        .pipe(gulp.dest('dist'));
}

function processOtherSourceFile(source) {
    return source
        .pipe(ignore.exclude(function(file) {
            if (/([\/\\])src\1commons\1vendor\1.*/.test(file.path)) {
                return false;
            }

            if (/([\/\\])src\1debug/.test(file.path)) {
                return true;
            }

            if (/\.(?:wxss|js)$/.test(file.path)) {
                return true;
            }

            return false;
        }))
        .pipe(debug({title: 'sync:'}))
        .pipe(gulp.dest('dist'));
}

gulp.task('build:js', function(){
    processJSSourceFile(gulp.src(['src/**/*.js'], BASE_DIR))
});

gulp.task('build:js:shourceMap', function(){
    processJSSourceFile(gulp.src(['src/**/*.js'], BASE_DIR), true)
});

gulp.task('build:wxss', function(){
    processWXSSSourceFile(gulp.src(['src/**/*.wxss'], BASE_DIR))
});

gulp.task('build:*', function(){
    processOtherSourceFile(gulp.src(['src/**'], BASE_DIR));
});

gulp.task('opt:image', function() {
    gulp.src('src/assets/**/*')
        .pipe(imagemin())
        .pipe(debug({title: 'opt:'}))
        .pipe(gulp.dest('dist/assets'))
});

gulp.task('debug', function() {
    gulp.src('src/debug/**/*')
        .pipe(gulp.dest('dist/debug'))
});

gulp.task('build', ['build:js', 'build:wxss', 'build:*', 'opt:image']);

gulp.task('watch', function(){
    processJSSourceFile(watch('src/**/*.js', BASE_DIR));
    watch('src/**/*.wxss', function(file) {
        if (file.event == 'add') {
            processWXSSSourceFile(
                gulp.src(file.history[0])
            );
            return;
        }

        processWXSSSourceFile(gulp.src(['src/**/*.wxss'], BASE_DIR));
    });
    processOtherSourceFile(watch('src/**', BASE_DIR));
});


gulp.task('default', ['watch', 'build:js:shourceMap', 'build:wxss', 'build:*', 'debug']);