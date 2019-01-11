'use strict';

const gulp = require('gulp'),
    concat = require('gulp-concat');

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


// Merge all css files in one
/*
 gulp.task('css', function(){
 return gulp.src('app/css/!*.css')
 .pipe(concatCss("all-pluging.css"))
 .pipe(minifyCss())
 .pipe(gulp.dest('dist/css'));
 });*/
