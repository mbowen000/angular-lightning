angular.module('angular-lightning.wysiwyg', [])

.controller('liWysiwygController', ['$scope', function($scope) {
	'use strict';
	var modelCtrl;
	$scope.wysiwygId = 'uniqueId';
	$scope.content = 'Demo Content';

	this.init = function(_scope, _element, _attrs, controllers) {
		var attrs = _attrs;
		modelCtrl = controllers[1];
		console.log(attrs);
		modelCtrl.$render = function() {
			if (modelCtrl.$modelValue) {
				_scope.content = modelCtrl.$modelValue;
			}
		};

		_scope.wysiwygId = attrs.wysiwygId;
	};

	$(document).bind("trix-change", function(event) {
		if ($(event.target).is($('trix-editor[input="'+$scope.wysiwygId+'"'))) {
			modelCtrl.$setViewValue($('#'+$scope.wysiwygId).val());
		}
	});
}])

.directive('liWysiwyg', [function() {
	'use strict';
	return {
		templateUrl: 'views/fields/field-wysiwyg.html',
		require: ['liWysiwyg', 'ngModel'],
		controller: 'liWysiwygController',
		link: function(scope, element, attrs, controllers) {
			var wysiwygController = controllers[0];
			wysiwygController.init(scope, element, attrs, controllers);
		}
	};
}]);