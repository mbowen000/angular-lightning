angular.module('angular-lightning.progress', [])

	.directive('smbProgressbar', [function() {
		'use strict';
		return {
			templateUrl: 'views/util/progressbar.html',
			scope: {
				value: '=',

			},
			link: function(scope, element, attrs) {
				if(_.has(attrs, 'minimal')) {
					scope.minimal = true;
				}
			}
		};		
	}]);