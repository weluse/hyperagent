'use strict';

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // configurable paths
  var yeomanConfig = {
    app: 'app',
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
        '<%= yeoman.app %>/{,*/}*.js'
      ]
    },

    watch: {
      dist: {
        files: '<%= yeoman.app %>/{,*/}*.js',
        tasks: ['traceur']
      }
    },

    traceur: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: '{,*/}*.js',
          dest: '.tmp/'
        }]
      }
    }
  });

  grunt.registerTask('build', [
    'clean',
    'traceur'
  ]);

  // Create an alias familiar to those using webapp/angular.
  grunt.registerTask('server', [
    'watch'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
