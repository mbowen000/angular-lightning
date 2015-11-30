angular.module('angular-lightning-demo', ['angular-lightning', 'angular-lightning-demo.modal'])

.controller("DemoController", ['PicklistService', function(PicklistService) {
	'use strict';
	return _.extend(this, {
		datefield: null,
		textfield: "test value",
		picklistfield: {
			picklistvals: [
				'option 1', 'option 2', 'option 3'
			],
			value: PicklistService.getArrayFromDelimted('option 2;option 3')
		}
	});
}]);