// This file contains Karma configuration for running UI tests.

const { module: webpackModule, resolve,
  plugins } = require('./webpack.config.js')

module.exports = (config) => {
  config.set({
    basePath: '',

    frameworks: ['mocha'],

    files: [
      'test/client.spec.js'
    ],

    preprocessors: {
      '{client,test}/**/*.{js,jsx}': ['webpack', 'sourcemap'],
    },

    webpack: {
      plugins,
      resolve,
      devtool: 'inline-source-map',
      module: webpackModule,
      externals: {
        'cheerio': 'window',
        'react/addons': 'react',
        'react/lib/ExecutionEnvironment': 'react',
        'react/lib/ReactContext': 'react',
      }
    },

    webpackServer: {
      noInfo: true
    },

    plugins: [
      'karma-webpack',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-sourcemap-loader',
      'karma-phantomjs-launcher'
    ],

    reporters: ['mocha'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['PhantomJS'],

    singleRun: false,

    concurrency: Infinity
  })
}
