angular.module('testapp.page', [
	'testapp.core',
	'testapp.section'
])

.constant('FormConfigConfig', {
	objectName: ''
})

.factory('PageModel', ['Model', 'SectionCollection', function(Model, SectionCollection) {
	'use strict';

	var PageModel = Model.extend({
		initialize: function() {
			console.log(this.attributes);
			if(this.attributes.sections) {
				// create a new collection for the sections
				var sectionCollection = new SectionCollection(this.attributes.sections);
				this.attributes.sections = sectionCollection;
			}
		}
	});

	return PageModel;
}])

.factory('PageCollection', ['Collection', 'PageModel', '$q', '$http', function(Collection, PageModel, $q, $http) {
	'use strict';

	return Collection.extend({
		model: PageModel,

		fetch: function() {
			var self = this;
			return $http.get('assets/mockresponse-spconfig.json').then(function(response) {
				self.parseModels(response.data.pages);
				return self.models;
			});
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