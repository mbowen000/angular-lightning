angular.module('testapp.fieldDropdown', [])

.directive('smbFieldDropdown', [function() {
	'use strict';
	return {
		templateUrl: 'views/fields/field-dropdown.html',
		require: ['^smbField']
	};
}]);