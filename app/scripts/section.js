angular.module('testapp.section', ['testapp.core'])

.factory('SectionCollection', ['Collection', 'SectionModel', function(Collection, SectionModel) {
	'use strict';
	return Collection.extend({
		model: SectionModel
	});
}])

.factory('SectionModel', ['Model', function(Model) {
	'use strict';
	return Model.extend({
		//
	});
}]);