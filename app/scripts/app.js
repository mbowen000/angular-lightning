angular.module('testapp', [ 
	'config', 
	'ngRoute',
	'forceng',
	'testapp.page',
	'SafeApply'
	])

.config(function($routeProvider, $sceDelegateProvider) {
	'use strict';

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

.run(['force', 'appconfig', function(force, appconfig) {
	'use strict';

	force.init({
		accessToken: appconfig.SESSION_ID,
		useProxy: false
	});
}])

.controller('appcontroller', ['$scope', 'FormService', function($scope, FormService) {
	'use strict';

	$scope.app = {
		name: 'POS Application'
	};

	
	/*
	PageService.getPages().then(function(collection) {
		$scope.pages = collection;
	});
	*/

	FormService.getFormConfig().then(function(config) {
		$scope.form = config;
	});	

	// will retrieve these via service call
	// $scope.steps = new StepsCollection({
	// 	sObject: 'Account',
	// 	limit: 10,
	// 	attrs: ['Id, Name']
	// });

	// $scope.steps.fetch().then(function(models) {
	// 	console.log(models);
	// });

}]);