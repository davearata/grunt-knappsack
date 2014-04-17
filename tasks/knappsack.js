/*
 * grunt-knappsack
 * https://github.com/davearata/grunt-knappsack
 *
 * Copyright (c) 2014 David Arata
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var http = require('http');
var q = require('q');
var parseUrl = require('url').parse;
var formatUrl = require('url').format;
var request = require("request");

module.exports = function (grunt) {
  var _ = grunt.util._;
  var applicationVersionApiPath = '/api/v1/applicationVersions';
  var applicationApiPath = '/api/v1/applications';
  var oAuthTokenApiPath = '/oauth/token';

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

    if(_.isString(options.knappsackPath) && options.knappsackPath.length > 0) {
      options.knappsackPath = prependSlash(stripTrailingSlash(options.knappsackPath));
    }

    var appState = options.appState;
    if (!_.isString(appState) || (appState !== 'GROUP_PUBLISH' && appState !== 'ORGANIZATION_PUBLISH' &&
      appState !== 'DISABLED' && appState !== 'ORG_PUBLISH_REQUEST' && appState !== 'RESIGNING')) {
      grunt.log.error('Invalid value for appState. the valid options are: ' +
        'GROUP_PUBLISH, ORGANIZATION_PUBLISH, DISABLED, ORG_PUBLISH_REQUEST, RESIGNING');
      return done(false);
    }

    if (!requireOption(options.applicationId, 'applicationId') || !requireOption(options.versionName, 'versionName') || !requireOption(options.knappsackHost, 'knappsackHost') || !requireOption(options.file, 'file') || !requireOption(options.username, 'username') || !requireOption(options.password, 'password')) {
      return done(false);
    }

    if (options.knappsackPort !== null) {
      if ((parseInt(options.knappsackPort, 10).toString() === 'NaN')) {
        grunt.log.error('if you specify a port it must be a number');
        return done(false);
      }
    }

    authenticate(options).then(
      function (accessToken) {
        return doesVersionExistOnServer(options, accessToken);
      }
    ).then(
      function (result) {
        var versionsThatExist = result.versionsThatExist;
        var accessToken = result.accessToken;

        if (versionsThatExist.length > 0) {
          options.versionName = modifyVersionName(versionsThatExist, options.versionName);
        }

        if (_.isFunction(options.recentChanges)) {
          options.recentChanges = options.recentChanges(function (recentChanges) {
            if (_.isString(options.recentChanges)) {
              return;
            }
            options.recentChanges = recentChanges;
          });
        }

        return uploadBuildToKnappsack(options, accessToken, done);
      }
    ).then(
      function() {
        done();
      }
    ).catch(
      function (error) {
        grunt.log.error(error);
        done(false);
      }
    );
  });

  var requireOption = function (option, optionName) {
    if (_.isNull(option) || !_.isString(option.toString())) {
      grunt.log.error('Missing required parameter:' + optionName);
      return false;
    }
    return true;
  };

  var stripTrailingSlash = function (str) {
    if (str.substr(str.length - 1) === '/') {
      return str.substr(0, str.length - 1);
    }
    return str;
  };

  var prependSlash = function (str) {
    if (str.substr(0) !== '/') {
      return '/' + str;
    }
    return str;
  };

  var modifyVersionName = function (versionsThatExist, versionName) {
    var numberToAppend = 2;

    versionsThatExist.forEach(function (existingVersion) {
      if (existingVersion.length > versionName.length) {
        var postVersionSubString = existingVersion.substr(versionName.length - 1, existingVersion.length);
        var hashIndex = postVersionSubString.lastIndexOf('#');
        var closingParenIndex = postVersionSubString.lastIndexOf(')');
        if (hashIndex !== -1 && closingParenIndex !== -1 && closingParenIndex > hashIndex) {
          var numberStr = postVersionSubString.substr(hashIndex + 1, postVersionSubString.length);
          var parsedNumber = parseInt(numberStr, 10);
          if (parsedNumber.toString() !== 'NaN') {
            if (parsedNumber >= numberToAppend) {
              numberToAppend = parsedNumber + 1;
            }
          }
        }
      }
    });

    return versionName + ' (#' + numberToAppend + ')';
  };

  var authenticate = function (options) {
    var deferred = q.defer();

    var parsedHost = parseUrl(options.knappsackHost);

    var authenticateUrl = formatUrl({
      hostname: parsedHost.hostname,
      protocol: parsedHost.protocol,
      port: options.knappsackPort,
      pathname: options.knappsackPath + oAuthTokenApiPath
    });

    grunt.log.writeln('Authenticating with knappsack server');

    authenticateUrl = authenticateUrl + '?client_id=mobile_api_client&client_secret=kzI7QNsbne8KOlS' +
      '&grant_type=password&username=' + options.username + '&password=' + options.password;

    http.get(authenticateUrl, function (response) {
      var str = '';
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        if (response.statusCode !== 200) {
          grunt.log.error('Authenticating failed with status ' + response.statusCode);
          deferred.reject();
        } else {
          var authResponse = JSON.parse(str);
          deferred.resolve(authResponse.access_token);
        }
      });
    }).on('error', function (e) {
      grunt.log.error("Got an error trying to grab from server what are the current versions of the app: " + e.message);
      deferred.reject();
    });

    return deferred.promise;
  };

  var doesVersionExistOnServer = function (options, accessToken) {
    var deferred = q.defer();

    var parsedHost = parseUrl(options.knappsackHost);

    var getOptions = {
      hostname: parsedHost.hostname,
      path: options.knappsackPath + applicationApiPath + '/' + options.applicationId.toString() + '/applicationVersions',
      port: options.knappsackPort,
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    };

    http.get(getOptions, function (response) {
      var str = '';
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        if (response.statusCode !== 200) {
          grunt.log.error('Grabbing version failed with status ' + response.statusCode);
          deferred.reject();
        } else {
          var versionsThatExist = [];
          var versionInfoArr = JSON.parse(str);
          versionInfoArr.forEach(function (versionInfo) {
            if (versionInfo.versionName.substr(0, options.versionName.length) === options.versionName) {
              versionsThatExist.push(versionInfo.versionName);
            }
          });
          deferred.resolve({versionsThatExist: versionsThatExist, accessToken: accessToken});
        }
      });
    }).on('error', function (e) {
      grunt.log.error("Got an error trying to grab from server what are the current versions of the app: " + e.message);
      deferred.reject();
    });

    return deferred.promise;
  };

  var uploadBuildToKnappsack = function (options, accessToken, done) {
    var deferred = q.defer();

    grunt.log.writeln('Now uploading...');

    var parsedHost = parseUrl(options.knappsackHost);

    var uploadUrl = formatUrl({
      hostname: parsedHost.hostname,
      protocol: parsedHost.protocol,
      port: options.knappsackPort,
      pathname: options.knappsackPath + applicationVersionApiPath
    });

    var r = request({
      uri: uploadUrl,
      method: "POST",
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    }, function (error) {
      if (!!error) {
        grunt.log.error(error);
        deferred.reject(error);
      } else {
        grunt.log.ok('Uploaded ' + options.file.cyan + ' to Knappsack!');
        deferred.resolve();
      }
    });

    var form = r.form();
    form.append('applicationId', options.applicationId);
    form.append('versionName', options.versionName);
    form.append('recentChanges', options.recentChanges);
    form.append('appState', options.appState);
    form.append('installationFile', fs.createReadStream(options.file), {
      'Content-Type': 'application/octet-stream'
    });

    return deferred.promise;
  };
};
