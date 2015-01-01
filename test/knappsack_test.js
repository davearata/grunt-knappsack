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

exports.test = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },

  default_options: function(test) {
    test.expect(4);

    var accessTokenRequestPath = '/oauth/token?client_id=mobile_api_client&client_secret=kzI7QNsbne8KOlS&grant_type=password&username=testuser&password=testpwd'
    var nockAccessTokenScope = nock('http://mydomain.com:123')
      .get(accessTokenRequestPath).reply(200, {access_token: 'test-access-token'});

    var appVersionsQueryPath = '/api/v1/applications/testappid/applicationVersions';
    var nockVersionQueryScope = nock('http://mydomain.com:123',{
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
      password: 'testpwd' };

    function done(status) {
      test.ok(status !== false, 'done status');
      test.ok(nockAccessTokenScope.isDone(), 'http access token request');
      test.ok(nockVersionQueryScope.isDone(), 'http version query');
      test.ok(nockUploadScope.isDone(), 'upload post');
      test.done();
    }

    ksackUpload(options, done);
  }
};
