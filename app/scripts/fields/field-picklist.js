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

	// init this with previously loaded values from ngModel (if they exist)
	$scope.selected = [];
	

	this.init = function(_scope, _element, _attrs, controllers) { 
		element = _element;
		modelCtrl = controllers[1];
		//reconcileValues();
	};

	$scope.highlightOption = function(option) {
		$scope.highlighted = option;
	}

	$scope.selectHighlighted = function() {
		$scope.selected.push($scope.highlighted);
		reconcileValues();
		// add to ngModel (do some parsing like adding semi-colons if needed)

		// add some logic to make sure we can't add the value 2 times after already adding it
	}

	$scope.removeHighlighted = function() {
		$scope.selected.splice($scope.selected.indexOf($scope.highlighted));
		$scope.options.push($scope.highlighted);
		reconcileValues();

		// add some logic to make sure we can't "remove" the item twice
	}

	var reconcileValues = function() {
		// get the diff
		var diff = _.difference($scope.options, $scope.selected);
		$scope.options = [];
		_.each(diff, function(d) {
			$scope.options.push(d);
		})
	};

	$scope.$watchCollection('selected', function(newVals, oldVals) {
		console.log(newVals);
		// set the ngModel.$modelValue here? just set it to the value of the array prob?
		modelCtrl.$modelValue = newVals;
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