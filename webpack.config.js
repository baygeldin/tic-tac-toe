// This file contains webpack configuration for bundling the application.

const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const PROD = process.env.NODE_ENV === 'production'
const DEV_PORT = 9000

let plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NamedModulesPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  })
]

let styleLoader

if (PROD) {
  plugins = plugins.concat([
    // Minify in production.
    new webpack.optimize.UglifyJsPlugin(),
    new ExtractTextPlugin({ filename: 'style.css', allChunks: true })
  ])

  styleLoader = ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: [
      {
        loader: 'css-loader',
        options: {
          modules: true,
          importLoaders: 1,
          minimize: true
        }
      },
      'postcss-loader'
    ]
  })
} else {
  styleLoader = [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        modules: true,
        importLoaders: 1,
        localIdentName: '[path][name]__[local]--[hash:base64:5]'
      }
    },
    'postcss-loader'
  ]
}

module.exports = {
  entry: [
    'react-hot-loader/patch',
    `webpack-dev-server/client?http://localhost:${DEV_PORT}`,
    'webpack/hot/only-dev-server',
    path.resolve(__dirname, 'client/index.jsx')
  ],

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'static/dist'),
    publicPath: '/dist/'
  },

  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      use: 'babel-loader',
      exclude: path.resolve(__dirname, 'node_modules')
    }, {
      test: /\.css$/,
      use: styleLoader,
      exclude: path.resolve(__dirname, 'node_modules')
    }, {
      test: /\.(svg|png|gif|jpg|wav|otf|ttf)$/,
      use: 'file-loader?name=[name].[ext]&publicPath=/dist/&outputPath=assets/',
      exclude: path.resolve(__dirname, 'node_modules')
    }]
  },

  plugins,

  resolve: {
    alias: {
      components: path.resolve(__dirname, 'client/components'),
      constants: path.resolve(__dirname, 'client/constants.js'),
      debugger: path.resolve(__dirname, 'client/debug.js')
    },
    extensions: ['.jsx', '.js', '.json']
  },

  externals: {
    'socket.io': 'io'
  },

  devtool: PROD ? false : 'inline-source-map',

  watchOptions: {
    aggregateTimeout: 500
  },

  devServer: {
    hot: true,
    stats: 'minimal',
    port: DEV_PORT,
    host: '0.0.0.0',
    contentBase: path.resolve(__dirname, 'static/dist'),
    publicPath: '/dist/'
  }
}
