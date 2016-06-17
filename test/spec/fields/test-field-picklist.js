'use strict';

describe('Picklist Directive...', function() {

	var $scope, $rootScope, $compile, field, $controller, $document, PicklistService;

	beforeEach(module('templates', 'angular-lightning.picklist'));

	beforeEach(inject(function(_$rootScope_, _$compile_, _$controller_, _$document_, _PicklistService_) {
		$rootScope = _$rootScope_;
		$scope = _$rootScope_.$new();
		$compile = _$compile_;
		$controller = _$controller_;
		$document = _$document_;
		PicklistService = _PicklistService_;
	}));

	// common functions here (resuable)

	// this is executed before each "it" below
	beforeEach(function() {

		$scope.picklistfield = {
			picklistvals: [
				'option 1', 'option 2', 'option 3'
			],
			value: PicklistService.getArrayFromDelimted('option 2;option 3')
		};

		// shoudl set up the markup for the control
		var markup = '<div class="slds-form-element__control" li-picklist options="picklistfield.picklistvals" ng-model="picklistfield.value"></div>';

		field = $compile(markup)($scope);

		$scope.$digest();
	});

	it('is initialized with the right options', function() {
		// if scope.option is mike; ashar then the available options li length should be 2
		expect(field.find('ul').find('li').length).toBe(3);
	});

	it('is initialized with any previously selected values from the server', function() {
		// if whatever scope variable that is bound to the ng-model has a couple selected options, make sure that the 

	});

	it('moves an option to the selected list when the right arrow is pressed after selecting a value', function() {

	});

	it('removes the option from the available list when an option is selected after selecting a value', function() {

	});

	it('does not move any values if the arrows are pressed and a value is not selected', function() {

	});

	it('changes the ng-model to be the selected values (semi-colon delimited) when fields are selected', function() {
		// make sure we're looking at the scope variable we set up in our test
	});

	it('changes the ng-model to be the right values when fields are deselected', function() {

	});

	it('allows me to re-order the options when the up and down buttons are selected on the selected list', function() {

	});

});