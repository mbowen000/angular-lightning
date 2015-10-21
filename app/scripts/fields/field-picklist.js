angular.module('testapp.fieldPicklist', [])

.directive('smbFieldPicklist', [function() {
	'use strict';
	return {
		templateUrl: 'views/field-picklist.html',
		require: ['^smbField']
	};
}]);