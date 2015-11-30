angular.module('angular-lightning.modal', [])

/**
* The service is responsible for creating the modal on the document... can in the future put things here to manage multiple modals etc.
**/
.factory('liModalService', ['$rootScope', '$compile', function($rootScope, $compile) {
	'use strict';
	var modal = null;

	// this we should allow to be passed in so we can augment an existing scope
	var modalScope = $rootScope.$new();
	modalScope.close = function() {
		modal.remove();
	};

	var $modalService = {
		// some properties here
	};

	$modalService.open = function(options) {
		// append to dom here
		var modalEl = angular.element('<div li-modal></div>');
		modal = $compile(modalEl)(modalScope);

		$("body").append(modal);
	};

	return $modalService;
}])

.directive('liModal', [function() {
	'use strict';
	return {
		templateUrl: 'views/util/modal.html',
		link: function(scope, elem, attrs) {
			console.log('linked');
		}
	}
}])

.provider('liModal', function() {
	'use strict';
	var $modalProvider = {
		options: {

		},
		$get: ['liModalService', function(liModalService) {
			var $modal = {};

			$modal.open = function(options) {
				liModalService.open(options);
			};

			$modal.close = function() {
				liModalService.close();
			};

			return $modal;
		}]
	}

	return $modalProvider;
});