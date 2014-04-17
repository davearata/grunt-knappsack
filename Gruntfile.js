/*
 * grunt-knappsack
 * https://github.com/davearata/grunt-knappsack
 *
 * Copyright (c) 2014 David Arata
 * Licensed under the MIT license.
 */

'use strict';

require('./test/test_helper');

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Configuration to be run (and then tested).
    knappsack: {
      default_options: {
        options: {
          applicationId: 1,
          versionName: '1',
          knappsackHost: 'http://mydomain.com',
          username: 'test@test.com',
          password: 'abc123',
          file: 'test/fixtures/testing'
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['knappsack', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
