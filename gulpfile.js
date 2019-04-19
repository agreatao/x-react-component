const gulp = require('gulp');
const babel = require('gulp-babel');
const minify = require('gulp-babel-minify');
const less = require('gulp-less');
const postcss = require('gulp-postcss');
const ts = require('gulp-typescript');
const autoprefixer = require('autoprefixer');
const glob = require('glob');
const fs = require('fs-extra');
const shelljs = require('shelljs');
const path = require('path');
const merge = require('merge2');

const tsConfig = {
    noUnusedParameters: true,
    noUnusedLocals: true,
    strictNullChecks: true,
    target: 'es6',
    jsx: 'react',
    moduleResolution: 'node',
    allowSyntheticDefaultImports: true,
    declaration: true,
    sourceMap: true,
    noImplicitAny: true
};
const babelConfig = (modules) => ({
    presets: [
        [
            '@babel/preset-env',
            {
                modules,
                loose: true,
                exclude: ['transform-typeof-symbol']
            },
        ],
        '@babel/preset-react',
    ],
    plugins: [
        '@babel/plugin-transform-member-expression-literals',
        '@babel/plugin-transform-object-assign',
        '@babel/plugin-transform-property-literals',
        '@babel/plugin-transform-spread',
        '@babel/plugin-transform-template-literals',
        '@babel/plugin-proposal-export-default-from',
        '@babel/plugin-proposal-export-namespace-from',
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-proposal-class-properties',
        [
            '@babel/plugin-transform-runtime',
            {
                helpers: false,
            },
        ]
    ]
})

function packages(modules) {
    const output = modules === false ? 'es' : 'lib';
    if (glob.sync('src/**/*.{ts,tsx}').length && !glob.sync('src/**/*.d.ts').length) {

        let tsResult = gulp
            .src(['src/**/*.ts', 'src/**/*.tsx'])
            .pipe(ts(tsConfig));
        return merge([
            tsResult.dts.pipe(gulp.dest(output)),
            tsResult.js.pipe(babel(babelConfig(modules))).pipe(gulp.dest(output))
        ])
    } else {
        return gulp.src(['src/**/*.js', 'src/**/*.jsx'])
            .pipe(babel(babelConfig(modules)))
            .pipe(gulp.dest(output));
    }
}

function resolveCwd(...args) {
    args.unshift(process.cwd());
    return path.join(...args);
}

function cleanCompile() {
    try {
        if (fs.existsSync(resolveCwd('lib'))) {
            shelljs.rm('-rf', resolveCwd('lib'));
        }
        if (fs.existsSync(resolveCwd('es'))) {
            shelljs.rm('-rf', resolveCwd('es'));
        }
        if (fs.existsSync(resolveCwd('style'))) {
            shelljs.rm('-rf', resolveCwd('style/*.css'));
        }
    } catch (err) {
        console.log('Clean up failed:', err);
        throw err;
    }
}

gulp.task(
    'cleanCompile',
    gulp.series(done => {
        cleanCompile();
        done();
    })
);

gulp.task('css', function () {
    return gulp
        .src('style/*.less')
        .pipe(less())
        .pipe(postcss([autoprefixer({ remove: false })]))
        .pipe(gulp.dest('style'));
});

gulp.task('js', function () {
    return packages();
});

gulp.task('es', function () {
    return packages(false);
});

gulp.task('compile', gulp.series('cleanCompile', gulp.parallel('js', 'es', 'css')));