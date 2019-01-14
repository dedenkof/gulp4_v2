'use strict';

const gulp = require('gulp'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber');

function preproc(){
    return gulp.src('./src/sass/**/*.scss')
        .pipe(plumber())
        .pipe(sass())// компилим sass
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/css'));
}

// style
function styles(){
    return gulp.src('./src/css/**/*.css')
        .pipe(concat('general.css'))
        .pipe(gulp.dest('build/css'));
}

// js
function scripts(){
    return gulp.src('./src/js/**/*.js')
        .pipe(gulp.dest('build/js'));
}

gulp.task('styles', styles);
gulp.task('scripts', scripts);
gulp.task('preproc', preproc);


// Merge all css files in one
/*
 gulp.task('css', function(){
 return gulp.src('app/css/!*.css')
 .pipe(concatCss("all-pluging.css"))
 .pipe(minifyCss())
 .pipe(gulp.dest('dist/css'));
 });*/
