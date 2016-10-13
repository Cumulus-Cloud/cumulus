var webpack = require("webpack");
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var prod = process.env.NODE_ENV === "production";

var config = {
  entry: [
    "./client/main.tsx",
    "./client/styles/main.css"
  ],
  output: {
    filename: "./public/main.js"
  },

  devtool: "source-map",
  resolve: {
    extensions: [
      "", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"
    ]
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style", "css?-mergeRules!postcss")
      }
    ],
    preLoaders: [
      {
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  },
  postcss: function () {
    return [
      require("postcss-import")({
        from: path.resolve(__dirname, "./public/main.css"),
        onImport: function (files) {
          files.forEach(this.addDependency);
        }.bind(this)
      }),
      require("postcss-nested")(),
      require("postcss-cssnext")(),
      require("css-mqpacker")(),
      require("postcss-reporter")()
    ];
  },
  plugins: [
    new ExtractTextPlugin("./public/main.css"),
    new webpack.ProvidePlugin({
      "fetch": "imports?this=>global!exports?global.fetch!whatwg-fetch"
    })
  ]
}

if (!prod) {
  config.devtool = "source-map";
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compressor: {screw_ie8: true, keep_fnames: false, warnings: false},
    mangle: {screw_ie8: true, keep_fnames: false}
  }));
}

module.exports = config;
