"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const server = require("browser-sync").create();
const mqpacker = require("css-mqpacker");
const minify = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const svgstore = require("gulp-svgstore");
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");
const run = require("run-sequence");
const del = require("del");
const fontgen = require('gulp-fontgen');
const svgmin = require('gulp-svgmin');
const path = require('path');

gulp.task("style-dev", function() {
    gulp.src("src/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
        autoprefixer({browsers: [
            "last 2 versions"
        ]}),
        mqpacker({
            sort: true
        })
    ]))
    .pipe(gulp.dest("src/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("src/css"))
    .pipe(server.stream());  // reload css only without page reload
});

gulp.task("style-prod", function() {
    gulp.src("src/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
        autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());  // reload css only without page reload
});

gulp.task("images", function() {
    return gulp.src("img/**/*.{png,jpg,svg}")
        .pipe(imagemin([
                imagemin.optipng({optimizationLevel: 3}),
                imagemin.jpegtran({progressive: true}),
                imagemin.svgo()
        ]))
        .pipe(gulp.dest("source/img"));
});

gulp.task("webp", function () {
    return gulp.src("src/img/**/*.{png,jpg}")
        .pipe(webp({quality: 90}))
        .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function() {
    return gulp.src("src/img/*.svg")
        // .pipe(svgmin())
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest("src/img"));
});

gulp.task("html", function () {
    return gulp.src("src/*.html")
        .pipe(posthtml([
            include()
        ]))
        .pipe(gulp.dest("build"));
});

gulp.task("serv-dev", ["style-dev"], function() {
    server.init({
        server: "src",
        notify: false,
        open: true,
        cors: true,
        ui: false
    });

    gulp.watch("src/sass/**/*.{scss,sass}", ["style-dev"]);
    gulp.watch("src/*.html").on("change", server.reload);
});

gulp.task("copy", function () {
    return gulp.src([
        "src/fonts/**/*.{woff,woff2}",
        "src/img/**",
        "src/js/**",
        "src/css/normalize.css"
        ], {
        base: "src"                                     // base dir for copying files and folders
    })
    .pipe(gulp.dest("build"));
});


gulp.task("clean", function () {
    return del("build");
});

/* Run task sequenc */
gulp.task("build", function(done) {
    run(
        "clean",
        "copy",
        "style-prod",
        // "sprite",
        "html",
        done)
});

gulp.task('fontgen', () => {
  return gulp.src('./fonts/*.{ttf,otf}')
    .pipe(fontgen({
      dest: 'src/fonts/'
    }));
});
