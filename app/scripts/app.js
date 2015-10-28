angular.module('testapp', [ 
	'config', 
	'ngRoute',
	'forceng',
	'SafeApply',
	'testapp.form',
	'testapp.progress',
	'testapp.icon',
	'testapp.tooltip',
	'blockUI',
	'inform'
	])

.config(function($routeProvider, $sceDelegateProvider, $sceProvider, appconfig) {
	'use strict';

	$routeProvider.when('/:objectId', {
		controller: 'appcontroller',
		templateUrl: 'views/app.html'
	}).otherwise({
		redirectTo: '/'
	});

	$sceDelegateProvider.resourceUrlWhitelist([
		'https://localhost:9000/views/**',
		'views/**',
		'/resource/**'
	]);

	if(appconfig && appconfig.env && appconfig.env === 'dev') {
		$sceProvider.enabled(false);
	}
	
})

.run(['force', 'appconfig', '$rootScope', function(force, appconfig, $rootScope) {
	'use strict';

	force.init({
		accessToken: appconfig.SESSION_ID,
		useProxy: false
	});

	$rootScope.assetBase = appconfig.assetBase;
	if(appconfig.url) {
		$rootScope.iconUrl = appconfig.url + appconfig.assetBase;
	}
	else {
		$rootScope.iconUrl = '';
	}
}])

.controller('appcontroller', ['$scope', 'FormService', '$routeParams', 'blockUI', 'inform', function($scope, FormService, $routeParams, blockUI, inform) {
	'use strict';

	$scope.app = {
		name: 'POS Application', 
		objectId: $routeParams.objectId
	};

	blockUI.start('Loading Deal Journey...');
	FormService.getFormConfig($scope.app.objectId).then(function(config) {
		// this is what the form module uses to build up the form
		$scope.form = config;
	}).catch(function(error) {
		inform.add('Error loading deal journey, please contact an administrator...', {type: 'danger'});
	}).finally(function() {
		blockUI.stop();
	});

	$scope.saveForm = function() {

		FormService.saveFormConfig($scope.form);
	};

}])

.directive('smbStepoverview', [function() {
	'use strict';
	return {
		link: function(scope, element, attrs) {

			var aside = $(element).parents('aside');

			var resize = function() {
				$(element).width($(aside).width());	
			};

			// bind the window resize event to recalculate the width
			$(window).resize(resize);

			resize();

			// this will make the affixed nav scroll down to eliminate the gap above it until it clears it
			var scrollPosition = function() {
				var scrollPos = $(window).scrollTop();
				if(scrollPos < 120) {
					$(element).css({marginTop: 0-scrollPos});
				}
			};

			$(window).scroll(scrollPosition);
			scrollPosition();
			
		}
	};
}]);