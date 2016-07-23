var webpack = require("./webpack.config");

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['tap'],


    // list of files / patterns to load in the browser
    files: [
        'testAll.ts'
        // each file acts as entry point for the webpack configuration
    ],

    // preprocess matching files before serving them to the browser
    preprocessors: {
        'testAll.ts': ['webpack'],
    },

    // karma watches the test entry points
    // (you don't need to specify the entry option)
    // webpack watches dependencies
    webpack: webpack,
    webpackMiddleware: {
        // webpack-dev-middleware configuration
        // i. e.
        noInfo: true
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeCanary'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })

  if (process.env.CI) {
    // like https://github.com/karma-runner/karma-browserstack-launcher/#configuration
    var customLaunchers = {
      bs_chrome: {
        base: 'BrowserStack',
        browser: 'Chrome',
        browser_version: '51.0',
        os: 'OS X',
        os_version: 'El Capitan'
      },
      bs_ios_9_1: {
        base: 'BrowserStack',
        device: 'iPhone 6S',
        os: 'ios',
        os_version: '9.1'
      },
      sl_android_5_1: {
        base: 'SauceLabs',
        browserName: 'Browser',
        platform: 'Android',
        version: '5.1',
        device: 'Android Emulator'
      },
      bs_android_4_4: {
        base: 'BrowserStack',
        device: 'Samsung Galaxy S5',
        os: 'android',
        os_version: '4.4'
      }
    }

    config.set({
      browserStack: {
        project: 'react-native-webview-crypto'
      },
      sauceLabs: {
        testName: 'react-native-webview-crypto'
      },
      customLaunchers: customLaunchers,
      browsers: [process.env.KARMA_BROWSER],
      singleRun: true,
      autoWatch: false
    })

    if (process.env.KARMA_BROWSER.startsWith('sl')) {
      config.set({
        reporters: ['progress', 'saucelabs'],
      })
    }
  }
}
