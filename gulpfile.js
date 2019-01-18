'use strict';

const gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    gcmq = require('gulp-group-css-media-queries'),
    cleanCSS = require('gulp-clean-css'),
    postcss = require("gulp-postcss"),
    minJS = require('gulp-uglify'),
    rename = require('gulp-rename'),
    includeFiles = require('gulp-rigger'),
    browserSync = require('browser-sync'),
    inject = require('gulp-inject'),
    rimraf = require('rimraf'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    googleWebFonts = require('gulp-google-webfonts'),
    htmlmin = require('gulp-htmlmin'),
    cache = require('gulp-cache');



const path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        build: 'build/',
        html: 'build/*.html',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        src: 'src/',
        mainHTML: './src/index.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        html: './src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: './src/js/**/*.js',//В стилях и скриптах нам понадобятся только main файлы
        css: './src/css/**/*.css',
        sass: './src/sass/**/*.scss',
        img: './src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: './src/fonts/**/*.*',
        fontsGoogle: './src/fonts/'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: './src/**/*.html',
        js: './src/js/**/*.js',
        css: './src/css/**/*.scss',
        sass: './src/sass/**/*.scss',
        img: './src/img/**/*.*',
        fonts: './src/fonts/**/*.*'
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


gulp.task('google-fonts', function () {
    return gulp.src(path.src.fontsGoogle + 'fonts.list')
        .pipe(googleWebFonts(options))
        .pipe(gulp.dest(path.build.fonts));
});

gulp.task('fonts', function() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

gulp.task('sass', function (){
    return gulp.src(path.src.sass)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}))
        .pipe(gulp.dest(path.tmp.css))
        .pipe(rename({suffix: '.min'}))
        .pipe(autoprefixer({browsers: ['> 0.1%'], cascade: false}))
        .pipe(cleanCSS({level: 2}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.tmp.css))
        .pipe(browserSync.reload({
            stream: true
        }));

});


gulp.task('styles', gulp.series(['sass']), function () {
    return gulp.src(path.src.css)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(includeFiles())
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['> 0.1%'],
            cascade: false
        }))
        .pipe(gcmq())
        .pipe(rename({suffix: '.min'})) // Добавляем в название файла суфикс .min
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(sourcemaps.write('../maps', {addComment: false}))
        .pipe(gulp.dest(path.tmp.css))
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
        .pipe(rename({suffix: '.min'})) // Добавляем в название файла суфикс .min
        .pipe(sourcemaps.write('../maps', {addComment: false}))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.reload({
            stream: true
        }));

});

gulp.task('html', function () {
    return gulp.src(path.src.html)
        .pipe(plumber({ errorHandler: onError }))
        //.pipe(includeFiles())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: false
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('image', function () {
    return gulp.src(path.src.img) //Выберем наши картинки
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        })))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('index', function () {
    const target = gulp.src(path.src.html);
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    const sources = gulp.src([path.src.js, path.src.sass, path.src.css], {read: false});


    return target.pipe(includeFiles(sources)),
        target.pipe(inject(sources, {ignorePath: 'src', addRootSlash: false, relative: true }))
            .pipe(plumber({ errorHandler: onError }))
            .pipe(gulp.dest(path.build.html));
});

gulp.task('inject', function () {
    const injectStyles = gulp.src([ // selects all css files from the .tmp dir
            path.nm + 'bootstrap/dist/css/bootstrap.css',
            path.nm + 'bootstrap/dist/css/bootstrap-grid.css',
            path.tmp.css
        ], { read: false }
    );

    const injectScripts = gulp.src([  // selects all js files from .tmp dir, но сейчас 24 марта мы еще не пишем в ES6
        path.nm + 'jquery/dist/jquery.js', // Берем jQuery
        path.nm + 'bootstrap/dist/js/bootstrap.js', // Берем bootstrap js
        path.tmp.js,
        '!' + path.src + '/!**!/!*.test.js'
    ]);

    return gulp.src(path.src + '/!*.html')
        .pipe(inject(injectStyles, { name: 'head', relative: true }))
        .pipe(inject(injectScripts, { relative: true }))
        .pipe(gulp.dest(path.tmp))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('webserver', function () {
    browserSync.init({
        server: {
            baseDir: "./build"
        },
        tunnel: false,
        host: 'localhost',
        port: 9000,
        //proxy: "yourlocal.dev",
        logPrefix: "Frontend_History_Action"
    });

});

gulp.task('clean', function (cb) {
    return rimraf(path.clean, cb);
});


gulp.task('watch', gulp.series(['html', 'index', 'scripts', 'preproc', 'styles', 'fonts', 'google-fonts', 'image']), function() {
    gulp.watch(path.watch.html, gulp.series('html'));
    gulp.watch(path.watch.js, gulp.series('scripts'));
    gulp.watch(path.watch.sass, gulp.series('preproc'));
    gulp.watch(path.watch.css, gulp.series('styles'));
    gulp.watch(path.watch.fonts, gulp.series('fonts'));
    gulp.watch(path.watch.fonts, gulp.series('google-fonts'));
    gulp.watch(path.watch.img, gulp.series('image'));
});

gulp.task('build',gulp.series(['clean', gulp.parallel('html', 'index', 'scripts', 'preproc', 'styles', 'fonts', 'google-fonts', 'image')]));

gulp.task('default', gulp.series(['build', gulp.parallel('watch', 'webserver')]));*/

