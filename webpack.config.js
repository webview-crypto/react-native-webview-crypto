var failPlugin = require('webpack-fail-plugin');

module.exports = {
  entry: "./src/CryptoWorker.tsx",
  output: {
    filename: "./dist/CryptoWorker.js",
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },

  module: {
    loaders: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      { test: /\.tsx?$/, loader: "ts-loader" }
    ],

    preLoaders: [
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: "source-map-loader" }
    ]
  },

  plugins: [
	  failPlugin
	],

  externals: [
    // Every non-relative module is external
    // abc -> require("abc")
    /^[a-z\-0-9]+$/
  ]
};
