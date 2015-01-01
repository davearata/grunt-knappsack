/*
 * grunt-knappsack
 * https://github.com/davearata/grunt-knappsack
 *
 * Copyright (c) 2014 David Arata
 * Licensed under the MIT license.
 */

'use strict';

var knappsackUpload = require('../js/knappsack-upload');

module.exports = function (grunt) {
  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('knappsack', 'Deploy apps to knappsack.', function () {
    var done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      knappsackHost: null,
      applicationId: null,
      knappsackPort: null,
      knappsackPath: '',
      file: null,
      versionName: null,
      appState: 'GROUP_PUBLISH',
      recentChanges: '',
      username: null,
      password: null
    });

    knappsackUpload(options, done, grunt.log);
  });

};