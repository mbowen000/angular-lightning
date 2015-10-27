angular.module('testapp.section', ['testapp.field'])

.factory('Section', ['Field', function(Field) {
	'use strict';
	return function(options) {
		_.extend(this, options, {
			progress: function() {
				var validCount = 0;
				_.each(this.elements, function(element) {
					if(element.formCtrl && element.formCtrl.$valid) {
						validCount++;
					}
				});
				return Math.round((validCount / this.elements.length) * 100) || 0;
			},
			toJSON: function() {
				return _.extend(_.pick(this, 'name'), {
					elements: _.map(this.elements, function(element) {
						return element.toJSON();
					})
				});	
			}
		});

		var elements = [];
		_.each(this.elements, function(field) {
			elements.push(new Field(field));
		});
		this.elements = elements;

		return this;
	};
}])

.controller('SectionController', ['$scope', function($scope) {
	'use strict';

	var formCtrl;

	this.init = function(element, controllers) {
		this.element = element;
		formCtrl = controllers[2];

		$scope.section.formCtrl = formCtrl;
	};

	_.extend(this, {

	});

	return this;
}])

.directive('smbSection', [function() {
	'use strict';
	return {
		require: ['smbSection', '^smbPage', 'form'],
		controller: 'SectionController',
		link: function(scope, element, attrs, controllers) {
			controllers[0].init(element, controllers);
			return this;
		}
	};
}]);