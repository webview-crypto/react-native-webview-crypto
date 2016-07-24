var webpack = require("./webpack.config");

var config = {
  ui: "tape",
  tunnel: {
    type: 'localtunnel',
    https: true
  },

  // to speed up tests
  capabilities: {
    'record-video': false,
    'video-upload-on-pass': false,
    'record-screenshots': false
  },

  browsers: [
    {
      name: "chrome",
      version: "latest"
    }
  ],
  builder: 'zuul-builder-webpack',
  webpack: webpack
};

module.exports = config;
