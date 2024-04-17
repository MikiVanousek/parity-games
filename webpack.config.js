const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  devtool: "source-map",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: "ts-loader" }],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/*.html", to: "[name][ext]" },
        { from: "src/manifest.json", to: "[name][ext]" },
        { from: "src/favicon.ico", to: "[name][ext]" },
        { from: "src/*.png", to: "[name][ext]" },
        { from: "src/serviceWorker.js", to: "[name][ext]" },
        { from: "src/**/*.css", to: "[name][ext]" },
      ],
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    }),
  ],
};
