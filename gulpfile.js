'use strict';

const gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    gcmq = require('gulp-group-css-media-queries');


function preproc(){
    return gulp.src('./src/sass/**/*.scss')
        .pipe(plumber())
        .pipe(sass())// компилим sass
        .pipe(gcmq())
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['> 0.1%'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/css'))

}

// style
function styles(){
    return gulp.src('./src/css/**/*.css')
        .pipe(gcmq())
        .pipe(autoprefixer({
            browsers: ['> 0.1%'],
            cascade: false
        }))
        .pipe(concat('general.css'))
        .pipe(gulp.dest('build/css'))

}

// js
function scripts(){
    return gulp.src('./src/js/**/*.js')
        .pipe(gulp.dest('build/js'))

}

gulp.task('styles', styles);
gulp.task('scripts', scripts);
gulp.task('preproc', preproc);