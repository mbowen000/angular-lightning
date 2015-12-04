angular.module('angular-lightning.lookup', [])

.controller('liLookupController', ['$compile', '$parse', '$q', function($compile, $parse, $q) {
	'use strict';
	this.init = function(_scope, _element, _attrs, controllers) { 
		var scope, element, attrs, modelCtrl;
		element = _element;
		scope = _scope.$new();
		attrs = _attrs;
		modelCtrl = controllers[1];

		scope.matches = [];

		// create ui elements for the dropdown
		var dropdownElem = angular.element('<div li-lookup-dropdown></div>');
		dropdownElem.attr({
			matches: 'matches',
			currentVal: 'currentVal',
			isFocused: 'isFocused'
		});

		// compile the ui element
		var dropdownDomElem = $compile(dropdownElem)(scope);

		// insert it into the dom
		$(element).parents('.slds-lookup').append(dropdownDomElem);

		// parse the expression the user has provided for what function/value to execute (right now assuming its a function)
		var parsedExpression = $parse(attrs.liLookup);

		// create a listener for typing
		element.bind('keydown', function(event) {
			// when the deferred given to us by the expression resolves, we'll loop over all the results and put them into the matches scope var which 
			// has been handed down to the dropdown directive
			// we need to give the current model value to the functoin we're executing as a local
			var locals = {
				$viewValue: modelCtrl.$viewValue
			}

			$q.when(parsedExpression(scope, locals)).then(function(results) {
				scope.matches.length = 0;
				_.each(results, function(result) {
					scope.matches.push(result);
				});

				scope.currentVal = modelCtrl.$viewValue;
			});
		});

		element.bind('focus', function(event) {
			scope.isFocused = true;
			scope.$digest();
		});

		// implement blur & documentClickBind() function from the datepicker to choose if we hide the dropdown when we click outside the element


	};

}])

.directive('liLookup', [function() {
	'use strict';
	return {
		controller: 'liLookupController',
		require: ['liLookup', 'ngModel'],
		link: function(scope, element, attrs, controllers) {
			var lookupController;

			if(controllers.length > 0) {
				lookupController = controllers[0];
			}

			if(lookupController) {
				lookupController.init(scope, element, attrs, controllers);
			}
		}	
	};
}])

.directive('liLookupDropdown', [function() {
	'use strict';
	return {
		templateUrl: 'views/fields/lookup/lookup-dropdown.html'
	}
}]);