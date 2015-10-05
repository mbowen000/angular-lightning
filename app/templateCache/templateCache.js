angular.module('testapp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/app.html',
    "Main Template"
  );

}]);
