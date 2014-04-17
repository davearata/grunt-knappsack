'use strict';

var nock = require('nock');

global.nockScope = nock('http://mydomain.com')
  .post('/api/v1/applicationVersions').reply(200, 'OK');

global.nockScope = nock('http://mydomain.com')
  .get('/api/v1/applications/1/applicationVersions').reply(200, []);

global.nockScope = nock('http://mydomain.com')
  .get('/oauth/token?client_id=mobile_api_client&client_secret=kzI7QNsbne8KOlS' +
    '&grant_type=password&username=test@test.com&password=abc123').reply(200, {access_token: 'sknsdjn_eknef'});

global.nockScope = nock('http://mydomain.com')
  .post('/api/v1/applicationVersions').reply(200, 'OK');

global.nockScope = nock('http://mydomain.com')
  .get('/api/v1/applications/1/applicationVersions').reply(200, []);

global.nockScope = nock('http://mydomain.com')
  .get('/oauth/token?client_id=mobile_api_client&client_secret=kzI7QNsbne8KOlS' +
    '&grant_type=password&username=test@test.com&password=abc123').reply(200, {access_token: 'sknsdjn_eknef'});