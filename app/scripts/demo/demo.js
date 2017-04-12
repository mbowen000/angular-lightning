angular.module('angular-lightning-demo', ['angular-lightning', 'angular-lightning-demo.modal'])

.controller("DemoController", ['PicklistService', '$http', 'limitToFilter', '$anchorScroll', function(PicklistService, $http, limitToFilter, $anchorScroll) {
	'use strict';
	return _.extend(this, {
		datefield: '1986-12-27',
		datetimefield: '2012-10-11 12:27',
		textfield: "test value",
		richtext: "<div><strong>Bold!</strong><br><em>Italics!</em></div>",
		picklistfield: {
			picklistvals: [
				'option 1', 'option 2', 'option 3'
			],
			value: 'option 2;option 3'
		},
		lookupTest: function(val) {
			return $http.get('//maps.googleapis.com/maps/api/geocode/json', {
		      params: {
		        address: val,
		        sensor: false
		      }
		    }).then(function(response){
		      return limitToFilter(response.data.results, 15);
		    });
		},
		sendInform: function(val, type) {
			if (!val) {
				val = 'Demo';
			}

			if (type === 'danger') {
				inform.add(val, {type: 'danger'});
			}
			else {
				inform.add(val);
			}
		},
		scrollTo: function(anchor) {
			$anchorScroll(anchor);
		},
		progressValue: 50
	});
}]);
