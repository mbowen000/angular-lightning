'use strict';

describe('A Text Field...', function() {

	var data, $rootScope, $compile, field;

	beforeEach(module('templates', 'testapp.field', 'testapp.fieldText'));

	beforeEach(inject(function(_$rootScope_, _$compile_) {
		$rootScope = _$rootScope_;
		$compile = _$compile_;
	}));

	beforeEach(function() {

        $rootScope.field = {
        	value: ""
        };

        var markup = '<input class="slds-input" type="text" placeholder="" ng-model="field.value" name="{{field.name}}" ng-required="field.required" />';

        field = $compile(markup)($rootScope);

        $rootScope.$digest();

	});

	it('is created on the DOM', function() { 

		expect(angular.element(field)[0].querySelector('input')).toBeDefined();
		expect(angular.element(field)[0].querySelector('input[type="text"]')).toBeDefined();
		expect(angular.element(field)[0].querySelector('select')).toEqual(null); // just make sure we dont have any other types of elements being rendered..

	});

	it('sets the model value when its input changes', function() {
		
		var input = angular.element(field);

		// actually change the value of the field (be sure to fire the "input" event which ng-model watches for...)
		input.val('test value').triggerHandler('input');

		$rootScope.$apply();

		expect($rootScope.field.value).toEqual('test value');

	});


});