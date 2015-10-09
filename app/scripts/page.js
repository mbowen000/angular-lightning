angular.module('testapp.page', [
	'testapp.core',
	'testapp.section'
])

.constant('FormConfigConfig', {
	objectName: ''
})

.factory('PageModel', ['Model', 'SectionCollection', '$q', '$rootScope', function(Model, SectionCollection, $q, $rootScope) {
	'use strict';

	var PageModel = Model.extend({
		initialize: function() {
			if(this.attributes.sections) {
				// create a new collection for the sections
				//var sectionCollection = new SectionCollection(this.attributes.sections);
				//this.attributes.sections = sectionCollection;
			}
		},
		fetch: function() {
			var self = this;
			return $q(function(resolve, reject) {
				Visualforce.remoting.Manager.invokeAction('PageRemoter.getPage', self.get('name'), function(response) {
					self.attributes = response;
					self.initialize();
					resolve(response);
					$rootScope.$safeApply();
				});
			});
		}
	});

	return PageModel;
}])

.factory('PageCollection', ['Collection', 'PageModel', '$q', '$http', '$rootScope', function(Collection, PageModel, $q, $http, $rootScope) {
	'use strict';

	return Collection.extend({
		model: PageModel,

		fetch: function() {
			var self = this;
			return $http.get('assets/mockresponse-spconfig.json').then(function(response) {
				self.parseModels(response.data.pages);
				return self;
			});
			// return $q(function(resolve, reject) {
			// 	Visualforce.remoting.Manager.invokeAction('PageRemoter.getPages', function(response) {
			// 		self.parseModels(response);
			// 		resolve(self);
			// 		$rootScope.$safeApply();
			// 	});
			// });
		}
	});
}])

.service('PageService', ['PageCollection', function(PageCollection) {
	'use strict';

	var pageCollection = new PageCollection();

	return {
		getPages: function() {
			return pageCollection.fetch();
		}
	};
}]);