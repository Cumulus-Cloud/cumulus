const path = require("path")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const webpack = require("webpack")
const autoprefixer = require("autoprefixer")

const development = process.env.NODE_ENV === "development";

var config = {
  entry: "./src/main.tsx",
  output: {
    filename: "main.js",
    path: __dirname + "../../server/public"
  },
  devtool: "source-map",
  stats: {
    children: false
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    modules: [path.resolve(__dirname, "./src"), "node_modules"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
      { test: /\.js$/, enforce: "pre", loader: "source-map-loader" },
      {
        test: /\.css$/, use: ExtractTextPlugin.extract({
          fallback: "style-loader", use: [
            { loader: "css-loader", query: { modules: true, localIdentName: "[local]-[hash:base64:5]" } },
            { loader: "postcss-loader", options: { plugins: (loader) => [autoprefixer({ browsers: ["last 3 versions"] })] } },
          ]
        })
      }
    ]
  },
  plugins: [new ExtractTextPlugin({ filename: "main.css", allChunks: true })]
};

if (!development) {
  config.plugins.push(
    new webpack.DefinePlugin({
      "process.env": {
        "NODE_ENV": JSON.stringify("production")
      }
    })
  ),
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
      compressor: { screw_ie8: true, keep_fnames: false, warnings: false },
      sourceMap: true,
      mangle: { screw_ie8: true, keep_fnames: false }
    }));
}

module.exports = config
