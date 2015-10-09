angular.module('testapp.section', ['testapp.core', 'testapp.field'])

.factory('SectionCollection', ['Collection', 'SectionModel', function(Collection, SectionModel) {
	'use strict';
	return Collection.extend({
		model: SectionModel
	});
}])

.factory('SectionModel', ['Model', 'FieldCollection', function(Model, FieldCollection) {
	'use strict';
	return Model.extend({
		initialize: function() {
			console.log(this);
			if(this.attributes.fields) {
				var fieldCollection = new FieldCollection(this.attributes.fields);
				this.attributes.fields = fieldCollection;
			}
		}
	});
}]);