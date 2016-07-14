var webpack = require("./webpack.config");

module.exports = {
  ui: "tape",
  browsers: [
    {
      name: "chrome",
      version: "latest"
    }
  ],
  builder: 'zuul-builder-webpack',
  webpack: webpack
};
