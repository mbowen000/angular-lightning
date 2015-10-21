angular.module('testapp.fieldTextarea', [])

.directive('smbFieldTextarea', [function() {
	'use strict';
	return {
		templateUrl: 'views/fields/field-textarea.html',
		require: ['^smbField']
	};
}]);