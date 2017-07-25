(function(window) {
  'use strict';

  var allTestFiles = [];
  var TEST_REGEXP = /.*Spec\.js$/;

  // Get a list of all the test files to include
  Object.keys(window.__karma__.files).forEach(function (file) {
    if (TEST_REGEXP.test(file)) {
      // Normalize paths to RequireJS module names.
      // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
      // then do not normalize the paths
      //var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '')
      //allTestFiles.push(normalizedTestModule)
      allTestFiles.push(file)
    }
  });

  // configs of requirejs
  /*require.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base',

    // dynamically load all test files
    deps: allTestFiles,

    // we have to kickoff jasmine, as it is asynchronous
    callback: window.__karma__.start
  })*/

  window.dojoConfig = {
    packages: [
      // local pacakges to test
      {
        name:"extras",
        location:"/libs/gis/extras"
      },

      // esri/dojo packages
      {
        name: 'dgrid',
        location: 'https://js.arcgis.com/3.20/dgrid'
      }, {
        name: 'dijit',
        location: 'https://js.arcgis.com/3.20/dijit'
      }, {
        name: 'esri',
        location: 'https://js.arcgis.com/3.20/esri'
      }, {
        name: 'dojo',
        location: 'https://js.arcgis.com/3.20/dojo'
      }, {
        name: 'dojox',
        location: 'https://js.arcgis.com/3.20/dojox'
      }, {
        name: 'put-selector',
        location: 'https://js.arcgis.com/3.20/put-selector'
      }, {
        name: 'util',
        location: 'https://js.arcgis.com/3.20/util'
      }, {
        name: 'xstyle',
        location: 'https://js.arcgis.com/3.20/xstyle'
      }, {
        name: 'moment',
        location: 'https://js.arcgis.com/3.20/moment'
      }
    ],
    async: true/*,
    cacheBust: true*/
  };
  /**
   * This function must be defined and is called back by the dojo adapter
   * @returns {string} a list of dojo spec/test modules to register with your testing framework
   */
  window.__karma__.dojoStart = function() {
    return allTestFiles;
  };
})(window);
