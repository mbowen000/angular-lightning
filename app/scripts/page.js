angular.module('testapp.page', ['testapp.section'])

.factory('Page', ['Section', '$rootScope', function(Section, $rootScope) {
	'use strict';
	return function(options) {
		var self = this;
		_.extend(this, options, {
			progress: function() {
				var validCount = 0;
				_.each(this.sections, function(section) {
					if(section.formCtrl && section.formCtrl.$valid) {
						validCount++;
					}
				});
				return Math.round((validCount / this.sections.length) * 100) || 100;
			},
			activate: function() {
				this.active = true;
				$rootScope.$broadcast('activate-page', this);
			},
			deactivate: function() {
				this.active = false;
			}
		});

		// create section objects for each of the section elements
		var sections = [];
		_.each(this.sections, function(section) {
			sections.push(new Section(section));
		});
		this.sections = sections;

		$rootScope.$on('activate-page', function($event, page) {
			if(self !== page) {
				self.deactivate();
			}
		});

		return this;
	};
}])

.controller('PageController', ['$scope', function($scope) {
	'use strict';

	var formCtrl;

	this.init = function(element, controllers) {
		this.element = element;
		formCtrl = controllers[2];

		$scope.page.formCtrl = formCtrl;
	};

	_.extend(this, {

	});

	return this;
}])

.directive('smbPage', [function() {
	'use strict';
	return {
		require: ['smbPage', '^smbForm', 'form'],
		controller: 'PageController',
		link: function(scope, element, attrs, controllers) {
			controllers[0].init(element, controllers);
			return this;
		}
	};
}]);