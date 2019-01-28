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
    babel = require('gulp-babel'),
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
    ghPages = require('gulp-gh-pages'),
    /* Generate favicon */
    realFavicon = require ('gulp-real-favicon'),
    fs = require('fs'),
    /* //Generate favicon */
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
        injectFontsCSS: 'build/fonts/**/*.css',
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
        svg: 'src/img/uploads/svg-sprite-pack/**/*.svg',
        extSVG: '.svg',
        extPNG: '.png'
    },
    libsCSS: {
        bootstrapCSS: 'node_modules/bootstrap/dist/css/bootstrap.css',
        bootstrapGrid: 'node_modules/bootstrap/dist/css/bootstrap-grid.css',
    },
    libsJS: {
        jquery: 'node_modules/jquery/dist/jquery.js', // Берем jQuery
        bootstrapJS: 'node_modules/bootstrap/dist/js/bootstrap.js'
    },
    watch: {
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

// Проверка существования файла/папки
function fileExist(path) {
    const fs = require('fs');
    try {
        fs.statSync(path);
    } catch(err) {
        return !(err && err.code === 'ENOENT');
    }
}


const onError = function(err) {
    notify.onError({
        title: 'Error in ' + err.plugin,
    })(err);
    this.emit('end');
};

// Google Web Fonts options
const options = {
    relativePaths: true,
    fontsDir: 'googlefonts/',
    cssDir: 'googlecss/',
    cssFilename: 'googlefonts.css'
};

// File where the favicon markups are stored
const FAVICON_DATA_FILE = 'faviconData.json';

const fontName = 'iconfont',
    runTimestamp = Math.round(Date.now()/1000);

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

// browserSync config
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

// ЗАДАЧА, ВЫПОЛНЯЕМАЯ ТОЛЬКО ВРУЧНУЮ: Отправка в GH pages (ветку gh-pages репозитория)
gulp.task('deploy', () =>
    gulp.src('/build/**/*')
        .pipe(ghPages())
);

gulp.task('sftp', () =>
    gulp.src(path.build)
        .pipe(sftp({
            host: 'website.com',
            user: 'john',
            pass: '12345',
            remotePath: '/home/../public_html/'
        }))
);

// ЗАДАЧА: Сборка PHP
gulp.task('php', () =>
     gulp.src(path.src.src + '/**/**/**/*.php')                  // какие файлы обрабатывать (путь из константы, маска имени)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))         // убираем комментарии <!--DEV ... -->
        .pipe(gulp.dest(path.build.html))                // записываем файлы (путь из константы)
);

gulp.task('copyLibsCSS', () =>
    gulp.src(npmDist({
        excludes: [
            '/**/*.txt',
            '/**/*.js',
            '/**/bootstrap-reboot.min.css'
        ]
    }), { base: './node_modules' })
        .pipe(flatten({ includeParents: 1}))
        .pipe(gulp.dest(path.build.css))
);

gulp.task('copyLibsJS', () =>
   gulp.src(npmDist({
        excludes: [
            '/**/*.txt',
            '/**/*.css',
            '/**/core.js',
            '/**/jquery.slim.min.js',
            '/**/bootstrap.bundle.min.js'
        ]
    }), { base: './node_modules' })
        .pipe(flatten({ includeParents: 1}))
        .pipe(gulp.dest(path.build.js))
);

gulp.task('html', () =>
     gulp.src(path.src.html)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(includeFiles())
        /*.pipe(htmlmin({
         collapseWhitespace: true,
         removeComments: false
         }))*/
        .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, '')) // убираем комментарии <!--DEV ... -->
        .pipe(gulp.dest(path.build.html))
        .on('end', browserSync.reload)
);

gulp.task('pug', () =>
   gulp.src('src/pug/pages/*.pug')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(includeFiles())
        .pipe(pug({pretty: true}))
        /*.pipe(htmlmin({
         collapseWhitespace: true,
         removeComments: false
         }))*/
        .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, '')) // убираем комментарии <!--DEV ... -->
        .pipe(gulp.dest(path.build.html))
        .on('end', browserSync.reload)
);

gulp.task('sass', () =>
    gulp.src(path.src.sass)
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
        }))

);

gulp.task('stylus', () =>
    gulp.src('src/stylus/main.styl')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(stylus({include_css: true}))
        .pipe(autoprefixer({ browsers: autoprefixerList, cascade: false}))
        .pipe(gcmq())
        .pipe(concat('custom2.css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cleanCSS({level: 2}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.reload({
            stream: true
        }))

);

gulp.task('cssLibs', () =>
    gulp.src([path.src.cssLib, path.libsCSS.bootstrapCSS, path.libsCSS.bootstrapGrid])
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
        }))
);


gulp.task('scriptsLibs', () =>
    gulp.src([path.libsJS.jquery, path.libsJS.bootstrapJS, path.src.jsLib])
        .pipe(includeFiles())
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        //.pipe(minJS()) //Сожмем наш js
        //.pipe(concat('libs.js'))
        //.pipe(rename({suffix: '.min'})) // Добавляем в название файла суфикс .min
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.reload({
            stream: true
        }))

);

gulp.task('scripts', () =>
    gulp.src(path.src.js)
        .pipe(includeFiles())
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(minJS()) //Сожмем наш js
        .pipe(concat('general.js'))
        .pipe(rename({suffix: '.min'})) // Добавляем в название файла суфикс .min
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.reload({
            stream: true
        }))

);

gulp.task('inject', (done) => {

    const injectStyles = gulp.src(path.build.injectCSS, {read: false});

    const injectScripts = gulp.src(path.build.injectJS, {read: false});

    const injectStyleFonts = gulp.src(path.build.injectFontsCSS, {read: false});



    gulp.src(path.src.html)
        .pipe(flatten({subPath: [1, 1]}))
        .pipe(includeFiles())

        .pipe(inject(injectStyles, {ignorePath: 'src', addRootSlash: false, relative: true}))
        .pipe(inject(injectScripts, {ignorePath: 'src', addRootSlash: false, relative: true}))
        .pipe(inject(injectStyleFonts, {ignorePath: 'src', addRootSlash: false, relative: true}))

        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.reload({
            stream: true
        }));
    done();
});


gulp.task('spritePNG', (done) => {
    const spriteData =
        gulp.src('src/img/uploads/png-sprite-pack/**/*.png')
            .pipe(spritesmith({
                imgName: 'sprite.png',
                cssName: '_sprite.scss',
                cssFormat: 'scss',
                algorithm: 'binary-tree',
                padding: 1,
                cssTemplate: 'sprite.scss.template.mustache',
                cssVarMap: (sprite) => {
                    sprite.name = 's-' + sprite.name
                }
            }));

    spriteData.img.pipe(gulp.dest('src/img/sprites/png-sprite/')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('src/sass/templates/')); // путь, куда сохраняем стили
    done();
});

//https://stackoverrun.com/ru/q/8204890
gulp.task('svgSpriteBuild', () =>
    gulp.src(path.src.svg)
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: ($) => {
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
                            dest: '../../../../sass/icons/_sprite.scss',
                            template: path.src.src + 'sass/templates/_sprite_template.scss'
                        }
                    }
                }
            }

        }))
        .pipe(gulp.dest(path.src.svgSprites))
);


gulp.task('iconFontBuild', () =>
 	gulp.src(path.src.svg)
 		.pipe(iconfontCss({
 			path: 'src/sass/templates/_icons_template.scss',
 			fontName: fontName,
 			targetPath: '../../../sass/icons/_icons.scss',
 			fontPath: '../fonts/icons/',
 			svg: true
 		}))
 		.pipe(iconfont({
 			fontName: fontName,
            prependUnicode: true,
            fontHeight: 1001,
 			svg: true,
            normalize: true,
 			formats: ['svg','eot','woff','ttf'],
            timestamp: runTimestamp,
 		}))
        .pipe(gulp.dest(`src/fonts/icons/${fontName}`))
 );




gulp.task('images', () =>
    gulp.src([
        path.src.img,
        `!${path.src.src}img/uploads/*-pack/**/*.*`
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
                //verbose: true
            }
        )))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(browserSync.reload({
            stream: true
        }))
);



gulp.task('googleFonts', () =>
    gulp.src('./googlefonts.list')
        .pipe(googleWebFonts(options))
        .pipe(gulp.dest(`${path.build.fonts}google`))
);

gulp.task('fonts', () =>
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
);

/*Generate the icons. This task takes a few seconds to complete.
You should run it at least once to create the icons. Then,
you should run it whenever RealFaviconGenerator updates its
package (see the check-for-favicon-update task below).*/

gulp.task('generate-favicon', (done) => {
    realFavicon.generateFavicon({
        masterPicture: 'src/img/favicons/ORIGIN_FAVICON' + path.src.extPNG,
        dest: 'src/img/favicons/',
        iconsPath: 'img/favicons/',
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
                backgroundColor: '#603cba',
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
            },
            safariPinnedTab: {
                pictureAspect: 'silhouette',
                themeColor: '#5bbad5'
            }
        },
        settings: {
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false
        },
        markupFile: FAVICON_DATA_FILE
    }, () => {
        done();
    });
});

/*Inject the favicon markups in your HTML pages. You should run
this task whenever you modify a page. You can keep this task
as is or refactor your existing HTML pipeline.*/

gulp.task('inject-favicon-markups', () =>
    gulp.src('build/*.html')
        .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        .pipe(gulp.dest(path.build.html))
);

/*Check for updates on RealFaviconGenerator (think: Apple has just
released a new Touch icon along with the latest version of iOS).
Run this task from time to time. Ideally, make it part of your
continuous integration system.*/

gulp.task('check-for-favicon-update', (done) => {
    const currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
    realFavicon.checkForUpdates(currentVersion, function(err) {
        if (err) {
            throw err;
        }
    });
    done();
});


gulp.task('htaccess', () =>
    gulp.src(path.src.htaccess)
        .pipe(gulp.dest(path.build.htaccess))
);

//testing your build files
gulp.task('validation', () =>
    gulp.src(`${path.build.html}**/*.html`)

        .pipe(html5Lint())
);

gulp.task('cssLint', () =>
    gulp.src(path.src.sass)
        .pipe(stylelint())
);


gulp.task('serve', () =>
    browserSync(config)
);



gulp.task('clean', (cb) =>
    rimraf(path.cleanBuild, cb)
);

gulp.task('clearCache', () =>
    cache.clearAll()
);

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



