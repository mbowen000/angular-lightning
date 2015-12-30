angular.module('angular-lightning.wysiwyg', [])

.controller('liWysiwygController', ['$scope', function($scope) {
	'use strict';
	var modelCtrl;
	$scope.wysiwygId = 'uniqueId';
	$scope.content = 'Demo Content';

	this.init = function(_scope, _element, _attrs, controllers) {
		var attrs = _attrs;
		modelCtrl = controllers[1];
		
		modelCtrl.$render = function() {
			if (modelCtrl.$modelValue) {
				_scope.content = modelCtrl.$modelValue;
				var elem = $('trix-editor[input="'+$scope.wysiwygId+'"')[0];
				elem.editor.loadHTML(modelCtrl.$modelValue);
			}
		};

		_scope.wysiwygId = attrs.wysiwygId;
	};

	$(document).bind("trix-change", function(event) {
		if ($(event.target).is($('trix-editor[input="'+$scope.wysiwygId+'"'))) {
			var elem = $('trix-editor[input="'+$scope.wysiwygId+'"')[0];
			modelCtrl.$setViewValue(elem.editor.getDocument().toString());
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