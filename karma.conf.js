// This file contains Karma configuration for running UI tests.

const { module: webpackModule, resolve,
  externals, plugins } = require('./webpack.config.js')

module.exports = (config) => {
  config.set({
    basePath: '',

    frameworks: ['mocha'],

    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'node_modules/socket.io-client/dist/socket.io.js',
      'test/client.spec.jsx'
    ],

    preprocessors: {
      '{client,test}/**/*.{js,jsx}': ['webpack', 'sourcemap']
    },

    webpack: {
      plugins,
      resolve,
      devtool: 'inline-source-map',
      module: webpackModule,
      externals: Object.assign({}, externals, {
        'cheerio': 'window',
        'react/addons': 'react',
        'react/lib/ExecutionEnvironment': 'react',
        'react/lib/ReactContext': 'react'
      })
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

    browserConsoleLogOptions: {
      level: 'log',
      format: '%b %T: %m',
      terminal: true
    },

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['PhantomJS'],

    singleRun: false,

    concurrency: Infinity
  })
}
