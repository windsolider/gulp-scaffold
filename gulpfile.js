/*
 * innocation 自动化开发框架
 */

'use strict';
var q           = require('q');
var gulp		= require('gulp-param')(require('gulp'), process.argv,"cb");
var webpack     = require('webpack-stream');
var	header 		= require('gulp-header');
var	sass 		= require("gulp-sass");
var	autoprefix 	= require('gulp-autoprefixer');
var minifyCss   = require('gulp-minify-css');
var imagemin    = require('gulp-imagemin');
var plumber		= require('gulp-plumber');
var	bs          = require('browser-sync');
var reload      = bs.reload;
var pkg         = require('./package.json');
var banner = ['/*!',
  ' * <%= pkg.homepage %>',
  ' * copyright (c) 2016 <%= pkg.name %>',
  ' * author: <%= pkg.author %>',
  ' * update: <%= new Date() %>',
  ' */',
  ''].join('\n');

  var clean = require('gulp-clean');
  var gulpSequence = require('gulp-sequence');


gulp.task('sass', function(project) {
	return gulp.src('src/' + project + '/css/*.scss')
	    .pipe(header(banner, {pkg:pkg}))
	    .pipe(sass().on('error', sass.logError))
	    .pipe(autoprefix({
	    	browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
	    	remove: true
	    }))
		.pipe(gulp.dest('src/' + project + '/css'))
		.pipe(minifyCss())
	    .pipe(gulp.dest('dist/' + project + '/css'))
	    .pipe(reload({stream: true}))
	    .on("end",function(){
	    	console.log('sass has been compiled');
	    });
});
gulp.task('form-sass', function(project) {
	return gulp.src('src/' + project + '/form/css/*.scss')
	    .pipe(header(banner, {pkg:pkg}))
	    .pipe(sass().on('error', sass.logError))
	    .pipe(autoprefix({
	    	browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
	    	remove: true
	    }))
		.pipe(gulp.dest('src/' + project + '/form/css'))
		.pipe(minifyCss())
	    .pipe(gulp.dest('dist/' + project + '/form/css'))
	    .pipe(reload({stream: true}))
	    .on("end",function(){
	    	console.log('form-sass has been compiled');
	    });
});
gulp.task('html', function(project) {
	return gulp.src('src/' + project + '/form.html')
		.pipe(gulp.dest('dist/' + project))
		.pipe(reload({stream: true}))
	    .on("end",function(){
	    	console.log('html has been compiled');
	    });
});

gulp.task('js', function (project,env) {
  console.log(project,env);
	return gulp.src('src/' + project + '/js/*.js')
	.pipe(plumber())
	.pipe(gulp.dest('dist/' + project + '/js'))
	.pipe(webpack( (env&&env=="prov")?require('./config/webpack.config.prov.js'):require('./config/webpack.config.js') ))
	.pipe(gulp.dest('dist/' + project + '/js'))
	.pipe(reload({stream: true}))
	.on("end", function(){
		console.log('js has been compiled');
	});
});
gulp.task('content', function (project) {
	return gulp.src(['src/' + project + '/*.js','src/' + project + '/*.json'])
	.pipe(plumber())
	.pipe(gulp.dest('dist/' + project ))
	.pipe(reload({stream: true}))
	.on("end", function(){
		console.log('content has been compiled');
	});
});
gulp.task('image', function(project){
	return gulp.src('src/' + project + '/image/*.{jpg,png,gif,swf}')
		.pipe(imagemin({progressive: true}))
		.pipe(gulp.dest('dist/' + project + '/image'))
		.pipe(reload({stream: true}))
		.on("end", function(){
			console.log('image has been compiled');
		});
});

gulp.task('video', function(project){
	return gulp.src('src/' + project + '/video/*.{mp4,ogg}')
		.pipe(gulp.dest('dist/' + project + '/video'))
		.pipe(reload({stream: true}))
		.on("end", function(){
			console.log('video has been copy');
		});
});

gulp.task('audio', function(project){
	return gulp.src('src/' + project + '/audio/*.{mp3,wav}')
		.pipe(imagemin({progressive: true}))
		.pipe(gulp.dest('dist/' + project + '/audio'))
		.pipe(reload({stream: true}))
		.on("end", function(){
			console.log('audio has been copy');
		});
});

gulp.task('form',  function(project) {
  	return gulp.src('src/' + project +'/form/**/*')
    	.pipe(gulp.dest('dist/' + project + '/form'))
    	.on("end", function() {
    		console.log('form has been copy');
    	})
});

gulp.task('assets',  function(project) {
  	return gulp.src('src/' + project +'/assets/**/*')
    	.pipe(gulp.dest('dist/' + project + '/assets'))
    	.on("end", function() {
    		console.log('assets has been copy');
    	})
});

gulp.task('browser-sync', function(project){
	var deferred = q.defer();
	bs({
	server: {
	  baseDir: '.',
	  directory: true
	},
	open: 'external',
	startPath: 'dist/'+project
	});
	deferred.resolve();
	return deferred.promise;
});
gulp.task('server', function(){
	var deferred = q.defer();
	bs({
	server: {
	  baseDir: '.',
	  directory: true
	},
	open: 'external',
	startPath: 'dist'
	});
	deferred.resolve();
	return deferred.promise;
});
// 编辑器任务
gulp.task('form-edit', function(){
	var webpackForm = require('./config/webpack.config.form.js');
	webpack(webpackForm, function (err) {
		console.log('==============start form dev===============');
	});
});
gulp.task('watch', ['browser-sync'], function(project){
	gulp.watch(['src/' + project + '/*.html'], ['html']);
	gulp.watch(['src/**/*.scss'], ['sass']);
	gulp.watch(['src/'+ project + '/image/*.{jpg,png,gif,swf}'], ['image']);
	gulp.watch(['src/'+ project + '/audio/*.{mp3,wav}'], ['audio']);
	gulp.watch(['src/'+ project + '/video/*.{mp4,ogg}'], ['video']);
	gulp.watch(['src/**/*'], ['js']);
	gulp.watch(['src/' + project + '/*.js'], ['content']);
	gulp.watch(['src/' + project + '/form/**/*'], ['form']);
	gulp.watch(['src/' + project + '/form/css/*.scss'], ['form-sass']);
	gulp.watch(['src/' + project + '/assets/**/*'], ['assets']);
});

gulp.task('clean',function(project){
  return gulp.src('dist/'+project)
    .pipe(clean())
    .on("end", function() {
  		console.log( 'dist/' +project + ' has been clean');
  	});
});
//清除编译目录指定项目的map文件
gulp.task("cleanmap",function(project){
  return gulp.src('dist/'+project+'/js/*.map')
    .pipe(clean())
    .on("end",function(){
      console.log( 'dist/'+project+'/js/*.map'+ ' has been clean');
    })
});

gulp.task('compile',function(project,env,cb){
  gulpSequence('clean',['html','sass','image','audio','video','content','form','assets','form-sass'],'js','watch',cb);

});
