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
			value: 'option 1;option 2'
		};

		// shoudl set up the markup for the control
		var markup = '<div class="slds-form-element__control" li-picklist options="picklistfield.picklistvals" ng-model="picklistfield.value"></div>';

		field = $compile(markup)($scope);

		$scope.$digest();
	});

	it('is initialized with the right options', function() {
		// we have 2 of the 3 values selected, options should now be size 1
		expect(field.find('ul').eq(0).find('li').length).toBe(1);
	});

	it('is initialized with any previously selected values from the server', function() {
		expect(field.find('ul').eq(1).find('li').length).toBe(2);
	});

	it('toggles the state of a value as highlighted when clicked', function() {
		var option = field.find('ul').eq(0).find('li').eq(0);
		expect(angular.element(option).scope().option.selected).toBe(false);
		
		// click it
		option.triggerHandler('click');
		expect(angular.element(option).scope().option.selected).toBe(true);

		// click it again, make sure its not selected
		option.triggerHandler('click');
		expect(angular.element(option).scope().option.selected).toBe(false);
	});

	it('moves an option to the selected list when the right arrow is pressed after selecting a value', function() {
		
		// get the first element
		var option = field.find('ul').eq(0).find('li').eq(0);

		// click it
		option.triggerHandler('click');
		
		// move it
		var button = field.find('button').eq(0).triggerHandler('click');

		// make sure the list length is now 3 on the right and 0 on the left
		expect(field.find('ul').eq(0).find('li').length).toBe(0);
		expect(field.find('ul').eq(1).find('li').length).toBe(3);
	});

	it('moves multiple values to the right when multiple values are selected', function() {

			//Moved one selected from right to left
			var selected = field.find('ul').eq(1).find('li').eq(0);
			selected.triggerHandler('click');
			var moveLeftButton = field.find('button').eq(1).triggerHandler('click');

			//We should have 2 in left and 1 in right
			expect(field.find('ul').eq(0).find('li').length).toBe(2);
			expect(field.find('ul').eq(1).find('li').length).toBe(1);

			//Select the two in the left
			var option1 = field.find('ul').eq(0).find('li').eq(0);
			var option2 = field.find('ul').eq(0).find('li').eq(1);

			option1.triggerHandler('click');
			option2.triggerHandler('click');

			//move them right
			var moveRightButton = field.find('button').eq(0).triggerHandler('click');
			
			expect(field.find('ul').eq(0).find('li').length).toBe(0);
			expect(field.find('ul').eq(1).find('li').length).toBe(3);
	});

	it('removes the option from the available list when an option is selected after selecting a value', function() {


			//Moved option 1 from right to left
			var selected = field.find('ul').eq(1).find('li').eq(0);
			selected.triggerHandler('click');
			var moveLeftButton = field.find('button').eq(1).triggerHandler('click');

			//confrim option 1 is in option list
			var option1 = field.find('ul').eq(0).find('li').eq(1);
			expect(option1.text().trim()).toBe('option 1');	

			//move it back to previous list
			option1.triggerHandler('click');
			var moveRightButton = field.find('button').eq(0).triggerHandler('click');

			//only option 3 should be in option list
			expect(field.find('ul').eq(0).find('li').length).toBe(1);
			expect(field.find('ul').eq(0).find('li').eq(0).text().trim()).toBe('option 3');
	
	});

	it('does not move any values if the arrows are pressed and a value is not selected', function() {

			var moveLeftButton = field.find('button').eq(1).triggerHandler('click');

			expect(field.find('ul').eq(0).find('li').length).toBe(1);
			expect(field.find('ul').eq(1).find('li').length).toBe(2);

			var moveRightButton = field.find('button').eq(0).triggerHandler('click');

			expect(field.find('ul').eq(0).find('li').length).toBe(1);
			expect(field.find('ul').eq(1).find('li').length).toBe(2);
	});

//this description is wrong. Values are updated when the button is clicked not when they are selected...
	it('changes the ng-model to be the selected values (semi-colon delimited) when fields are selected', function() {
		// make sure we're looking at the scope variable we set up in our test

		var option = field.find('ul').eq(0).find('li').eq(0);
		// click it
		option.triggerHandler('click');
		// move it
		var button = field.find('button').eq(0).triggerHandler('click');

		console.log($scope.picklistfield.value);

		expect($scope.picklistfield.value).toBe('option 1;option 2;option 3');
	});

	it('changes the ng-model to be the right values when fields are deselected', function() {

		var option = field.find('ul').eq(1).find('li').eq(0);
		// click it
		option.triggerHandler('click');
		// move it
		var moveLeftButton = field.find('button').eq(1).triggerHandler('click');

		console.log($scope.picklistfield.value);

		expect($scope.picklistfield.value).toBe('option 2');

	});


						/**  DOES NOT MAKE SENSE BECAUSE SUCH BUTTONS DO NOT EXIST */
	// it('allows me to re-order the options when the up and down buttons are selected on the selected list', function() {

	// });
});
