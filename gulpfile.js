'use strict';

const gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    useref = require('gulp-useref'),
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
    browserSync = require('browser-sync'),
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

// INITIAL path value

const path = {
    build: {
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

    // inject order file (include file optional manually)
    inject: {
        css: {
            googleFonts: 'fonts/google/googlecss/googlefonts.css',
            bootstrap: 'css/bootstrap/bootstrap.min.css',
            bootstrapGrid: 'css/bootstrap/bootstrap-grid.min.css',
            animate: 'css/animate/animate.min.css',
            custom: 'css/custom.min.css'
        },
        js: {
            jshtml5shiv:{
                es5: 'js/html5shiv/es5-shim.min.min.js',
                print: 'js/html5shiv/html5shiv-printshiv.min.min.js',
                html5shiv: 'js/html5shiv/html5shiv.min.min.js'
            },
            jquery: 'js/jquery/jquery.min.js',
            bootstrap: 'js/bootstrap/bootstrap.min.js',
            respond: 'js/respond/respond.min.min.js',
            pageScroll: 'js/scroll2id/PageScroll2id.min.min.js',
            main: 'js/main.min.js'

        }
    },
    src: {
        src: 'src/',
        php: 'src/**/**/**/*.php',
        mainHTML: 'src/index.html',
        html: 'src/*.html',
        robotsTXT: 'src/robots.txt',
        js: 'src/js/*.js',
        jsLib: 'src/js/libs/**/*.js',
        css: 'src/css/**/*.css',
        cssLib: 'src/css/libs/**/*.css',
        sass: 'src/sass/**/*.scss',
        img: 'src/img/**/*.{png,xml,jpg,gif,svg,ico,webmanifest}',
        fonts: 'src/fonts/**/*.*',
        fontsGoogle: 'src/fonts/',
        htaccess: 'src/.htaccess',
        sprites: 'src/img/sprites/*.png',
        svgSprites: 'src/img/sprites/svg-sprite/',
        svg: 'src/img/uploads/svg-sprite-pack/**/*.svg',
        favicons: 'src/img/favicons/',
        extSVG: '.svg',
        extPNG: '.png'
    },
    libsCSS: {
        bootstrapCSS: 'node_modules/bootstrap/dist/css/bootstrap.css',
        bootstrapGrid: 'node_modules/bootstrap/dist/css/bootstrap-grid.css',
    },
    libsJS: {
        jquery: 'node_modules/jquery/dist/jquery.js',
        bootstrapJS: 'node_modules/bootstrap/dist/js/bootstrap.js'
    },
    watch: {
        html: 'src/**/*.html',
        php: 'src/**/*.php',
        pug: 'src/pug/**/*.pug',
        robotsTXT: 'src/robots.txt',
        favicons: 'src/img/favicons/',
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

// CONFIG settings file

// Google Web Fonts options
const options = {
    relativePaths: true,
    fontsDir: 'googlefonts/',
    cssDir: 'googlecss/',
    cssFilename: 'googlefonts.css'
};

// File where the favicon markups are stored
const FAVICON_DATA_FILE = 'faviconData.json';

// Fonts name iconFontBuild (fonts from svg icons)
const fontName = 'font-icons',
    runTimestamp = Math.round(Date.now()/1000);

// Config autoprefixer add prefix to the browsers
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

// Notify error
const onError = function(err) {
    notify.onError({
        title: 'Error in ' + err.plugin,
    })(err);
    this.emit('end');
};

// send to GH pages (branch gh-pages repository (manually))
gulp.task('deploy', () =>
    gulp.src('/build/**/*')
        .pipe(ghPages())
);

// deploy the project to the hosting via sftp protocol (manually)
gulp.task('sftp', () =>
    gulp.src(path.build)
        .pipe(sftp({
            host: 'website.com',
            user: 'john',
            pass: '12345',
            remotePath: '/home/../public_html/'
        }))
);

// Deploy php files (manually)
gulp.task('php', () =>
     gulp.src(path.src.php)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))// убираем комментарии <!--DEV ... -->
        .pipe(gulp.dest(path.build.html))
);

// Listing package.json dependencies and copy css libs files of them  to build/css
gulp.task('copyLibsCSS', () =>
    gulp.src(npmDist({
        excludes: [
            '/**/*.txt',
            '/**/*.js',
            '/**/bootstrap-reboot.min.css'
        ]
    }), { base: './node_modules' })
        .pipe(flatten({ includeParents: 1}))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({ browsers: autoprefixerList, cascade: false}))
        .pipe(gcmq())
        //.pipe(concat('libs.css'))
        //.pipe(rename({suffix: '.min'})) // Добавляем в название файла суфикс .min
        .pipe(cleanCSS({level: 2}))
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.reload({
            stream: true
        }))
);

// Listing package.json dependencies and copy js libs files of them  to build/css
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
       .pipe(plumber({ errorHandler: onError }))
       .pipe(sourcemaps.init())
       .pipe(minJS())
       //.pipe(concat('libs.js'))
       //.pipe(rename({suffix: '.min'}))
       .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest(path.build.js))
       .pipe(browserSync.reload({
           stream: true
       }))
);

// Deploy html files (rigger template from ./tempalte )
gulp.task('html', () =>
     gulp.src(path.src.html)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(includeFiles())
         //.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        /*.pipe(htmlmin({
         collapseWhitespace: true,
         removeComments: false
         }))*/
        .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
        .pipe(gulp.dest(path.build.html))
        .on('end', browserSync.reload)
);

// Deploy html via pug (manually)
gulp.task('pug', () =>
   gulp.src('src/pug/**/**/*.pug')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(includeFiles())
        .pipe(pug({pretty: true}))
        /*.pipe(htmlmin({
         collapseWhitespace: true,
         removeComments: false
         }))*/
        .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
        .pipe(gulp.dest(path.build.html))
        .on('end', browserSync.reload)
);

// Deploy css via sass preprocessor
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

// Deploy css via stylus preprocessor (manually) need make markup project under stylus
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

// Copy src/css/libs and node_modules source to build/css
gulp.task('cssLibs', () =>
    gulp.src(path.src.cssLib)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({ browsers: autoprefixerList, cascade: false}))
        .pipe(gcmq())
        //.pipe(concat('libs.css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.reload({
            stream: true
        }))
);

// Copy src/js/libs and node_modules source to build/js
gulp.task('scriptsLibs', () =>
    gulp.src(path.src.jsLib)
        .pipe(includeFiles())
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(minJS())
        ///.pipe(concat('libs.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.reload({
            stream: true
        }))

);

// Transfer custom js to build
gulp.task('scripts', () =>
    gulp.src(path.src.js)
        .pipe(includeFiles())
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(minJS())
        //.pipe(concat('general.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.reload({
            stream: true
        }))

);

// Include style, js, favicon and markup to main page
gulp.task('inject', (done) => {

    const injectStyles = gulp.src([path.build.injectFontsCSS, path.build.injectCSS], {read: false});

    const injectScripts = gulp.src(path.build.injectJS, {read: false});

    gulp.src(path.src.html)
        .pipe(includeFiles())
        /*Inject the favicon markups in your HTML pages. You should run
         this task whenever you modify a page. You can keep this task
         as is or refactor your existing HTML pipeline.*/

        .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        .pipe(inject(injectStyles, {ignorePath:  'build', addRootSlash: false, relative: false}))
        .pipe(inject(injectScripts, {ignorePath: 'build', addRootSlash: false, relative: false}))

        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.reload({
            stream: true
        }));
    done();
});

// Generate sprite from png image and compile png image files
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

// Generate sprite from svg image and compile svg image files
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

// Generate fonts files (eot, svg, ttf, woff) and compile to src/fonts/icons/${fontName} directory
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



// Copy all generated img files into build directory
gulp.task('images', () =>
    gulp.src([
        path.src.img,
        `!${path.src.src}img/uploads/*-pack/**/*.*`  // exclude source for mask *-pack/**/*.*
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
            verbose: true // output status treatment img files
            }
        )))

        .pipe(gulp.dest(path.build.img))
        .pipe(browserSync.reload({
            stream: true
        }))
);

// Download and generate css files google fonts
gulp.task('googleFonts', () =>
    gulp.src('./googlefonts.list')
        .pipe(googleWebFonts(options))
        .pipe(gulp.dest(`${path.build.fonts}google`))
);

// Copy all fonts include google into build directory
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
        masterPicture: `${path.src.favicons}ORIGIN_FAVICON${path.src.extPNG}`,
        dest: path.src.favicons,
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

// Copy .htaccess to build dir
gulp.task('htaccess', () =>
    gulp.src(path.src.htaccess)
        .pipe(gulp.dest(path.build.htaccess))
);

// Copy robots.txt to build dir
gulp.task('robotsTXT', () =>
    gulp.src(path.src.robotsTXT)
        .pipe(gulp.dest(path.build.html))
);

//testing your build html files
gulp.task('validation', () =>
    gulp.src(`${path.build.html}**/*.html`)

        .pipe(html5Lint())
);
//testing your build css files
gulp.task('cssLint', () =>
    gulp.src(path.src.sass)
        .pipe(stylelint())
);

// reload after change via browserSync
gulp.task('serve', () => {
        browserSync(config);
    }
);

// delete build dir
gulp.task('clean', (cb) =>
    rimraf(path.cleanBuild, cb)
);

// clear cashe images
gulp.task('clearCache', () =>
    cache.clearAll()
);


gulp.task('watch', function() {
    gulp.watch(path.watch.pug, gulp.series('pug'));
    gulp.watch(path.watch.htaccess, gulp.series('htaccess'));
    gulp.watch(path.watch.html, gulp.series('html'));
    gulp.watch(path.watch.php, gulp.series('php'));
    gulp.watch(path.watch.sass, gulp.series('sass'));
    gulp.watch(path.watch.css, gulp.series('cssLibs'));
    gulp.watch(path.watch.js, gulp.series('scripts'));
    gulp.watch(path.watch.js, gulp.series('scriptsLibs'));
    gulp.watch(path.watch.img, gulp.series('images'));
    gulp.watch(path.watch.fonts, gulp.series('fonts'));
    gulp.watch(path.watch.robotsTXT, gulp.series('robotsTXT'));
    gulp.watch(path.watch.favicons, gulp.series('generate-favicon'));
});

/*-- MANUALLY RUN TASK --*/
// ['deploy', 'sftp', 'validation', 'cssLint', 'clearCache', 'check-for-favicon-update']

/*-- GULP RUN ALL TASK CMD GULP --*/

gulp.task('assetsBASE', gulp.series(['htaccess', 'robotsTXT', 'html']));  // IF need add 'pug', 'php', tasks

gulp.task('assetsCSS', gulp.series(['sass', 'cssLibs', 'copyLibsCSS'])); // IF need add stylus

gulp.task('assetsJS', gulp.series([ 'scriptsLibs', 'copyLibsJS', 'scripts']));

gulp.task('assetsIMG', gulp.series(['spritePNG', 'svgSpriteBuild', 'generate-favicon', 'images']));

gulp.task('assetsFONTS', gulp.series(['iconFontBuild', 'googleFonts', 'fonts']));

gulp.task('build', gulp.series(['clean', gulp.parallel('assetsBASE', 'assetsIMG', 'assetsCSS', 'assetsJS', 'assetsFONTS' ), 'inject']));

gulp.task('default', gulp.series(['build', gulp.parallel('watch', 'serve')]));
