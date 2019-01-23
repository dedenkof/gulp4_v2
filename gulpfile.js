'use strict';

const gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    svgmin = require('gulp-svgmin'),
    iconfont = require('gulp-iconfont'),
    iconfontCss = require('gulp-iconfont-css'),
    sass = require('gulp-sass'),
    cheerio = require('gulp-cheerio'),
    svgSprite = require('gulp-svg-sprite'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
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
    spritesmith = require('spritesmith'),
    googleWebFonts = require('gulp-google-webfonts'),
    replace = require('gulp-replace'),
    htmlmin = require('gulp-htmlmin'),
    pug = require('gulp-pug'),
    sftp = require('gulp-sftp'),
    cache = require('gulp-cache');

const path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        htaccess: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/',
        sprites: 'build/img/sprites/',
        spritesCss: 'build/css/partial/',
        svg: 'build/img/svg/',
        injectCSS: 'build/css/**/*.css',
        injectJS: 'build/js/**/*.js'
    },
    src: { //Пути откуда брать исходники
        src: 'src/',
        mainHTML: 'src/index.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        favi: 'src/*.ico',
        js: 'src/js/*.js',//В стилях и скриптах нам понадобятся только main файлы
        jsLib: 'src/js/libs/**/*.js',//В стилях и скриптах нам понадобятся только main файлы
        css: 'src/css/**/*.css',
        cssLib: 'src/css/libs/**/*.css',
        sass: 'src/sass/**/*.scss',
        img: 'src/img/**/*.{png,jpg,gif,svg}', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*',
        fontsGoogle: 'src/fonts/',
        htaccess: 'src/.htaccess',
        sprites: 'src/img/sprites/*.png',
        svgSprites: 'src/img/sprites/svg-sprite/',
        svg: 'src/img/svg/**/*.svg'
    },
    libsCSS: {
        bootstrapCSS: 'node_modules/bootstrap/dist/css/bootstrap.css',
        bootstrapGrid: 'node_modules/bootstrap/dist/css/bootstrap-grid.css',
    },
    libsJS: {
        jquery: 'node_modules/jquery/dist/jquery.js', // Берем jQuery
        bootstrapJS: 'node_modules/bootstrap/dist/js/bootstrap.js'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        favi: 'src/*.ico',
        js: 'src/js/**/*.js',
        css: 'src/css/**/*.scss',
        sass: 'src/sass/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        htaccess: 'src/.htaccess',
        sprites: 'src/img/sprites/*.png',
        svg: 'src/img/svg/**/*.svg'
    },

    cleanBuild: './build'
};

const onError = function(err) {
    notify.onError({
        title: 'Error in ' + err.plugin,
    })(err);
    this.emit('end');
};

const options = { };

const autoprefixerList = [
    'Chrome >= 45',
    'Firefox ESR',
    'Edge >= 12',
    'Explorer >= 10',
    'iOS >= 9',
    'Safari >= 9',
    'Android >= 4.4',
    'Opera >= 30'
];

const config = {
    server: {
        baseDir: "./build"
    },
    tunnel: false,
    // startPath: 'index.html',
    host: 'localhost',
    port: 9000,
    //proxy: "yourlocal.dev",
    logPrefix: "Frontend_History_Action"
};

gulp.task('sftp', function (){
    return gulp.src(path.build)
        .pipe(sftp({
            host: 'website.com',
            user: 'john',
            pass: '12345',
            remotePath: '/home/../public_html/'
        }));

});


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

gulp.task('pug', function () {
    return gulp.src('src/pug/pages/*.pug')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(includeFiles())
        .pipe(pug({pretty: true}))
        /*.pipe(htmlmin({
         collapseWhitespace: true,
         removeComments: false
         }))*/
        .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, '')) // убираем комментарии <!--DEV ... -->
        .pipe(gulp.dest(path.build.html))
        .on('end', browserSync.reload);
});

gulp.task('sass', function (){
    return gulp.src(path.src.sass)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}))
        .pipe(autoprefixer({ browsers: autoprefixerList, cascade: false}))
        .pipe(gcmq())
        .pipe(concat('custom.css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cleanCSS({level: 2}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.reload({
            stream: true
        }));

});

gulp.task('stylus', function (){
    return gulp.src('src/stylus/main.styl')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(stylus({include_css: true}))
        .pipe(autoprefixer({ browsers: autoprefixerList, cascade: false}))
        .pipe(gcmq())
        .pipe(concat('custom2.css'))
        .pipe(rename({suffix: '.min'}))
        // .pipe(cleanCSS({level: 2}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.reload({
            stream: true
        }));

});

gulp.task('cssLibs', function () {
    return gulp.src([path.src.cssLib, path.libsCSS.bootstrapCSS, path.libsCSS.bootstrapGrid])
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({ browsers: autoprefixerList, cascade: false}))
        .pipe(gcmq())
        //.pipe(concat('libs.css'))
        //.pipe(rename({suffix: '.min'})) // Добавляем в название файла суфикс .min
        /*.pipe(cleanCSS({
            level: 2
        }))*/
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('scriptsLibs', function (){
    return gulp.src([path.libsJS.jquery, path.libsJS.bootstrapJS, path.src.jsLib])
        //.pipe(includeFiles())
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        //.pipe(minJS()) //Сожмем наш js
        //.pipe(concat('libs.js'))
        //.pipe(rename({suffix: '.min'})) // Добавляем в название файла суфикс .min
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.reload({
            stream: true
        }));

});

gulp.task('scripts', function (){
    return gulp.src(path.src.js)
        .pipe(includeFiles())
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(minJS()) //Сожмем наш js
        .pipe(concat('general.js'))
        .pipe(rename({suffix: '.min'})) // Добавляем в название файла суфикс .min
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.reload({
            stream: true
        }));

});

gulp.task('inject', function () {

    const injectStyles = gulp.src(path.build.injectCSS, { read: false });

    const injectScripts = gulp.src(path.build.injectJS, { read: false });

    return gulp.src(path.src.html)
        .pipe(flatten({ subPath: [1, 1]}))
        .pipe(includeFiles())

        .pipe(inject(injectStyles, { ignorePath: 'src', addRootSlash: false, relative: true }))
        .pipe(inject(injectScripts, { ignorePath: 'src', addRootSlash: false, relative: true }))

        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('images', function () {
    return gulp.src([path.src.img, '!' + path.src.src + 'img/svg/**/*.*']) //Выберем наши картинки кроме svg иконок
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


/*gulp.task('sprites', function () {
    const spriteData =
        gulp.src(path.src.sprites) //выберем откуда брать изображения для объединения в спрайт
            .pipe(spritesmith({
                imgName: 'sprite.png', //имя спрайтового изображения
                cssName: 'sprite.sass', //имя стиля где храним позиции изображений в спрайте
                imgPath: 'images/sprite.png', //путь где лежит спрайт
                cssFormat: 'sass', //формат в котором обрабатываем позиции
                cssTemplate: 'scss.template.mustache', //файл маски
                cssVarMap: function(sprite) {
                    sprite.name = 's-' + sprite.name //имя каждого спрайта будет состоять из имени файла и конструкции 's-' в начале имени
                }
            }));
    spriteData.img.pipe(gulp.dest(path.build.sprites)); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest(path.build.spritesCss)); // путь, куда сохраняем стили
});*/

gulp.task('spritePNG', function() {
    const spriteData =
        gulp.src('src/img/sprite/*.*', '!' + path.src.src + 'img/sprites/svg-sprite/**/*.*') // путь, откуда берем картинки для спрайта
            .pipe(spritesmith({
                imgName: 'sprite.png',
                cssName: '_sprite.scss',
                cssFormat: 'scss',
                algorithm: 'binary-tree',
                padding: 1,
                cssTemplate: 'scss.template.mustache',
                cssVarMap: function(sprite) {
                    sprite.name = 's-' + sprite.name
                }//
            }));

    spriteData.img.pipe(gulp.dest('src/img/sprites')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('src/sass/')); // путь, куда сохраняем стили
});



 	/*let fontName = 'iconfont';
    gulp.task('iconfont', function () {
 	gulp.src([path.src.svg])
 		.pipe(iconfontCss({
 			path: 'assets/sass/templates/_icons_template.scss',
 			fontName: fontName,
 			targetPath: '../../sass/_icons.scss',
 			fontPath: '../fonts/icons/',
 			svg: true
 		}))
 		.pipe(iconfont({
 			fontName: fontName,
 			svg: true,
 			formats: ['svg','eot','woff','ttf']
 		}))
 		.pipe(gulp.dest('assets/fonts/icons'));
 });*/

//copy sprite.svg
gulp.task('copySpriteSVG', function () {
    return gulp.src('src/img/sprites/*.svg')
        .pipe(plumber())
        .pipe(gulp.dest('build/img/sprites/'))
});

gulp.task('svgSpriteBuild', function () {
        return gulp.src(path.src.svg)
            .pipe(svgmin({
                js2svg: {
                    pretty: true
                }
            }))
            .pipe(cheerio({
                run: function ($) {
                    $('fill').removeAttr();
                    $('stroke').removeAttr();
                    $('style').removeAttr();
                    $('class').removeAttr();

                },
                parserOptions: {xmlMode: true}
            }))
            .pipe(replace('&gt;', '>'))
            .pipe(svgSprite({
                mode: {
                    symbol: {
                        sprite: '../svg-sprite/sprite.svg',
                        render: {
                            scss: {
                                dest: '../../../sass/icons/_sprite.scss',
                                template: path.src.src + 'sass/templates/_sprite_template.scss'
                            }
                        },
                        example: true
                    }
                }

                /*dest : '.',
                mode : {
                    css : {
                        dest : '.',
                        sprite : 'img/sprites/sprite.svg',
                        render : {
                            css : {dest : 'css/sprite.css'},
                            scss : {
                                dest: '../../../sass/icons/_sprite.scss'
                            }
                        },
                    }
                }*/
            }))
            .pipe(gulp.dest(path.src.svgSprites));
});

//copy sprite.svg
gulp.task('copySpriteSVG', function () {
    return gulp.src(path.src.svgSprites)
        .pipe(gulp.dest(path.build.sprites))
});

gulp.task('fonts', function() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

gulp.task('favicon', function() {
    return gulp.src(path.src.src + 'favicon.ico')
        .pipe(gulp.dest(path.build.html));
});

gulp.task('htaccess', function() {
    return gulp.src(path.src.htaccess)
        .pipe(gulp.dest(path.build.htaccess))
});

gulp.task('serve', function () {
    return browserSync(config);
});



gulp.task('clean', function (cb) {
    return rimraf(path.cleanBuild, cb)
});



/*gulp.task('watch', function() {
    gulp.watch(path.watch.html, gulp.series('html'));
    gulp.watch(path.watch.sass, gulp.series('sass'));
    gulp.watch(path.watch.css, gulp.series('cssLibs'));
    gulp.watch(path.watch.js, gulp.series('scripts'));
    gulp.watch(path.watch.js, gulp.series('scriptsLibs'));
    gulp.watch(path.watch.js, gulp.series('images'));
    gulp.watch(path.watch.fonts, gulp.series('fonts'));
});

gulp.task('assets', gulp.series(['html', 'sass', 'cssLibs', 'scripts', 'scriptsLibs', 'images', 'fonts']));


gulp.task('build', gulp.series('clean', 'assets', gulp.parallel('inject')));


gulp.task('default', gulp.series(['build', gulp.parallel('watch', 'serve')]));*/



