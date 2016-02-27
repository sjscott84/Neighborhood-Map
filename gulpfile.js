var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var gulpIf = require('gulp-if');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');

gulp.task('useref', function(){
	return gulp.src('app/*.html')
		.pipe(useref())
		// Minifies only if it's a JavaScript file
		.pipe(gulpIf('*.js', uglify()))
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest('dist'));
});

gulp.task('uglify', function(){
	return gulp.src('app/*.html')
		.pipe(gulpIf('*.html', htmlmin()))
		.pipe(gulp.dest('dist'));
})

gulp.task('images', function(){
	return gulp.src('app/images/*.jpg')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/images'));
})

gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: 'app'
		},
	})
})
