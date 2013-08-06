'use strict';

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // configurable paths
  var yeomanConfig = {
    lib: 'lib',
    dist: 'dist'
  };

  // Name the AMD modules so we can register them in the concatenated build.
  var processNamedAMD = function (src, filepath) {
    // Use the two last components of the path, e.g. 'hyperagent/agent'
    return src.replace(/define\("\/hyperagent/, 'define(\"hyperagent');
  };

  var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
  };

  grunt.initConfig({
    yeoman: yeomanConfig,

    clean: {
      dist: ['<%= yeoman.dist %>/*', '.tmp/']
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.lib %>/{,*/}*.js'
      ]
    },

    transpile: {
      amd: {
        type: 'amd',
        files: [{
          expand: true,
          cwd: '<%= yeoman.lib %>',
          src: ['{,**/}*.js', '!loader.js'],
          dest: '<%= yeoman.dist %>/amd/'
        }]
      },
      cjs: {
        type: 'cjs',
        files: [{
          expand: true,
          cwd: '<%= yeoman.lib %>',
          src: ['{,**/}*.js', '!loader.js'],
          dest: '<%= yeoman.dist %>/commonjs/'
        }]
      }
    },

    connect: {
      options: {
        port: 9000,
        hostname: '0.0.0.0'
      },
      test: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, '.'),
              mountFolder(connect, 'dist')
            ];
          }
        }
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      },
      ci: {
        configFile: 'karma-ci.conf.js',
        singleRun: true
      }
    },

    concat: {
      dist: {
        options: {
          banner: '(function () {\n',
          footer: '\nwindow.Hyperagent = requireModule(\'hyperagent\');\n}());',
          process: processNamedAMD
        },
        files: [{
          src: ['<%= yeoman.lib %>/loader.js', '<%= yeoman.dist %>/amd/{,**/}*.js'],
          dest: '<%= yeoman.dist %>/hyperagent.js'
        }]
      }
    },

    uglify: {
      dist: {
        files: [{'<%= yeoman.dist %>/hyperagent.min.js': '<%= yeoman.dist %>/hyperagent.js'}]
      }
    },

    watch: {
      options: {
        livereload: true
      },
      dist: {
        files: ['<%= yeoman.lib %>/{,**/}*.js', 'test/**/*.js'],
        tasks: ['build']
      }
    },

    open: {
      test: {
        path: 'http://localhost:<%= connect.options.port %>/test/'
      }
    }
  });

  grunt.registerTask('build', [
    'clean',
    'transpile',
    'concat',
    'uglify'
  ]);

  // Create an alias familiar to those using webapp/angular.
  grunt.registerTask('server', [
    'build',
    'connect:test',
    'open',
    'watch'
  ]);

  grunt.registerTask('test', [
    'build',
    'karma:unit'
  ]);

  grunt.registerTask('test-ci', [
    'build',
    'karma:ci'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);

  grunt.loadNpmTasks('grunt-devtools');
};
