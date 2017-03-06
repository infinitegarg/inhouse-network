
/**
 * Every module we use in our tasks we must first import. We do this by 
 * using 'require' (node-syntax). Remember, this code (this gulpfile and gulp) will
 * only be run in node, in the terminal. This is only for development.
 * We are importing functions and objects from the modules here. We are saving
 * them to a variable. You can name these variables anything you like, just use
 * the same name throughout the gulpfile.
 * When we write 'require('gulp')' we don't have to supply a search path, the
 * require-statement knows that it should firstly look inside the 'node_modules'
 * -folder for these modules. If not found (if not installed), you will get an error.
 */

//utils
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const gutil = require('gulp-util');
const rename = require('gulp-rename');

//css
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');

//babel + browserify
const babel = require('gulp-babel');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');



/*
 * Our 'default' task in in charge of creating the server that
 * will server our files. We are creating a 'localhost' so the page
 * can be automatically updated when we save our work.
 */
gulp.task('default', ['sass', 'babel'], () => {
    //Init the server, serv the content from our root: ./
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    //gulp.watch is the function in charge of watching for changes in our files
    //For the moment we are watching two file endings: all html-files in root
    //and all scss-files in ./src/scss. Any changes to our scss-files will update
    //our main.css in ./dist/css
    gulp.watch("./*.html").on('change', browserSync.reload);

    //When we update our files in ./src/scss, the 'sass'-task will automatically run
    gulp.watch('./src/scss/**/*.scss', ['sass']);
    gulp.watch('./src/js/*.js', ['babel']);
});

/*
 * This gulp task is in charge of converting the scss files to css files like we did with
 * 'sass scss:css --watch' earlier. It takes a source, our scss files in ./src/scss and 
 * then it pipes it, passes it forward, to another function. This is basically like doing
 * callbacks in our code. We first pass it to our function that converts our files to css:
 * sass() which we imported earlier. Then we pass it to our postcss-function. Postcss
 * can do many things but right now we only want to prefix our css-files.
 */
gulp.task('sass', () => {
    return gulp.src('./src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        //We are telling postcss-function to run autoprefixer-function as a callback
        //We are also supplying arguments, which browsers to support.
        .pipe(postcss([autoprefixer({browsers: ['last 2 versions']}), cssnano()]))
        //When we are finished converting our scss to css we have to save it somewhere
        //with gulp.dest() we are telling gulp where to write the finished file. In my
        //case I usually put it in a different folder named 'dist'.
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/css'))
        //Lastly we want to tell browser-sync, our localhost, that we have updated
        //our css and the browser should update. So we pass pipe our changes to
        //browser-sync that updates the browser.
        .pipe(browserSync.stream());
});

/*
 * This us pure arcane witchcraft on how to use modules in the browser with browserify.
 * Don't blame me if you accidentally summon some beast from below with this code.
 */
gulp.task('babel', function() {
    //Browserify takes our file and packs it node-style. It collects all imports
    //and exports and creates a single 'bundle.js'-file that can be read by the browser
    //Without browserify, the browser can not handle imports and exports. Here we
    //specify which input-file we will use.
    browserify({
        entries: './src/js/main.js',
        debug: true
    })
    //Instead of gulp-babel we will runt babelify which is babel but for browserify
    //It is more adapted to use with browserify. We still have to supply a preset.
    .transform(babelify, { presets: ['env'] })
    //If we run in to some error it will log in the console instead of
    //crashing with the 'gulp-util'-module
    .on('error',gutil.log)
    //With bundle() we say that we want to pack it all togehter
    .bundle()
    //Same here, if something goes wrong, log it instead of crashing. Always check the
    //log, log lady.
    .on('error',gutil.log)
    //And convert everything to a single 'bundle.js' that we can link to in our
    //index.html. (see script-tag in index.html)
    .pipe(source('bundle.js'))
    //As always we have to save it to
    .pipe(gulp.dest('dist/js'));
});