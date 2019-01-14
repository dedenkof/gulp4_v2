'use strict';

const gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    gcmq = require('gulp-group-css-media-queries'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename');



function preproc(){
    return gulp.src('./src/sass/**/*.scss')
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
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/css'))

}

// style
function styles() {
    return gulp.src('./src/css/**/*.css')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['> 0.1%'],
            cascade: false
        }))
        .pipe(gcmq())
        .pipe(concat('general.css'))
        .pipe(rename({suffix: '.min'})) // Добавляем в название файла суфикс .min
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/css'))
}

// js
function scripts(){
    return gulp.src('./src/js/**/*.js')
        .pipe(gulp.dest('build/js'))

}

gulp.task('scripts', scripts);
gulp.task('styles', styles);
gulp.task('preproc', preproc);



