// This file contains webpack configuration for bundling the application.

const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const PROD = process.env.NODE_ENV === 'production'

let plugins = [
  new ExtractTextPlugin({ filename: 'style.css', allChunks: true }),
  new webpack.NoEmitOnErrorsPlugin()
]

// Minify in production.
if (PROD) config.plugins.push(new webpack.optimize.UglifyJsPlugin())

module.exports = {
  entry: path.resolve(__dirname, 'client/index.jsx'),

  output: {
    path: path.resolve(__dirname, 'static/dist'),
    filename: 'bundle.js'
  },

  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      use: 'babel-loader',
      exclude: path.resolve(__dirname, 'node_modules')
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
      exclude: path.resolve(__dirname, 'node_modules')
    }]
  },

  plugins,

  resolve: {
    alias: {
      components: path.resolve(__dirname, 'client/components')
    },
    extensions: ['.jsx', '.js', '.json']
  },

  externals: {
    'socket.io': 'io'
  },

  devtool: 'source-map',

  watchOptions: {
    aggregateTimeout: 500
  }
}
