// This file contains webpack configurations for deploying and testing.

const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const PROD = process.env.NODE_ENV === 'production'

// Common configuration settings.
let defaultConfig = {
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      use: 'babel-loader',
      include: path.resolve(__dirname, 'client')
    }, {
      test: /\.css$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1
            }
          },
          'postcss-loader'
        ]
      }),
      include: path.resolve(__dirname, 'client')
    }]
  },

  resolve: {
    alias: {
      components: path.resolve(__dirname, 'client/components')
    },
    extensions: ['.jsx', '.js', '.json']
  },

  devtool: 'source-map',

  watchOptions: {
    aggregateTimeout: 500
  }
}

// Yields a bundle that is inserted on the main page.
let prodConfig = Object.assign({}, defaultConfig, {
  entry: path.resolve(__dirname, 'client/index.jsx'),

  output: {
    path: path.resolve(__dirname, 'static/dist'),
    filename: 'bundle.js'
  },

  externals: {
    'socket.io': 'io'
  },

  plugins: [
    new ExtractTextPlugin({ filename: 'style.css', allChunks: true }),
    new webpack.NoEmitOnErrorsPlugin()
  ]
})

// Minify in production.
if (PROD) prodConfig.plugins.push(new webpack.optimize.UglifyJsPlugin())

// Yields a commonjs main component that's testable with enzyme.
let testConfig = Object.assign({}, defaultConfig, {
  entry: path.resolve(__dirname, 'client/components/main/index.jsx'),

  output: {
    path: path.resolve(__dirname, 'static/dist'),
    filename: 'main-component.bundle.js',
    libraryTarget: 'commonjs2'
  },

  plugins: [
    new ExtractTextPlugin({ filename: 'main-component.style.css', allChunks: true }),
    new webpack.NoEmitOnErrorsPlugin()
  ]
})

// Don't build test configuration in production.
module.exports = PROD ? prodConfig : [prodConfig, testConfig]
