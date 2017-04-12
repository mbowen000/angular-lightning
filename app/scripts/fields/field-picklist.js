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

	var ModelObj = function(val) {
		this.value = val;
		this.selected = false;
		this.uid = _.uniqueId('p_');
		return this;
	};

	$scope.selected = [];

	this.init = function(_scope, _element, _attrs, controllers) {
		element = _element;
		modelCtrl = controllers[1];

		$scope.options = _.map($scope.options, function(val, key) {
			if (typeof val !== "object") {
				return new ModelObj(val);
			}
			else {
				return val;
			}
		});

		modelCtrl.$render = function() {
			if (modelCtrl.$modelValue) {
				var temp = _.map(modelCtrl.$modelValue.split(';'), function(val, key) {
					return new ModelObj(val);
				});

				$scope.selected = $scope.selected.concat(temp);
			}
			else {
				$scope.selected = [];
			}

			reconcileValues();
		};
	};

	$scope.$watch(function() {
		return element.attr('disabled');
	}, function(newValue) {
		if (newValue) {
			$scope.disabled = true;
		}
		else {
			$scope.disabled = false;
		}
	});

	$scope.toggleSelected = function(option) {
		if (!$scope.disabled) {
			option.selected = !option.selected;
		}
	};

	$scope.highlightOption = function(option) {
		var index = _.indexOf($scope.highlightedToAdd, option);

		if (index === -1) {
			$scope.highlightedToAdd.push(option);
		} else {
			$scope.highlightedToAdd.splice(index, 1);
		}
	};

	$scope.areOptionsHighlighted = function() {
		return _.where($scope.options, {selected: true}).length > 0;
	};

	$scope.areSelectedHighlighted = function() {
		return _.where($scope.selected, {selected: true}).length > 0;
	};

	$scope.selectHighlighted = function() {
		var toMove = _.where($scope.options, {selected: true});
		$scope.selected = $scope.selected.concat(toMove);
		reconcileValues();
		$scope.selected = _.map($scope.selected, function(obj){
			obj.selected = false;
			return obj; 
		});
	};

	$scope.removeHighlighted = function() {
		var toMove = _.where($scope.selected, {selected: true});
		
		$scope.selected = _.filter($scope.selected, function(opt) {
				return _.find(toMove, opt) === undefined;
		});

		$scope.options = $scope.options.concat(toMove);

		reconcileValues();

		$scope.options = _.map($scope.options, function(obj) {
			obj.selected = false;
			return obj;
		});
	};

	var reconcileValues = function() {
		// get the diff
		var diff = _.filter($scope.options, function(opt) {
				return _.findWhere($scope.selected, {value: opt.value}) === undefined;
		});

		$scope.options = [];

		_.each(diff, function(d) {
			$scope.options.push(d);
		});

		$scope.highlighted = [];
	};

	$scope.$watchCollection('selected', function(newVals, oldVals) {
		if(newVals !== oldVals) {
			modelCtrl.$setViewValue(_.pluck(newVals, 'value').join(';'));
		}
	});
}])

.directive('liPicklist', [function() {
	'use strict';
	return {
		scope: {
			options: '='
		},
		controller: 'liPicklistController',
		templateUrl: 'views/fields/field-picklist.html',
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
