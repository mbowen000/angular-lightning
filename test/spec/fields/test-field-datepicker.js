'use strict';

describe('Date Directive...', function() {

	var $scope, $rootScope, $compile, field, $controller, $document, DateConfig;

	beforeEach(module('templates', 'angular-lightning.datepicker'));

	beforeEach(inject(function(_$rootScope_, _$compile_, _$controller_, _$document_, _DateConfig_) {
		$rootScope = _$rootScope_;
		$scope = _$rootScope_.$new();
		$compile = _$compile_;
		$controller = _$controller_;
		$document = _$document_;
		DateConfig = _DateConfig_;
	}));

	// function getDays() {
	// 	var tr = element.find
	// }

	beforeEach(function() {
		
        $scope.datefield =  {
        	value: '12/01/2015'
        };

        var markup = '<div><input class="slds-input" type="text" placeholder="Pick a Date" label="Date Picker Label" ng-model=\'datefield.value\' ng-required=\'datefield.required\' li-datepicker /></div>';

        field = $compile(markup)($scope);

        // dateDropdownController = $controller('DateDropdownController', {$scope: $rootScope, $element: field});

        // dateDropdownController.init();

        $scope.$digest();

	});

	it('is created on the DOM w/ proper date field markup', function() { 
		//expect(angular.element(field).length).toBe(1);
		expect(field.find('input').length).toBe(1);
	});


	it('sets the model value when its input changes', function() {
		
		// focus in the text area to get the dropdown to show
		field.find('input').triggerHandler('focus');
		$scope.$apply();

		field.find('table').find('tbody').find('td').eq(3).triggerHandler('click');
		$scope.$apply();
		expect(moment.isMoment($scope.datefield.value)).toBe(true);
		expect($scope.datefield.value.format('L')).toBe('12/02/2015');

		field.find('table').find('tbody').find('td').eq(4).triggerHandler('click');
		$scope.$apply();
		expect($scope.datefield.value.format('L')).toBe('12/03/2015');

	});

	it('has a Date model set when it is initialized (even if it doesnt have a value)', function() {

		var now = moment();

		$scope.datefield = {
			value: null
		};
		$scope.$digest();

		expect(moment.isMoment(angular.element(field).find('input').scope().month.currentDate)).toBe(true);

		// the month that is inited by default should be the current month
		expect(now.isSame(angular.element(field).find('input').scope().month.currentDate, 'month')).toBe(true);

	});

	it('contains no value in its input field if its initialized without a value', function() {
		$scope.datefield = {
			value: null
		};
		$scope.$digest();

		expect(angular.element(field).find('input').value).toBeUndefined();
	});

	it('clicking the date field opens the date picker on focus', function() {
		field.find('input').triggerHandler('focus');
		$scope.$digest();

		// expect the root scope to show
		//expect($rootScope.isOpen).toBe(true);
		expect(field.find('table').length).toBe(1); 

		// if we click it again it should remain open
		field.find('input').triggerHandler('click');
		$scope.$apply();
		
		//expect($rootScope.isOpen).toBe(true);
		expect(field.find('table').length).toBe(1);  // test that the datepicker is built up on the DOM (should create a table);


		// click anywhere else in the document to make sure we're not going to show anymore
		$document.triggerHandler('click');
		$scope.$apply();
		//expect($rootScope.isOpen).toBe(false);

	});

	it('the date picker should have the correct amount of weeks & days', function() {
		
		field.find('input').triggerHandler('focus');
		$scope.$apply();
		// expec thte table to be there
		expect(field.find('table').length).toBe(1);
		// expect 5 weeks
		expect(field.find('table').find('tbody').find('tr').length).toBe(5);
		// expect 5 x 7 days (35)
		expect(field.find('table').find('tbody').find('td').length).toEqual(35);

	});

	it('the current day should be highlighted', function() {
		field.find('input').triggerHandler('focus');
		$scope.$apply();

		// the 1st of december 2015 should be the 3rd element (2nd index) - check that it has the right class
		expect(field.find('table').find('tbody').find('td').eq(2).hasClass('slds-is-selected')).toEqual(true);

		// click a different day, say.. the next one?
		field.find('table').find('tbody').find('td').eq(3).triggerHandler('click');
		$scope.$apply();

		expect(field.find('table').find('tbody').find('td').eq(2).hasClass('slds-is-selected')).toEqual(false);
		expect(field.find('table').find('tbody').find('td').eq(3).hasClass('slds-is-selected')).toEqual(true);

		// expect that there is always one "selected" date

	});

	it('the day should change when clicked and be highlighted', function() {
		field.find('input').triggerHandler('focus');
		$scope.$apply();

		// click a different day, say.. the next one?
		field.find('table').find('tbody').find('td').eq(3).triggerHandler('click');
		$scope.$apply();

		expect(field.find('table').find('tbody').find('td').eq(2).hasClass('slds-is-selected')).toEqual(false);
		expect(field.find('table').find('tbody').find('td').eq(3).hasClass('slds-is-selected')).toEqual(true);

		// expect that there is always one "selected" date
		expect(field.find('table').find('tbody').find('td.slds-is-selected').length).toEqual(1);
	});

	// it('the date picker changes to the next / prev month when clicking next / previous', function() {
	// 	field.find('input').triggerHandler('focus');
	// 	$rootScope.$apply();
	// });

});