angular.module('testapp.fieldText', [])

.directive('smbFieldText', [function() {
	'use strict';
	return {
		templateUrl: 'views/fields/field-text.html',
		require: ['^smbField']
	};
}]);