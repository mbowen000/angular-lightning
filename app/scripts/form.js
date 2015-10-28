angular.module('testapp.form', ['testapp.field', 'testapp.page'])

.factory('Form', ['Page', function(Page) {
	'use strict';
	return function(options) {
		_.extend(this, options, {
			initialize: function() {
				if(this.pages) {
					var pages = [];
					_.each(this.pages, function(page) {
						pages.push(new Page(page));
					});
					this.pages = pages;
				}
			},
			toJSON: function() {
				return _.extend(_.pick(this, ['name', 'objId']), {
					pages: _.map(this.pages, function(page) {
						return page.toJSON();
					})
				});
			}
		});

		this.initialize();
	};
}])

.service('FormService', ['$q', 'Form', function($q, Form) {
	'use strict';
	return {
		getFormConfig: function(id) {
			// return $http.get('assets/mockresponse-spconfig.json').then(function(response) {
			// 	//self.parseModels(response.data.pages);

			// 	var pages = [];
				
			// 	_.each(response.data.pages, function(page) {
			// 		var page = new Page(page);
			// 		pages.push(page);
			// 	});

			// 	return {
			// 		pages: pages
			// 	};
			// });
			
			return $q(function(resolve, reject) {
				Visualforce.remoting.Manager.invokeAction('PageRemoter.getFormConfig', id, function(result, event) {
					if(event.status) {
						resolve(new Form(result));
					}
					else {
						reject(event.message);
					}
				});
			});

		},
		saveFormConfig: function(config) {
			return $q(function(resolve, reject) {

				// in the future we're going to want to save more than the fields - e.g. the states for workflow etc.
				// but for now we just need to pluck all the fields to get their name / value pairs off
				Visualforce.remoting.Manager.invokeAction('PageRemoter.saveFormConfig', JSON.stringify(config.toJSON()), function(status, result) {
					if(result) {
						resolve(result);
					}
					else {
						reject(status);
					}
				});
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

