  // create the module and name it scotchApp
  var scotchApp = angular.module('smb', ['ngRoute']);

  // configure our routes
  scotchApp.config(function($routeProvider) {
    $routeProvider

      // route for the home page
      .when('/', {
        templateUrl : 'views/home.html',
        controller  : 'MainController'
      })

      // route for the about page
      .when('/about', {
        templateUrl : 'pages/about.html',
        controller  : 'aboutController'
      })

      // route for the contact page
      .when('/contact', {
        templateUrl : 'pages/contact.html',
        controller  : 'contactController'
      });
  });

  // create the controller and inject Angular's $scope
 

  scotchApp.controller('aboutController', function($scope) {
    $scope.message = 'Look! I am an about page.';
  });

  scotchApp.controller('contactController', function($scope) {
    $scope.message = 'Contact us! JK. This is just a demo.';
  });