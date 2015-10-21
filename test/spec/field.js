'use strict';

var mockField = {
    "name": "Contract_Start_Date__c",
    "type": "date",
    "multival": false,
    "required": true,
    "label": "Contract Start Date",
    "value": "2020-10-22",
    "tooltip": "",
    "dependency": {
        "type": "1 OR 2",
        "criteria": [
            {
                "field": "Base_Fee__c",
                "operator": "equals",
                "condition": "test"
            },
            {
                "field": "Base_Fee__c",
                "operator": "equals",
                "condition": "test2"
            }
        ],
        "invoke": "show"
    },
    "visible": false
};

describe('A Field Directive...', function() {

	var data, $rootScope, $compile, field;

	beforeEach(module('templates','testapp.form','testapp.field'));

	beforeEach(inject(function(_$rootScope_, _$compile_) {
		$rootScope = _$rootScope_;
		$compile = _$compile_;
	}));
	

	beforeEach(function() {
		data = {
            "name": "Deal_Type__c",
            "type": "picklist",
            "multival": true,
            "required": true,
            "label": "Deal Type",
            "picklistvals": [
                "Consulting",
                "Lease",
                "NewPricingModel",
                "ReverseManagement",
                "TraditionalManagement"
            ],
            "value": "Consulting;Lease",
            "tooltip": "",
            "dependency": {}
        };

        $rootScope.field = data;

        var markup = '<div ng-form="testform"><div class="slds-form-element" smb-field field="field"></div></div>';

        field = $compile(markup)($rootScope);

        $rootScope.$digest();

	});


	it('has a label', function() {
		expect(angular.element(field)[0].querySelectorAll('label').length).toEqual(1);
	});

    it('has a required attribute if the field is required', function() {
        
    });

});

describe('Form Controller', function() {

    var scope, ctrl, formCtrl;

    beforeEach(module('templates','testapp.form','testapp.field'));

    beforeEach(inject(function($controller, $rootScope) {
        scope = $rootScope;    
        ctrl = $controller('FieldController', {$scope: scope, $element: null});
        formCtrl = $controller('FormController', {$scope:scope, $element: null});
    }));

    it('calls emitChange when change is detected', function() {

        scope.field = mockField;

        var controllers = [];
        controllers.push(ctrl);
        controllers.push(formCtrl);

        ctrl.init(null, controllers);

        // expec tthe initial value
        expect(scope.field.value).toEqual('2020-10-22');

        spyOn(ctrl, 'emitChange');

        // change the value
        scope.field.value = 'hi world';
        scope.$apply();

        // assert the emitChannge function is called..
        expect(ctrl.emitChange).toHaveBeenCalledWith(scope.field);


    });

}); 