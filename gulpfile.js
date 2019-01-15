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
    browserSync = require('browser-sync'),
    inject = require('gulp-inject');

const path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        mainHTML: './src/index.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        html: './src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: './src/js/**/*.js',//В стилях и скриптах нам понадобятся только main файлы
        css: './src/css/**/*.css',
        sass: './src/sass/**/*.scss',
        img: './src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: './src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: './src/**/*.html',
        js: './src/js/**/*.js',
        css: './src/css/**/*.scss',
        sass: './src/sass/**/*.scss',
        img: './src/img/**/*.*',
        fonts: './src/fonts/**/*.*'
    },
};

const onError = function(err) {
    notify.onError({
        title: 'Error in ' + err.plugin,
    })(err);
    this.emit('end');
};



function preproc(){
    return gulp.src(path.src.sass)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(includeFiles())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sass().on('error', sass.logError))
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
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.reload({
            stream: true
        }));

}

// style
function styles() {
    return gulp.src(path.src.css)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(includeFiles())
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['> 0.1%'],
            cascade: false
        }))
        .pipe(gcmq())
        //.pipe(concat('general.css'))
        .pipe(rename({suffix: '.min'})) // Добавляем в название файла суфикс .min
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(sourcemaps.write('../maps', {addComment: false}))
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.reload({
            stream: true
        }));
}

// js
function scripts(){
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

}

gulp.task('scripts', scripts);
gulp.task('styles', styles);
gulp.task('preproc', preproc);

gulp.task('webserver', function () {
    browserSync.init({
        server: {
            baseDir: "./build"
        },
        tunnel: true,
        host: 'localhost',
        port: 9000,
        logPrefix: "Frontend_Pack"
    });
});

gulp.task('index', function () {
    const target = gulp.src(path.src.html);
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    const sources = gulp.src([path.src.js, path.src.sass, path.src.css], {read: false});

    return target.pipe(includeFiles(sources)),
            target.pipe(inject(sources))
            .pipe(plumber({ errorHandler: onError }))
            .pipe(gulp.dest('./build'));
});