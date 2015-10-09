'use strict';

describe('A Field...', function() {

	var $compile, $rootScope, $httpBackend, data;

	beforeEach(module('templates','testapp.field'));

	beforeEach(inject(function(_$compile_, _$rootScope_, $injector) {
		$compile = _$compile_;
		$rootScope = _$rootScope_;
		$httpBackend = $injector.get('$httpBackend');

		// mock out the http get call for the form config - this wlil have to change when we get the real stuff
	   	data = {
		    "pages": [
		        {
		            "name": "Finance And Operations",
		            "state": {
		                "status": "pending",
		                "approvals": [
		                    {
		                        "actor": {
		                            "Id": "003flkj109308f",
		                            "Name": "Mike Bowen"
		                        },
		                        "status": "pending"
		                    },
		                    {
		                        "actor": {
		                            "Id": "003flkdjfl3093",
		                            "Name": "Max Stein"
		                        },
		                        "status": "approved"
		                    }
		                ]
		            },
		            "sections": [
		                {
		                    "name": "Deal Terms",
		                    "fields": [
		                        {
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
		                        },
		                        {
		                            "name": "Reason_For_MOA__c",
		                            "type": "picklist",
		                            "multival": false,
		                            "required": true,
		                            "label": "Reason for MOA",
		                            "picklistvals": [
		                                "Existing Operations",
		                                "New Client/Renewal"
		                            ],
		                            "value": "",
		                            "tooltip": "",
		                            "dependency": {},
		                            "visible": true
		                        },
		                        {
		                            "name": "Contract_Start_Date__c",
		                            "type": "date",
		                            "multival": false,
		                            "required": true,
		                            "label": "Contract Start Date",
		                            "value": "2016-10-22",
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
		                        }, 
		                        {
		                            "name": "Base_Fee__c",
		                            "type": "text",
		                            "multival": false,
		                            "required": true,
		                            "label": "Base Fee",
		                            "value": "",
		                            "tooltip": "",
		                            "dependency": {}
		                        }
		                    ]
		                }
		            ]
		        }
		    ]
		};

	}));
	
	var form = null;

	beforeEach(function() {
			
			$rootScope.form = data;

			form = $compile("<div smb-form form='form'></div>")($rootScope);

			$rootScope.$digest();	

	});

	it('should contain form elements for each of the elemnts in the data source', function() {

		// check that there are 4 smb-field elements rendered on the page (this includes hidden fields);
		expect(angular.element(form)[0].querySelectorAll('div[smb-field]').length).toEqual(4);

	});

	it('should not render fields that are not specified as visible', function() {

		// but since one is hidden we need to check for only 3 'rendered' fields
		expect(angular.element(form)[0].querySelectorAll('.fieldwrapper').length).toEqual(3);

	});


});