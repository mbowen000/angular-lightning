angular.module('angular-lightning-demo.modal', [])

.controller('DemoModalController', ['liModal', '$scope', function(liModal, $scope) {
	'use strict';

	$scope.message = 'hello world';

	this.open = function() {
		liModal.open({
			templateUrl: 'views/demo/modal-demo.html',
			scope: $scope
		});
	}

}]);