module.exports = {
  entry: "./client/main.tsx",
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
      }
    ],
    preLoaders: [
      {
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  }
}
