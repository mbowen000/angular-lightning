angular.module('pointofsale.opportunity', [])
	.factory("OpportunityService", ['Opportunity', '$q', 'force', 'PricebookService', 'appconfig', function(Opportunity, $q, force, PricebookService, appconfig) {
		
		var opportunity = {};			

		return {
			findOrCreateDeferred: $q.defer(),
			findOrCreateOpportunity: function(accountid, opportunityid) {
				var self = this;
				// if its cached ..return a mock deferred
				if(opportunity.Id) {
					this.findOrCreateDeferred.resolve(opportunity);
					return this.findOrCreateDeferred.promise;
				}
				if(opportunityid) {
					opportunity = new Opportunity({Id: opportunityid});
					return opportunity.fetch().then(function(opportunity) {
						self.findOrCreateDeferred.resolve(opportunity);
						return self.findOrCreateDeferred.promise;
					});
				}
				else {

					// we have a new opportunity - so we need to get the default pricebook and set it
					return PricebookService.getPricebook(appconfig.defaultPricebookName).then(function(pricebook) {
						opportunity = new Opportunity({ 'AccountId': accountid, Pricebook2Id: pricebook.Id });
						return opportunity.save();
					});
					
				}
			},
			addOpportunityProduct: function(op) {
				return op.save().then(function(savedOp) {
					opportunity.olis.push(savedOp);
					return savedOp;
				});
			},
			addWrapperToOpp: function(wrapper) {
				opportunity.wrappers.push(wrapper);
			},
			findOliByProductId: function(productId) {
				return _.find(opportunity.olis, function(oli) {
					return oli.Product2.Id === productId;
				});
			}
		};
	}])
	.factory("Opportunity", ['$q', 'force', 'OpportunityProductWrapper', 'posservice' , function($q, force, OpportunityProductWrapper, posservice) {
		return function(options) {
			angular.extend(this, {
				// defaults
				Name: 'POSOpportunity',
				StageName: 'Proposal/Price Quote',
				CloseDate: new Date(),
				olis: [],
				wrappers:[]
			}, options, {
				fetch: function() {
					var self = this;
					return force.retrieve("Opportunity", this.Id).then(function(opportunity) {
						angular.extend(self, opportunity);

						return force.query("SELECT Id, Name, Product2.Id, Product2.Name, TotalPrice, ListPrice, UnitPrice, Discount FROM OpportunityLineItem WHERE OpportunityId = '"+ self.Id + "'").then(function(response) {
							self.olis.splice(0, self.olis.length);
							//olis = response.records;
							angular.forEach(response.records, function(oli) {
								self.olis.push(oli);
							});
						}).then(function() {
							// this could probably be done in one function above if we replace the 'retrieve' w/ an soql query
							return force.query("SELECT ProductWrapper__r.Id, ProductWrapper__r.Name, Id FROM OpportunityProductWrapper__c WHERE Opportunity__c = '" + self.Id + "'").then(function(response) {
								self.wrappers.splice(0, self.wrappers.length);
								angular.forEach(response.records, function(opportunityProductWrapper) {
									var opw = new OpportunityProductWrapper(opportunityProductWrapper);
									if(opw.ProductWrapper__r) {
										opw.productWrapper = posservice.findProductWrapperById(opw.ProductWrapper__r.Id); // find and set this so we have it on init
									}
									self.wrappers.push(opw);
								});
								return self;
							});
						});

						
					}, function(error) {
						console.error(error);
					});
				},
				save: function() {
					var self = this;
					return force.create('Opportunity', _.omit(self, ['olis', 'wrappers'])).then(function(response) {
						angular.extend(self, {
							Id: response.id
						});
						return self;
					}, function(error) {
						reject(error);
					});
				},
				getOliByProductId: function(id) {
					return _.find(this.olis, function(oli) {
						return oli.Product2.Id === id;
					});
				}, 
				removeWrapper: function(wrapper) {
					var self = this;
					var pos = _.findIndex(self.wrappers, wrapper);
					if(pos !== -1) {
						self.wrappers.splice(pos, 1);
					}
				},
				getStateTax: function() { 
					var total = 0;
					_.each(this.olis, function(oli) {
						if(oli.Product2.Name === 'Misc:Sales Tax' && oli.TotalPrice > 0) {
							return total += oli.TotalPrice;
						}
					});
					return total;

				},
				getCountyTax: function() { 
					var total = 0;
					_.each(this.olis, function(oli) {
						if(oli.Product2.Name === 'Misc:County Tax' && oli.TotalPrice > 0) {
							return total += oli.TotalPrice;
						}
					});
					return total;
				},
				getOrderTotal: function() {
					var total = 0;
					_.each(this.olis, function(oli) {
						return total += oli.TotalPrice;
					});
					return total;
				}
			});
		};
	}])

	.factory('OpportunityProduct', ['force', function(force) {
		return function(options) {
			angular.extend(this, options, {
				save: function() {
					var self = this;
					return force.create('OpportunityLineItem', _.omit(self, ['Product2'])).then(function(oli) {
						_.extend(self, {Id: oli.id });
						return self;
					});
				}
			});
		};
	}]);