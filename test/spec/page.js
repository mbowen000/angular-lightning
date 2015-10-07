'use strict';

describe('The Page Service...: ', function() {

  var PageService, $rootScope, $httpBackend, mockFormCall;

  beforeEach(module('testapp.page', 'testapp.core', 'forceng'));

  beforeEach(inject(function(_PageService_, $injector) {
    PageService = _PageService_;
    $rootScope = $injector.get('$rootScope');
    $httpBackend = $injector.get('$httpBackend');

    // mock out the http get call for the form config - this wlil have to change when we get the real stuff
    mockFormCall = $httpBackend.when('GET', 'assets/mockresponse-spconfig.json')
      .respond({
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
                                "dependency": {
                                    "type": "1AND2",
                                    "criteria": [
                                        {
                                            "field": "Base_Fee__c",
                                            "condition": true
                                        },
                                        {
                                            "field": "Base_Fee__c",
                                            "condition": ">500.00"
                                        }
                                    ]
                                }
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
                                "dependency": {}
                            },
                            {
                                "name": "Contract_Start_Date__c",
                                "type": "date",
                                "multival": false,
                                "required": true,
                                "label": "Contract Start Date",
                                "value": "109290380430",
                                "tooltip": "",
                                "dependency": {}
                            }
                        ]
                    }
                ]
            }
        ]
    });
  }));

  it('fetches a page collection when getPages() is called', function() {

    PageService.getPages().then(function(response) {
      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
    });

    $httpBackend.flush();
    $rootScope.$digest();

  });
  
});

describe('the PageCollection', function() {

  var PageCollection, PageModel;

  beforeEach(module('testapp.page', 'forceng'));

  beforeEach(inject(function($injector) {
    PageCollection = $injector.get('PageCollection');
    PageModel = $injector.get('PageModel');
  }));

  it('has a PageModel as its prototypes model', function() {
    
    var pageCollection = new PageCollection();
    
    // create an instance of hte collection's model to verify on
    var testModel = new pageCollection.model();
    
    // can check w/ instanceof
    expect(testModel instanceof PageModel).toBe(true);
  });

});