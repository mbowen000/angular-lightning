angular.module('angular-lightning-demo.modal', [])

.controller('DemoModalController', ['liModal', function(liModal) {
	'use strict';

	this.open = function() {
		liModal.open({
			templateUrl: 'views/demo/modal-demo.html'
		});
	}

}]);