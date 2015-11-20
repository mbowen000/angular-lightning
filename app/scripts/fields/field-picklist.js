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

.controller('liPicklistController', [function() {
	'use strict';
	this.init = function(scope, element) { 
		console.log('init');
		this.element = element;
		this.scope = scope;

		this.reconcileValues();
	};

	this.selectOption = function(option) {
		this.selectedOption = option;
		console.log(this);
	};

	this.reconcileValues = function() {
		var self = this; 1, 2, 3 | 1, 2
		var clone = [];
		_.each(self.scope.options, function(option) {
			if(self.scope.selected.indexOf(option) !== -1) {
				// if its found in the selected list, remove it
				clone = self.scope.options.slice(self.scope.options);
				clone.splice(clone.indexOf(option), 1);
				//newArr = self.scope.options.slice();
			}
		});
		self.scope.options = clone;
	};
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
		require: ['liPicklist'],
		link: function(scope, element, attrs, controllers) {
			var picklistController;

			if(controllers.length > 0) {
				picklistController = controllers[0];
			}

			if(picklistController) {
				picklistController.init(scope, element);
			}
		}	
	};
}]);