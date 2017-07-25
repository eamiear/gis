
var gulp = require('gulp'),
    less = require('gulp-less'),
    cssmin = require('gulp-minify-css'),
    uglify= require('gulp-uglify'),
    concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    autoprefixer = require('gulp-autoprefixer'),
    jsdoc = require('gulp-jsdoc3'),
    Server = require('karma').Server;

//gulp.task(name[, deps], fn) 定义任务  name：任务名称 deps：依赖任务名称 fn：回调函数
//gulp.src(globs[, options]) 执行任务处理的文件  globs：处理的文件路径(字符串或者字符串数组)
//gulp.dest(path[, options]) 处理完后文件生成路径

gulp.task('less', function() {
    gulp.src('src/less/*.less')
        .pipe(less())
        .pipe(gulp.dest('src/css'))
        .pipe(livereload());
});
gulp.task('autoprefixer', function () {
    gulp.src('src/css/index.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(gulp.dest('dist/css'));
});
gulp.task('cssmin', function () {
    gulp.src('src/css/*.css')
        .pipe(cssmin())
        .pipe(gulp.dest('dist/css'));
});
gulp.task('concat', function () {
    gulp.src('src/js/*.js')
        .pipe(concat('bundle.js'))//合并后的文件名
        .pipe(gulp.dest('dist/js'));
});
gulp.task('jsmin', function () {
    gulp.src(['src/js/*.js', '!src/js/**/{test1,test2}.js'])
        .pipe(uglify({
            mangle: true,//类型：Boolean 默认：true 是否修改变量名
            compress: true,//类型：Boolean 默认：true 是否完全压缩
            preserveComments: 'all' //保留所有注释
        }))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('compact-css', function () {
    return gulp.src('src/*.css')
        .pipe(concat('gis.css'))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true,
            remove:true
         }))
        .pipe(cssmin())
        .pipe(gulp.dest('./build/'))
        .pipe(gulp.dest('./sample/static/assets/gis'));
    //.pipe(notify({ message: 'compact-css task complete' }))
});
gulp.task('compact-js', function () {
    return gulp.src(['./src/**/*.js'])
        //.pipe(concat('gis.js'))
        .pipe(gulp.dest('./sample/static/assets/gis'))
        .pipe(gulp.dest('./test/libs/gis'))
        .pipe(uglify())
        .pipe(gulp.dest('./build/'));
        //.pipe(gulp.dest('./sample/static/assets/gis'));
    //.pipe(notify({ message: 'compact-js task complete' }));
});
gulp.task('compact-img', function () {
  return gulp.src('./src/**/*')
        .pipe(gulp.dest('./sample/static/assets/gis'))
        .pipe(gulp.dest('./test/libs/gis'))
});

gulp.task('doc', function (cb) {
    var config = require('./jsdocConfig');
    gulp.src(['README.md'].concat(['./src/**/*.js','!./src/extras/test/**/*.js']), {read: false})
        .pipe(jsdoc(config, cb));
        //.pipe(livereload());
});

//watch for changes on ts files and compile and copy when saved
gulp.task('watch', function () {
    livereload.listen();
   /* gulp.watch('documents/doc/!**!/!*.html',function(file){
        livereload.changed(file.path);
    });*/
   // gulp.watch('src/less/**/*.less', ['less']);
    gulp.watch('./src/**/*.css', ['compact-css']);
    gulp.watch('./src/**/*.js', ['compact-js']);
    gulp.watch('./src/images/**/*',['compact-img']);
   // gulp.watch(['./src/**/*.js','!./src/extras/test/**/*.js'], ['doc']);
});

// test
gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/test/karma.conf.js'
  },done).start();
});

gulp.task('default', ["watch"]);
gulp.task('build', ["compact-css",'compact-js','doc']);
