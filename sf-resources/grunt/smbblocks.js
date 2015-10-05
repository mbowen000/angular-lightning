var _ = require('underscore');

module.exports = function(grunt) {
  'use strict';

  grunt.log.subhead('Computername: ' + process.env.COMPUTERNAME);
  var environment = {
    computername: process.env.COMPUTERNAME
  };

  // get the environment json file
  var rawEnv = grunt.file.readJSON('environments/' + environment.computername + '-env.json');

  // make sure we have defaults
  var pagePrefix = rawEnv.vfPageName || 'vfpage';
  var pageSuffix = rawEnv.devName || 'dev';

  grunt.config.merge({
    environmentConfig: _.extend({
       pageName: pagePrefix + '_' + pageSuffix,
       prodPageName: pagePrefix,
       appName: 'defaultapp'
    }, rawEnv)
  });

  grunt.log.writeln('Page Name: ' + grunt.config.get('environmentConfig').pageName);

};