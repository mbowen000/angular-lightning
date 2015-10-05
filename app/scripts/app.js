angular.module('testapp', [ 
	'config', 
	'ngRoute'
	])

	.config(function($routeProvider, $sceDelegateProvider) {
		
		$routeProvider.when('/', {
			controller: 'appcontroller',
			templateUrl: 'views/app.html'
		}).otherwise({
			redirectTo: '/'
		});

		$sceDelegateProvider.resourceUrlWhitelist([
			'https://localhost:9000/views/**',
			'views/**'
		]);

	})

	.run(['$route', function($route) {
		$route.reload();
	}])



	.controller('appcontroller', ['$scope', function($scope) {
		
		$scope.app = {
			name: 'POS Application'
		};

	}]);