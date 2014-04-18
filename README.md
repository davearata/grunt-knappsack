# grunt-knappsack

> The best Grunt plugin ever.

## Getting Started
This plugin requires Grunt `~0.4.4`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-knappsack --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-knappsack');
```

## The "knappsack" task

### Overview
In your project's Gruntfile, add a section named `knappsack` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  knappsack: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      options: {
        // Target-specific file lists and/or options go here.
      }
    },
  },
});
```

### Options

#### options.knappsackHost
Type: `String`
Required

The hostname where knappsack is hosted

#### options.knappsackPort
Type: `Integer`
Optional

The Network port to access knappsack

#### options.knappsackPath
Type: `String`
Optional

The root path to access knappsack

#### options.username
Type: `String`
Required

The username to use for authenticating with knappsack

#### options.password
Type: `String`
Required

The password to use for authenticating with knappsack

#### options.applicationId
Type: `Integer`
Required

The knappsack applicaitonId of the app to upload a version of

#### options.appState
Type: `String`
Default: `GROUP_PUBLISH`

The state of the version after its been uploaded. valid values are:`GROUP_PUBLISH`, `ORGANIZATION_PUBLISH`, `DISABLED`, `ORG_PUBLISH_REQUEST`, `RESIGNING`

#### options.versionName
Type: `String`
Required

The name of the version being uploaded. The plugin will query knappsack for current versions of the app. If any match the versionName provided the plugin will append a (#<number>) to the end of the versionName

#### options.recentChanges
Type: `String` or `Function`
Default ` `

Any notes or description you want to include with the version being uploaded

#### options.file
Type: `String`
Required

The path to the file being uploaded

### Usage Examples

```js
var gitRev = require('git-rev');

grunt.initConfig({
  knappsack: {
    options: {
      knappsackHost: 'http://mydomain.com',
      knappsackPort: 9090,
      knappsackPath: '/knappsack',
      username: 'dev@mydomain.com',
      password: 'knappsack_rocks!'
    },
    android: {
      options: {
        applicationId: 42,
        versionName: '1.0',
        recentChanges: function(done) { // you can use async function.
          gitRev.long(function(hash) {
            done("commit " + hash);
          });
        },
        file: 'android.apk'
      }
    }
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
