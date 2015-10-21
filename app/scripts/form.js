angular.module('testapp.form', ['testapp.field', 'testapp.page'])

.service('FormService', ['$http', 'Page', function($http, Page) {
	'use strict';
	return {
		getFormConfig: function() {
			return $http.get('assets/mockresponse-spconfig.json').then(function(response) {
				//self.parseModels(response.data.pages);

				var pages = [];
				
				_.each(response.data.pages, function(page) {
					var page = new Page(page);
					pages.push(page);
				});

				return {
					pages: pages
				};
			});
		}
	};
}])

.controller('FormController', ['$scope', '$rootScope', function($scope, $rootScope) {
	'use strict';
	this.init = function(element, controllers) {
		this.controllers = controllers;
		this.element = element;	

		this.activatePage($scope.form.pages[0]);			
	};	

	_.extend(this, {
		// look up a field by name ( needs to traverse the page -> section -> field structure so might be slow with large forms!!! )
		// if this gets slow, could cache all the fields in a flattened array of fields and use that to search
		// or we could put the page name / section name in the criteria when it comes over from the server (this is probably best case)
		findFieldByName: function(name) {
			var needle = null;
			_.each($scope.form.pages, function(page) { 
				_.each(page.sections, function(section) {
					var tempneedle = _.findWhere(section.elements, {name: name});
					if(tempneedle) {
						needle = tempneedle; // keep from overwriting w/ null if not found
					}
				});
			});

			return needle;
		},
		digestChange: function(field) {
			
			// right now this is just a marshaller

			// this function can do any filtering necessary etc and act as a Marshal for changes in fields. Throttling etc could happen here too.
			$scope.$broadcast('dependency-detected', field);
		},
		activatePage: function(page) {
			_.findWhere($scope.form.pages, page).activate();
		}

	});

	$rootScope.$on('activate-page', function(event, page) {
		console.log('activated');
	});

}])

.directive('smbForm', [function() {
	'use strict';
	return {
		templateUrl: 'views/form.html',
		scope: {
			form: '=form'
		},
		require: ['smbForm'],
		controller: 'FormController',
		link: function(scope, element, attrs, controllers) {
			controllers[0].init(element, controllers);
			return this;
		}
	};
}]);

