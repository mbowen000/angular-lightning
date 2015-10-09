# Requirements for Backend

## retrievePage()
> Responsible for retrieving a page and sending it in response as JSON

#### Description

- Needs to get a page, its sections, and all the fields in each section
- Should also get any state information about locking. If pages, sections or fields are locked.
- Should also get workflow information including owners

#### Example Response

```json
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
                    "value": "2016-10-22",
                    "tooltip": "",
                    "dependency": {}
                }
            ]
        }
    ]
}
```

## savePage()

> Save a page and all its relevant elements.

#### Description

- Should take a page json object and serialize it into a PageWrapper object w/ all required keys.

#### Example Response

200 OK