angular.module('angular-lightning.modal', [])

/**
* The service is responsible for creating the modal on the document... can in the future put things here to manage multiple modals etc.
**/
.factory('liModalService', ['$rootScope', '$compile', function($rootScope, $compile) {
	'use strict';
	var modal = null;
	var modalBackdrop = null;

	// this we should allow to be passed in so we can augment an existing scope
	var modalScope = null;

	var $modalService = {
		// some properties here
	};

	$modalService.open = function(options) {
		// append to dom here
		var modalEl = angular.element('<div li-modal></div>');
		
		modalScope = (options.scope || $rootScope).$new();

		// add a standard close function
		modalScope.close = function() {
			modal.remove();
			modalBackdrop.remove();
		};

		modalEl.attr({
			'template-url': options.templateUrl
		});
		modal = $compile(modalEl)(modalScope);

		var modalElBackdrop = angular.element('<div class="slds-backdrop slds-backdrop--open"></div>');
		modalBackdrop = $compile(modalElBackdrop)(modalScope);

		// append the backdrop first
		$("body").append(modalBackdrop);

		// then the modal
		$("body").append(modal);
	};

	$modalService.close = function() {
		modal.remove();
		modalBackdrop.remove();
	};

	return $modalService;
}])

.directive('liModal', [function() {
	'use strict';
	return {
		templateUrl: function(tElem, tAttrs) {
			return tAttrs.templateUrl || 'views/util/modal.html';
		},
		link: function(scope, elem, attrs) {
			
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