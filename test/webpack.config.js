var failPlugin = require('webpack-fail-plugin');

module.exports = {
  entry: "./testSerializeBinary.ts",
  output: {
    filename: "./dist/test.js",
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
      { test: /\.tsx?$/, loader: "babel-loader!ts-loader" }
    ],

    preLoaders: [
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: "source-map-loader" }
    ]
  },

  plugins: [
	  failPlugin
	],

  node: {
    console: true,
    fs: 'empty',
  }
};
