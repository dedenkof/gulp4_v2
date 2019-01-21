'use strict';

const gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    gcmq = require('gulp-group-css-media-queries'),
    cleanCSS = require('gulp-clean-css'),
    minJS = require('gulp-uglify'),
    rename = require('gulp-rename'),
    includeFiles = require('gulp-rigger'),
    browserSync = require('browser-sync').create(),
    inject = require('gulp-inject'),
    rimraf = require('rimraf'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    googleWebFonts = require('gulp-google-webfonts'),
    replace = require('gulp-replace'),
    htmlmin = require('gulp-htmlmin'),
    pug = require('gulp-pug'),
    cache = require('gulp-cache');



const path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        src: 'src/',
        mainHTML: 'src/index.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'src/js/*.js',//В стилях и скриптах нам понадобятся только main файлы
        jsLib: 'src/js/libs/**/*.js',//В стилях и скриптах нам понадобятся только main файлы
        css: 'src/css/**/*.css',
        sass: 'src/sass/**/*.scss',
        img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*',
        fontsGoogle: 'src/fonts/'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        css: 'src/css/**/*.scss',
        sass: 'src/sass/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },

    tmp: {
        css: '.tmp/css/',
        js: '.tmp/js/',
    },

    nm: 'node_modules/',

    clean: './build'
};

const onError = function(err) {
    notify.onError({
        title: 'Error in ' + err.plugin,
    })(err);
    this.emit('end');
};

const options = { };


gulp.task('html', function () {
    return gulp.src(path.src.html)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(includeFiles())
        /*.pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: false
        }))*/
        .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, '')) // убираем комментарии <!--DEV ... -->
        .pipe(gulp.dest(path.build.html))
        .on('end', browserSync.reload);
});

gulp.task('scriptsLib', function (){
    return gulp.src(path.src.jsLib)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(minJS()) //Сожмем наш js
        .pipe(concat('libs.js'))
        .pipe(rename({suffix: '.min'})) // Добавляем в название файла суфикс .min
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest(path.tmp.js))
        .pipe(browserSync.reload({
            stream: true
        }));

});

gulp.task('scripts', function (){
    return gulp.src(path.src.js)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(includeFiles())
        .pipe(sourcemaps.init())
        .pipe(minJS()) //Сожмем наш js
        .pipe(concat('general.js'))
        .pipe(rename({suffix: '.min'})) // Добавляем в название файла суфикс .min
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest(path.tmp.js))
        .pipe(browserSync.reload({
            stream: true
        }));

});



gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: "./build"
        },
        tunnel: false,
        // startPath: 'index.html',
        host: 'localhost',
        port: 9000,
        //proxy: "yourlocal.dev",
        logPrefix: "Frontend_History_Action"
    });
});

gulp.task('clean', function (cb) {
    return rimraf(path.clean, cb);
});


/*gulp.task('watch', gulp.series(['html', 'index', 'scripts', 'preproc', 'styles', 'fonts', 'google-fonts', 'image']), function() {
    gulp.watch(path.watch.html, gulp.series('html'));
    gulp.watch(path.watch.js, gulp.series('scripts'));
    gulp.watch(path.watch.sass, gulp.series('preproc'));
    gulp.watch(path.watch.css, gulp.series('styles'));
    gulp.watch(path.watch.fonts, gulp.series('fonts'));
    gulp.watch(path.watch.fonts, gulp.series('google-fonts'));
    gulp.watch(path.watch.img, gulp.series('image'));
});*/

gulp.task('watch', function() {
    gulp.watch(path.watch.html, gulp.series('html'));
    gulp.watch(path.watch.js, gulp.series('scripts'));
    gulp.watch(path.watch.js, gulp.series('scriptsLib'));
});

/*gulp.task('default', gulp.series(
    gulp.parallel('html'),
    gulp.parallel('watch', 'serve')
));*/

gulp.task('default', gulp.series(['html','scripts', 'scriptsLib', gulp.parallel('watch', 'serve')]));

//gulp.task('build',gulp.series(['clean', gulp.parallel('html', 'index', 'scripts', 'preproc', 'styles', 'fonts', 'google-fonts', 'image')]));

//gulp.task('default', gulp.series(['build', gulp.parallel('watch', 'webserver')]));

