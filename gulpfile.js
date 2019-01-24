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
    spritesmith = require('gulp.spritesmith'),
    googleWebFonts = require('gulp-google-webfonts'),
    replace = require('gulp-replace'),
    htmlmin = require('gulp-htmlmin'),
    pug = require('gulp-pug'),
    sftp = require('gulp-sftp'),
    cache = require('gulp-cache'),
    flatten = require('gulp-flatten'),
    gifsicle = require('imagemin-gifsicle'),
    jpegtran = require('imagemin-jpegtran'),
    optipng = require('imagemin-optipng'),
    html5Lint = require('gulp-html5-lint'),
    stylelint = require('stylelint'),
    realFavicon = require ('gulp-real-favicon'),
    fs = require('fs'),
    npmDist = require('gulp-npm-dist');

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
        svg: 'src/img/uploads/svg-sprite-pack/**/*.svg'
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

const FAVICON_DATA_FILE = 'faviconData.json';

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

gulp.task('copyLibsCSS', function () {
    return gulp.src(npmDist({
        excludes: [
            '/**/*.txt',
            '/**/*.js',
            '/**/bootstrap-reboot.min.css'
        ]
    }), { base: './node_modules' })
        .pipe(flatten({ includeParents: 1}))
        .pipe(gulp.dest(path.build.css));
});

gulp.task('copyLibsJS', function () {
    return gulp.src(npmDist({
        excludes: [
            '/**/*.txt',
            '/**/*.css',
            '/**/core.js',
            '/**/jquery.slim.min.js',
            '/**/bootstrap.bundle.min.js'
        ]
    }), { base: './node_modules' })
        .pipe(flatten({ includeParents: 1}))
        .pipe(gulp.dest(path.build.js));
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


gulp.task('spritePNG', function(done) {
    const spriteData =
        gulp.src('src/img/uploads/png-sprite-pack/**/*.png')
            .pipe(spritesmith({
                imgName: 'sprite.png',
                cssName: '_sprite.scss',
                cssFormat: 'scss',
                algorithm: 'binary-tree',
                padding: 1,
                cssTemplate: 'sprite.scss.template.mustache',
                cssVarMap: function(sprite) {
                    sprite.name = 's-' + sprite.name
                }
            }));

    spriteData.img.pipe(gulp.dest('src/img/sprites/png-sprite/')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('src/sass/templates/')); // путь, куда сохраняем стили
    done();
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
                        sprite: '../sprite.svg',
                        render: {
                            scss: {
                                dest: '../../../sass/icons/_sprite.scss',
                                template: path.src.src + 'sass/templates/_sprite_template.scss'
                            }
                        },
                        example: true
                    }
                }

            }))
            .pipe(gulp.dest(path.src.svgSprites));
});

gulp.task('images', function () {
    return gulp.src([
        path.src.img,
        '!' + path.src.src + 'img/uploads/png-sprite-pack/**/*.*',
        '!' + path.src.src + 'img/uploads/svg-sprite-pack/**/*.*'
    ])
        .pipe(gulp.dest(path.build.img))
        .pipe(cache(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 8}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ],{
                verbose: true
            }
        )))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('fonts', function() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

// https://github.com/RealFaviconGenerator/gulp-real-favicon
// http://riotweb.ru/blog/Generacij-favikonok-pri-pomoshhi-Gulp.html
gulp.task('generate-favicon', function(done) {
    realFavicon.generateFavicon({
        masterPicture: 'app/images/master_picture.png',
        dest: 'dist/images/icons',
        iconsPath: '/',
        design: {
            ios: {
                pictureAspect: 'noChange',
                assets: {
                    ios6AndPriorIcons: false,
                    ios7AndLaterIcons: false,
                    precomposedIcons: false,
                    declareOnlyDefaultIcon: true
                }
            },
            desktopBrowser: {},
            windows: {
                pictureAspect: 'noChange',
                backgroundColor: '#da532c',
                onConflict: 'override',
                assets: {
                    windows80Ie10Tile: false,
                    windows10Ie11EdgeTiles: {
                        small: false,
                        medium: true,
                        big: false,
                        rectangle: false
                    }
                }
            },
            androidChrome: {
                pictureAspect: 'noChange',
                themeColor: '#ffffff',
                manifest: {
                    display: 'standalone',
                    orientation: 'notSet',
                    onConflict: 'override',
                    declared: true
                },
                assets: {
                    legacyIcon: false,
                    lowResolutionIcons: false
                }
            }
        },
        settings: {
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false,
            readmeFile: false,
            htmlCodeFile: false,
            usePathAsIs: false
        },
        markupFile: FAVICON_DATA_FILE
    }, function() {
        done();
    });
});

gulp.task('inject-favicon-markups', function() {
    return gulp.src(['dist/*.html', 'dist/dir/*.html'])
        .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        .pipe(gulp.dest('dist'));
});

gulp.task('check-for-favicon-update', function(done) {
    var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
    realFavicon.checkForUpdates(currentVersion, function(err) {
        if (err) {
            throw err;
        }
    });
});

gulp.task('htaccess', function() {
    return gulp.src(path.src.htaccess)
        .pipe(gulp.dest(path.build.htaccess))
});

//testing your build files
gulp.task('validation', function () {
    return gulp.src(path.build.html + '**/*.html')
        .pipe(html5Lint());
});

gulp.task('cssLint', function () {
    return gulp.src(path.src.sass)
        .pipe(stylelint())
});


gulp.task('serve', function () {
    return browserSync(config);
});



gulp.task('clean', function (cb) {
    return rimraf(path.cleanBuild, cb)
});

gulp.task('clearCash', function () {
    return cache.clearAll()
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



