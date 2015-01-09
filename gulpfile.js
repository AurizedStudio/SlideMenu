var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var sass = require('gulp-ruby-sass');
var browserSync = require('browser-sync');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber'); // エラーが起きてもwatchを終了しない
var notify = require('gulp-notify'); // エラーが起こったときの通知
var using = require('gulp-using'); // タスクが処理をしているファイル名を出力
var cached = require('gulp-cached'); // 変更があったファイルにだけ処理を行う
var remember = require('gulp-remember'); // キャッシュしたストリームを取り出す
// var runSequence = require('run-sequence'); // 順番に実行してほしいタスク名を指定
var spritesmith = require('gulp.spritesmith'); // スプライトイメージ作成
// var iconfont = require('gulp-iconfont'); // アイコンフォント作成
// var iconfontCss = require('gulp-iconfont-css');
// var consolidate = require('gulp-consolidate');

var path = {
    srcScss: './source/scss/',
    srcSprite: './source/sprite-img/',
    srcSvg: './source/svg/',
    dest: './htdocs/',
    destCss: './htdocs/css/',
    destImg: './htdocs/img/',
    destJs: './htdocs/js/',
    destFont: './htdocs/fonts/'
//    scripts: ['client/js/**/*.coffee', '!client/external/**/*.coffee'],
};

// エラー通知が必要なタスク使用。通知が必要ない場合には通常のplumberをとるようにする
// .pipe(plumberWithNotify()) or .pipe(plumber())
function plumberWithNotify() {
    return plumber({errorHandler: notify.onError("<%= error.message %>")});
}

// ローカルサーバーをたてる
gulp.task('server', function() {
    browserSync({
        server: {
            baseDir: path.dest,
            directory: true
        }
    });
});

// Bootstrap Sassファイル、fontファイルをコピー
gulp.task('preCopy', function() {
    gulp.src('./bower_components/bootstrap-sass/assets/stylesheets/**/*')
    .pipe(gulp.dest(path.srcScss));
    gulp.src('./bower_components/bootstrap-sass/assets/fonts/bootstrap/*')
    .pipe(gulp.dest(path.dest + 'fonts/'));
});

// _bootstrap.scssをリネーム
gulp.task('rename', function(){
    gulp.src(path.srcScss + '_bootstrap.scss')
    .pipe(rename('bootstrap.scss'))
    .pipe(gulp.dest(path.srcScss));
});

// 読み込むSassファイル作成
gulp.task('preConcat', function() {
    gulp.src([path.srcScss + 'bootstrap.scss', path.srcScss + 'add-style.scss'])
    .pipe(concat('style.scss'))
    .pipe(gulp.dest(path.srcScss));
});

// Sassコンパイル
gulp.task('sass', function() {
    return gulp.src(path.srcScss + 'style.scss')
    .pipe(plumberWithNotify())
//    .pipe(cached())
//    .pipe(using())
    .pipe(sass({
        style: 'expanded'
    }))
    //    .pipe(autoprefixer({ // Ver2.0.0用 <-相性が良くない…
    //        browsers: ['last 2 versions', 'ie 8'],
    //        cascade: false
    //    }))
    .pipe(autoprefixer('last 2 version', 'ie 8'))
//    .pipe(remember())
    .pipe(gulp.dest(path.destCss));
});

gulp.task('watch', ['server'], function() {
    gulp.watch([path.srcScss + '**/*.scss', path.dest + '*.html', path.destJs + '*.js'], ['sass', browserSync.reload]);
});

// スプライトイメージ作成
gulp.task('sprite', function () {
  // Generate our spritesheet
  var spriteData = gulp.src(path.srcSprite + '*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: '_img-sprite.scss',
    algorithm: 'binary-tree',
    imgPath: '../img/sprite.png'
  }));
  // Pipe image stream through image optimizer and onto disk
  spriteData.img
    .pipe(gulp.dest(path.destImg));
  // Pipe CSS stream through CSS optimizer and onto disk
  spriteData.css
    .pipe(gulp.dest(path.srcScss));
});

// アイコンフォント作成 <- テンプレートが必要。grunt-webfontはsvgを用意するのみでいける
gulp.task('iconfont', function(){
    gulp.src([path.srcSvg + '*.svg'])
    .pipe(iconfont({ fontName: 'iconfont' }))
    .on('codepoints', function(codepoints, options) {
        gulp.src(path.srcScss + '_iconfont-template.scss')
        .pipe(consolidate('lodash', {
            glyphs: codepoints,
            fontName: 'iconfont',
            fontPath: '../fonts/',
            className: 'iconfont'
        }))
        .pipe(gulp.dest(path.srcScss));
    })
    .pipe(gulp.dest(path.destFont));
});

// デフォルト ローカルサーバーを起ち上げ、ファイルを監視しつつ、ブラウザオートリロード
gulp.task('default', ['watch']);