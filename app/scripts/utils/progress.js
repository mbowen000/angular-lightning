angular.module('angular-lightning.progress', [])

	.directive('liProgressbar', [function() {
		'use strict';
		return {
			templateUrl: 'views/util/progressbar.html',
			scope: {
				value: '=',
				nobadge: '@'
			},
			link: function(scope, element, attrs) {
				if(_.has(attrs, 'minimal')) {
					scope.minimal = true;
				}

				scope.getValue = function() {
					var val = scope.value || 0;
					return (val < 100) ? Math.round(val / 100 * 100) : 100;
				}
			}
		};
	}]);
