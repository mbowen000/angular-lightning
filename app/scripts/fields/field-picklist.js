angular.module('angular-lightning.picklist', [])

.service('PicklistService', [function() {
	'use strict';
	return {
		/**
		* Gets an array from a delimited list of values, since in salesforce they're stored in comma separated lists
		**/
		getArrayFromDelimted: function(values) {
			return values.split(';');
		}
	};
}])

.controller('liPicklistController', ['$scope', function($scope) {
	'use strict';
	var element, modelCtrl;

	$scope.selected = [];

	this.init = function(_scope, _element, _attrs, controllers) { 
		element = _element;
		modelCtrl = controllers[1];

		modelCtrl.$render = function() {
			if (modelCtrl.$modelValue) {
			    $scope.selected = modelCtrl.$modelValue.split(';');
				reconcileValues();
			}
		};
	};

	$scope.highlightOption = function(option) {
		$scope.highlighted = option;
	}

	$scope.selectHighlighted = function() {
		if ($scope.highlighted != null && _.indexOf($scope.options, $scope.highlighted) > -1) {
			$scope.selected.push($scope.highlighted);
			reconcileValues();
		}
	}

	$scope.removeHighlighted = function() {
		if ($scope.highlighted != null && _.indexOf($scope.selected, $scope.highlighted) > -1) {
			$scope.selected.splice($scope.selected.indexOf($scope.highlighted), 1);
			$scope.options.push($scope.highlighted);
			reconcileValues();
		}
	}

	var reconcileValues = function() {
		// get the diff
		var diff = _.difference($scope.options, $scope.selected);
		$scope.options = [];
		_.each(diff, function(d) {
			$scope.options.push(d);
		});
		$scope.highlighted = null;
	};

	$scope.$watchCollection('selected', function(newVals, oldVals) {
		modelCtrl.$setViewValue(newVals.join(';'));
	});
}])

.directive('liPicklist', [function() {
	'use strict';
	return {
		scope: {
			options: '=',
			selected: '='
		},
		controller: 'liPicklistController',
		templateUrl: 'views/field-picklist.html',
		require: ['liPicklist', 'ngModel'],
		link: function(scope, element, attrs, controllers) {
			var picklistController;

			if(controllers.length > 0) {
				picklistController = controllers[0];
			}

			if(picklistController) {
				picklistController.init(scope, element, attrs, controllers);
			}
		}	
	};
}]);