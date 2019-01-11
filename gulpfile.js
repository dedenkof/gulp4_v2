'use strict';

const gulp = require('gulp'),
    //watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    //cssfont64 = require('gulp-cssfont64'),
    //browserSync = require("browser-sync").create(),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

// В обьект прописываем нужные пути
const path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'src/css/main.scss',
        img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/css/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

// Переменная с настройками нашего dev сервера
const config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Devil"
};

// запустим livereload сервер с настройками, которые мы определили в объекте config
gulp.task('webserver', function (done) {
    browserSync(config);
    done();
});

// Очистка
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

// Сборка html
gulp.task('html', function (done) {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
    done();
});

// Сборка js
gulp.task('js', function (done) {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger для импорта файлов
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
    done();
});

// Сборка стилей нашего SCSS
gulp.task('style', function (done) {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass({
            sourceMap: true,
            errLogToConsole: true
        })) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(cssmin()) //Сожмем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true}));
    done();
});

// Собираем картинки
gulp.task('image', function (done) {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));
    done();
});

// Собираем шрифты
gulp.task('fonts', function(done) {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
    done();
});


gulp.task('watch', gulp.series(['html', 'js', 'style', 'fonts', 'image']), function() {
    gulp.watch('path.watch.html', gulp.series('html'));
    gulp.watch('path.watch.style',gulp.series('style'));
    gulp.watch('path.watch.js', gulp.series('js'));
    gulp.watch('path.watch.img', gulp.series('image'));
    gulp.watch('path.watch.fonts', gulp.series('fonts'));

});

gulp.task('build',gulp.series(['clean',gulp.parallel('html', 'js', 'style', 'fonts', 'image')]));

gulp.task('default', gulp.series(['build', gulp.parallel('watch', 'webserver')]));