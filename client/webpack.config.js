const path = require('path')
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const isProd = process.env.NODE_ENV === 'production'
const isLiveReload = process.env.NODE_ENV === 'liveReload'

const runSizeReport = false

const defineEnv = new webpack.DefinePlugin({
  env: {
    isProd: `${isProd}`,
    isDev: `${!isProd}`,
    isLiveReload: `${isLiveReload}`
  }
})

module.exports = {

  entry: path.resolve(__dirname, './src/index.tsx'),
  output: {
    path: __dirname + '/../server/cumulus-server-resources/src/main/resources/public',
    filename: 'bundle.js'
  },
  
  // Enable sourcemaps for debugging webpack's output.
  mode: isProd ? 'production' : 'development',
  devtool:  isProd ? false : 'source-map',
  
  resolve: {
    alias: {
      'components': path.resolve(__dirname, './src/components'),
      'models': path.resolve(__dirname, './src/models'),
      'pages': path.resolve(__dirname, './src/pages'),
      'utils': path.resolve(__dirname, './src/utils'),
      'store': path.resolve(__dirname, './src/store'),
      'services': path.resolve(__dirname, './src/services'),
      'typings': path.resolve(__dirname, './src/typings')
    },
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
      
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: "pre", test: /\.js$/, loader: 'source-map-loader' }
    ]
  },
  
  plugins: [
    defineEnv
  ]
  .concat(runSizeReport ? new BundleAnalyzerPlugin({ analyzerMode: 'static' }) : [])
  
}
