'use strict';

var ksackUpload = require('../js/knappsack-upload');
var nock = require('nock');

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

exports.testDefaultOptions = function testDefaultOptions(test) {
  test.expect(5);

  var accessTokenRequestPath = '/oauth/token?client_id=mobile_api_client&client_secret=kzI7QNsbne8KOlS&grant_type=password&username=testuser&password=testpwd'
  var nockAccessTokenScope = nock('http://mydomain.com:123')
    .get(accessTokenRequestPath).reply(200, {access_token: 'test-access-token'});

  var appVersionsQueryPath = '/api/v1/applications/testappid/applicationVersions';
  var nockVersionQueryScope = nock('http://mydomain.com:123', {
    reqheaders: {
      'Authorization': 'Bearer test-access-token'
    }
  }).get(appVersionsQueryPath).reply(200, [{versionName: '1.0'}]);

  var uploadPostPath = '/api/v1/applicationVersions';
  var nockUploadScope = nock('http://mydomain.com:123')
    .post(uploadPostPath).reply(200);

  var options = {
    knappsackHost: 'http://mydomain.com',
    applicationId: 'testappid',
    knappsackPort: 123,
    knappsackPath: '',
    file: 'test/fixtures/testing',
    versionName: '1.0',
    appState: 'GROUP_PUBLISH',
    recentChanges: '',
    username: 'testuser',
    password: 'testpwd'
  };

  var log = newCounterLog();
  function done(status) {
    test.ok(status !== false, 'done status');
    test.ok(nockAccessTokenScope.isDone(), 'http access token request');
    test.ok(nockVersionQueryScope.isDone(), 'http version query');
    test.ok(nockUploadScope.isDone(), 'upload post');
    test.equal(0, log.getErrorCount());
    test.done();
  }

  ksackUpload(options, done, log);
};

exports.testDefaultOneAuthenticationRetry = function testDefaultOneAuthenticationRetry(test) {
  test.expect(5);

  var log = newCounterLog();

  var accessTokenRequestPath = '/oauth/token?client_id=mobile_api_client&client_secret=kzI7QNsbne8KOlS&grant_type=password&username=testuser&password=testpwd'
  var nockAccessTokenScope = nock('http://mydomain.com:123')
    .get(accessTokenRequestPath).reply(403)
    .get(accessTokenRequestPath).reply(200, {access_token: 'test-access-token'});

  var appVersionsQueryPath = '/api/v1/applications/testappid/applicationVersions';
  var nockVersionQueryScope = nock('http://mydomain.com:123', {
    reqheaders: {
      'Authorization': 'Bearer test-access-token'
    }
  }).get(appVersionsQueryPath).reply(200, [{versionName: '1.0'}]);

  var uploadPostPath = '/api/v1/applicationVersions';
  var nockUploadScope = nock('http://mydomain.com:123')
    .post(uploadPostPath).reply(200);

  var options = {
    knappsackHost: 'http://mydomain.com',
    applicationId: 'testappid',
    knappsackPort: 123,
    knappsackPath: '',
    file: 'test/fixtures/testing',
    versionName: '1.0',
    appState: 'GROUP_PUBLISH',
    recentChanges: '',
    username: 'testuser',
    password: 'testpwd'
  };

  function done(status) {
    test.ok(status !== false, 'done status');
    test.ok(nockAccessTokenScope.isDone(), 'http access token request');
    test.ok(nockVersionQueryScope.isDone(), 'http version query');
    test.ok(nockUploadScope.isDone(), 'upload post');
    test.equal(1, log.getErrorCount());
    test.done();
  }

  ksackUpload(options, done, log);
};

exports.testTwoAuthenticationRetries = function testTwoAuthenticationRetries(test) {
  test.expect(5);

  var log = newCounterLog();

  var accessTokenRequestPath = '/oauth/token?client_id=mobile_api_client&client_secret=kzI7QNsbne8KOlS&grant_type=password&username=testuser&password=testpwd'
  var nockAccessTokenScope = nock('http://mydomain.com:123')
    .get(accessTokenRequestPath).reply(403)
    .get(accessTokenRequestPath).reply(403)
    .get(accessTokenRequestPath).reply(200, {access_token: 'test-access-token'});

  var appVersionsQueryPath = '/api/v1/applications/testappid/applicationVersions';
  var nockVersionQueryScope = nock('http://mydomain.com:123', {
    reqheaders: {
      'Authorization': 'Bearer test-access-token'
    }
  }).get(appVersionsQueryPath).reply(200, [{versionName: '1.0'}]);

  var uploadPostPath = '/api/v1/applicationVersions';
  var nockUploadScope = nock('http://mydomain.com:123')
    .post(uploadPostPath).reply(200);

  var options = {
    knappsackHost: 'http://mydomain.com',
    applicationId: 'testappid',
    knappsackPort: 123,
    knappsackPath: '',
    file: 'test/fixtures/testing',
    versionName: '1.0',
    appState: 'GROUP_PUBLISH',
    recentChanges: '',
    username: 'testuser',
    password: 'testpwd',
    retries: 2
  };

  function done(status) {
    test.ok(status !== false, 'done status');
    test.ok(nockAccessTokenScope.isDone(), 'http access token request');
    test.ok(nockVersionQueryScope.isDone(), 'http version query');
    test.ok(nockUploadScope.isDone(), 'upload post');
    test.equal(2, log.getErrorCount());
    test.done();
  }

  ksackUpload(options, done, log);
};

exports.testTwoFetchVersionsRetries = function testTwoFetchVersionsRetries(test) {
  test.expect(5);

  var log = newCounterLog();

  var accessTokenRequestPath = '/oauth/token?client_id=mobile_api_client&client_secret=kzI7QNsbne8KOlS&grant_type=password&username=testuser&password=testpwd'
  var nockAccessTokenScope = nock('http://mydomain.com:123')
    .get(accessTokenRequestPath).reply(200, {access_token: 'test-access-token'});

  var appVersionsQueryPath = '/api/v1/applications/testappid/applicationVersions';
  var appVersionsHeaders = {
    reqheaders: {
      'Authorization': 'Bearer test-access-token'
    }
  };
  var nockVersionQueryScope = nock('http://mydomain.com:123', appVersionsHeaders)
    .get(appVersionsQueryPath).reply(403)
    .get(appVersionsQueryPath).reply(404)
    .get(appVersionsQueryPath).reply(200, [{versionName: '1.0'}]);

  var uploadPostPath = '/api/v1/applicationVersions';
  var nockUploadScope = nock('http://mydomain.com:123')
    .post(uploadPostPath).reply(200);

  var options = {
    knappsackHost: 'http://mydomain.com',
    applicationId: 'testappid',
    knappsackPort: 123,
    knappsackPath: '',
    file: 'test/fixtures/testing',
    versionName: '1.0',
    appState: 'GROUP_PUBLISH',
    recentChanges: '',
    username: 'testuser',
    password: 'testpwd',
    retries: 2
  };

  function done(status) {
    test.ok(status !== false, 'done status');
    test.ok(nockAccessTokenScope.isDone(), 'http access token request');
    test.ok(nockVersionQueryScope.isDone(), 'http version query');
    test.ok(nockUploadScope.isDone(), 'upload post');
    test.equal(2, log.getErrorCount());
    test.done();
  }

  ksackUpload(options, done, log);
};

exports.testAuthenticationFail = function testAuthenticationFail(test) {
  test.expect(3);

  var log = newCounterLog();

  var accessTokenRequestPath = '/oauth/token?client_id=mobile_api_client&client_secret=kzI7QNsbne8KOlS&grant_type=password&username=testuser&password=testpwd'
  var nockAccessTokenScope = nock('http://mydomain.com:123')
    .get(accessTokenRequestPath).reply(403)
    .get(accessTokenRequestPath).reply(403);

  var options = {
    knappsackHost: 'http://mydomain.com',
    applicationId: 'testappid',
    knappsackPort: 123,
    knappsackPath: '',
    file: 'test/fixtures/testing',
    versionName: '1.0',
    appState: 'GROUP_PUBLISH',
    recentChanges: '',
    username: 'testuser',
    password: 'testpwd'
  };

  function done(status) {
    test.ok(status === false, 'done status');
    test.ok(nockAccessTokenScope.isDone(), 'http access token request');
    test.equal(3, log.getErrorCount());
    test.done();
  }

  ksackUpload(options, done, log);
};

function newCounterLog() {
  var okCount = 0;
  var errorCount = 0;
  var writelnCount = 0;

  return {
    ok: function (msg) {
      okCount++;
    },
    error: function (msg) {
      errorCount++;
    },
    writeln: function (msg) {
      writelnCount++;
    },
    getOkCount: function () {
      return okCount;
    },
    getErrorCount: function () {
      return errorCount;
    },
    getWritelnCount: function () {
      return writelnCount;
    }
  };
}