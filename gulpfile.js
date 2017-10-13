const gulp = require('gulp');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();

const scripts = require('./scripts');
const styles = require('./styles');

var devMode = false;

gulp.task('css', function() {
    gulp.src(styles)
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.reload({
            stream: true
    }));
});

gulp.task('js', function() {
    gulp.src(scripts)
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('./dist/js'))
        .pipe(browserSync.reload({
            stream: true
    }));
});

gulp.task('html', function() {
    gulp.src('./app/templates/**/*.html')
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.reload({
            stream: true
    }));
});

gulp.task('jsons', function() {
    gulp.src('./app/json/*.json')
        .pipe(gulp.dest('./dist/json'))
        .pipe(browserSync.reload({
            stream: true
    }));
});

gulp.task('img', function() {
    gulp.src('./app/img/*.png')
        .pipe(gulp.dest('./dist/img'))
        .pipe(browserSync.reload({
            stream: true
    }));
});

gulp.task('build', function() {
    gulp.start(['css', 'js', 'html', 'jsons', 'img']);
});

gulp.task('browser-sync', function() {
    browserSync.init(null, {
        open: false,
        server: {
            baseDir: 'dist'
        }
    });
});

gulp.task('start', function() {
    devMode: true;
    gulp.start(['build', 'browser-sync']);
    gulp.watch(['./app/css/**/*.css'], ['css']);
    gulp.watch(['./app/**/*.js'], ['js']);
    gulp.watch(['./app/templates/**/*.html'], ['html']);
    gulp.watch(['./app/json/*.json'], ['jsons']);
});
