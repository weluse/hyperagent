// Karma configuration

module.exports = function (config) {
  'use strict';

  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    frameworks: ['mocha'],

    // list of files / patterns to load in the browser
    files: [
      'components/chai/chai.js',
      'components/uri.js/src/URI.js',
      'components/uri.js/src/URITemplate.js',
      'components/q/q.js',
      'dist/hyperagent.js',
      'test/setup.js',
      'test/lib/utils.js',
      'test/fixtures/**/*.js',
      'test/spec/**/*.js'
    ],

    // list of files to exclude
    exclude: [],

    preprocessors: {
      'dist/hyperagent.js': 'coverage'
    },

    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/'
    },

    // test results reporter to use
    // possible values: dots || progress || growl
    reporters: ['coverage', 'progress'],

    // web server port
    port: 8080,

    // cli runner port
    runnerPort: 9100,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 5000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
