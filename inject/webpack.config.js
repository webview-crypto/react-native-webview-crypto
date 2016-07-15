var failPlugin = require('webpack-fail-plugin');

module.exports = {
  entry: "./index.ts",
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
	  failPlugin
	]
};
