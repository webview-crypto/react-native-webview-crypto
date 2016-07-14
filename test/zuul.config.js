var webpack = require("./webpack.config");

var config = {
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

if (process.env.BROWSER_IPHONE === "true") {
  config.capabilities = {
    appiumVersion: "1.5.3",
    deviceName:"iPhone Simulator",
    deviceOrientation: "portrait",
    platformVersion:"9.3",
    platformName: "iOS",
    browserName: "Safari"
  }
}

module.exports = config;
