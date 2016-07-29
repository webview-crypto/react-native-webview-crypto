var failPlugin = require('webpack-fail-plugin');
var webpack = require('webpack');

module.exports = {
  entry: ['babel-polyfill', './index.ts'],
  output: {
    filename: "./dist/index.js",
  },

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },

  module: {
    loaders: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      { test: /\.tsx?$/, loader: "babel-loader?presets[]=react-native!ts-loader" }
    ]
  },

  plugins: [
	  failPlugin,
    new webpack.optimize.UglifyJsPlugin({
      compress: true,
      mangle: true,
      comments: false,
      sourceMap: false
    })
	]
};
