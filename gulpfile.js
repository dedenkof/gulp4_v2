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
    includeFile = require('gulp-rigger');

var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: './src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: './src/js/**/*.js',//В стилях и скриптах нам понадобятся только main файлы
        css: './src/css/**/*.css',
        sass: './src/sass/**/*.scss',
        img: './src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: './src/fonts/**/*.*'
    }
};


function preproc(){
    return gulp.src(path.src.sass)
        .pipe(plumber())
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

}

// style
function styles() {
    return gulp.src(path.src.css)
        .pipe(plumber())
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
}

// js
function scripts(){
    return gulp.src(path.src.js)
        .pipe(plumber())
        .pipe(includeFile())
        .pipe(sourcemaps.init())
        .pipe(minJS()) //Сожмем наш js
        .pipe(rename({suffix: '.min'})) // Добавляем в название файла суфикс .min
        .pipe(gulp.dest(path.build.js))

}

gulp.task('scripts', scripts);
gulp.task('styles', styles);
gulp.task('preproc', preproc);



