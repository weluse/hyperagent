'use strict';

var path = require('path');

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // configurable paths
  var yeomanConfig = {
    lib: 'lib',
    dist: 'dist'
  };

  // Name the AMD modules so we can register them in the concatenated build.
  function processNamedAMD(src, filepath) {
    // Use the two last components of the path, e.g. 'hyperagent/agent'
    var name = filepath.replace(/dist\/amd\//, '').replace(/\.js$/, '');
    return src.replace(/define\(/, 'define(\'' + name + '\',');
  }

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

    watch: {
      dist: {
        files: '<%= yeoman.lib %>/{,*/}*.js',
        tasks: ['transpile']
      }
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
    'watch'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
