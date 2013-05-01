'use strict';

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // configurable paths
  var yeomanConfig = {
    lib: 'lib',
    dist: 'dist'
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
          src: '{,**/}*.js',
          dest: '<%= yeoman.dist %>/amd/'
        }]
      },
      cjs: {
        type: 'cjs',
        files: [{
          expand: true,
          cwd: '<%= yeoman.lib %>',
          src: '{,**/}*.js',
          dest: '<%= yeoman.dist %>/commonjs/'
        }]
      }
    },

    uglify: {
      dist: {
        files: [{'<%= yeoman.dist %>/hyperagent.min.js': '<%= yeoman.dist %>/hyperagent.js'}]
      }
    },

    browserify: {
      dist: {
        src: ['<%= yeoman.dist %>/commonjs/hyperagent.js'],
        dest: '<%= yeoman.dist %>/hyperagent.js'
      }
    }
  });

  grunt.registerTask('build', [
    'clean',
    'transpile',
    'browserify',
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
