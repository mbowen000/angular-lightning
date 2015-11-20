'use strict';

describe('Date Directive...', function() {

	var $rootScope, $compile, field, $controller, $document, DateConfig;

	beforeEach(module('templates', 'angular-lightning.datepicker'));

	beforeEach(inject(function(_$rootScope_, _$compile_, _$controller_, _$document_, _DateConfig_) {
		$rootScope = _$rootScope_;
		$compile = _$compile_;
		$controller = _$controller_;
		$document = _$document_;
		DateConfig = _DateConfig_;
	}));

	beforeEach(function() {
		
        $rootScope.field =  {
        	value: '2014-12-02'
        };

        var markup = '<div><div id="otherelement"></div><input id="date" class="slds-input" type="text" placeholder="Pick a Date" label="Date Picker Label" ng-model="field.value" ng-required="field.required" smb-field-date-input ng-focus="isOpen = true"/></div>';

        field = $compile(markup)($rootScope);

        // dateDropdownController = $controller('DateDropdownController', {$scope: $rootScope, $element: field});

        // dateDropdownController.init();

        $rootScope.$digest();

	});

	it('is created on the DOM w/ proper date field markup', function() { 
		expect(angular.element(field)[0]).toBeDefined();
		expect(angular.element(field).find('input')).toBeDefined();
	});


	it('sets the model value when its input changes', function() {
		
		// focus in the text area to get the dropdown to show
		field.find('input').triggerHandler('focus');
		$rootScope.$apply();

		spyOn($rootScope, 'selectDay').and.callThrough();
		var dayElement = field.find('table').find('.datepicker-day').eq(0);
		dayElement.triggerHandler('click');
		$rootScope.$apply();

		expect($rootScope.selectDay).toHaveBeenCalled();

		// the clicked element's date should become the new current date.
		expect(angular.element(dayElement).scope().day.moment).toEqual($rootScope.getCurrentDate());

	});

	it('has a Date model set when it is initialized (even if it doesnt have a value)', function() {
		expect($rootScope.getCurrentDate().toDate()).toBeDefined();
	});

	it('clicking the date field opens the date picker on focus', function() {
		field.find('input').triggerHandler('focus');
		$rootScope.$apply();

		// expect the root scope to show
		expect($rootScope.isOpen).toBe(true);

		// if we click it again it should remain open
		field.find('input').triggerHandler('click');
		$rootScope.$apply();
		expect($rootScope.isOpen).toBe(true);
		expect(field.find('table')).toBeDefined(); // test that the datepicker is built up on the DOM (should create a table);


		// click anywhere else in the document to make sure we're not going to show anymore
		$document.triggerHandler('click');
		$rootScope.$apply();
		expect($rootScope.isOpen).toBe(false);

	});

	it('the date picker should have the correct amount of weeks & days', function() {
		
		expect($rootScope.month).toBeDefined();
		expect($rootScope.month.weeks.length).toEqual(DateConfig.numWeeksShown);
		expect($rootScope.month.weeks[0].days.length).toEqual(7);
		
	});

	it('the date picker changes to the next / prev month when clicking next / previous', function() {
		field.find('input').triggerHandler('focus');
		$rootScope.$apply();
	});

});