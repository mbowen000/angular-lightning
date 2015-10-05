// purchase.js
// hi sal!
// this is ghetto instant messaging
// as long as
// the app
angular.module('pointofsale.purchase', [])
	
	.factory('PurchaseService', ['Purchase', '$q', '$rootScope', function(Purchase, $q, $rootScope) {

		var purchase = {};
		var findOrCreateDeferred = null;

		return { 
			findOrCreatePurchase: function(accountid, purchaseid) { 
				var self = this;
				// if its cached ..return the deferred
				if(findOrCreateDeferred) {
					return findOrCreateDeferred;
				}
				else if(purchaseid) {
					purchase = new Purchase({Id: purchaseid});
					findOrCreateDeferred = purchase.fetch();
					findOrCreateDeferred.then(function() {
						$rootScope.$emit('purchase-retrieved', purchase);
					});
					return findOrCreateDeferred;
				}
				else if(accountid) {
					// we have a new purchase 
					purchase = new Purchase({ 'Account__c': accountid });
					findOrCreateDeferred = purchase.save();
					findOrCreateDeferred.then(function() {
						$rootScope.$emit('purchase-retrieved', purchase);
					});

					return findOrCreateDeferred;
				}
				return findOrCreateDeferred;
			}
		};
	}])

	.factory("Purchase", ['$q', 'force', 'PurchaseProductWrapper', 'posservice', function($q, force, PurchaseProductWrapper, posservice) {
		
		return function(options) {
			return angular.extend(this, {
				// defaults
				Name: 'POSpurchase',
				purchaseProductWrappers: []
			}, options, {
				fetch: function() {
					var self = this;
					//return force.retrieve("Purchase__c", this.Id).then(function(purchase) {
					return force.query('SELECT Id, Name, opportunity__c, account__c, account__r.personcontactId, account__r.firstName, account__r.lastName, Discount__c, (SELECT Id, Name, Quantity__c, ProductWrapper__r.Name, ProductWrapper__r.Id, ProductWrapper__r.Total_Price__c FROM PurchaseProductWrappers__r) FROM Purchase__c WHERE Id = \'' + self.Id + '\'').then(function(response) {
						if(response.records.length > 0) {
							angular.extend(self, response.records[0]);

							// for each of the purchase product wrappers add it to our array
							_.each(self.PurchaseProductWrappers__r.records, function(data) {
								var ppw = new PurchaseProductWrapper(data);
								if(ppw.ProductWrapper__r) {
									ppw.productWrapper = posservice.findProductWrapperById(ppw.ProductWrapper__r.Id); // find and set this so we have it on init
								}
								self.purchaseProductWrappers.push(ppw);
							});
						}
						return self;
						
					}, function(error) {
						console.error(error);
					});
				},
				save: function(opts) {
					var self = this;
					var options = opts || {};
					if(!self.Id) {
						return force.create('Purchase__c', _.omit(self, ['olis', 'wrappers', 'purchaseProductWrappers', 'Id', 'PurchaseProductWrappers__r'])).then(function(response) {
							angular.extend(self, {
								Id: response.id
							});
							return self;
						});
					}
					else {
						var adjusted = {};
						if(options.picklist) {
							adjusted = _.pick(self, options.picklist);
						}
						else {
							adjusted = _.omit(self, ['olis', 'wrappers', 'purchaseProductWrappers', 'PurchaseProductWrappers__r']);
						}
						// update
						return force.update('Purchase__c', adjusted).then(function(response) {
							return self;
						});
					}
				},
				addPurchaseProductWrapper: function($event, productWrapper) {
					var self = this;
					var ppw = new PurchaseProductWrapper({
						ProductWrapper__c: productWrapper.Id,
						Purchase__c: self.Id,
						productWrapper: productWrapper,
						Quantity__c: 1
					});
					ppw.save().then(function(response) {

						// get the latest price on the productwrapper

						self.purchaseProductWrappers.push(ppw);
					});
					
				},
				deletePurchaseProductWrapper: function($event, productWrapper) {
					var self = this;
					return force.del('PurchaseProductWrapper__c', productWrapper.Id).then(function(response) {
						self.purchaseProductWrappers.splice(self.purchaseProductWrappers.indexOf(productWrapper), 1);
						return self;
					}, function(error) {
						alert('could not remove');
					});
				},
				getSubTotal: function() {
					var subTotal = 0.00;

					_.each(this.purchaseProductWrappers, function(ppw) {
						if(ppw.productWrapper) {
							subTotal += ppw.productWrapper.getUnitPrice() * ppw.Quantity__c;
						}
					});

					return subTotal;
				},
				getTotalSalesTax: function() { 
					var tax = 0.00;
					_.each(this.purchaseProductWrappers, function(ppw) {
						if(ppw.productWrapper) {
							tax += (ppw.productWrapper.getSalesTax() * ppw.Quantity__c);
						}
					});
					return tax;
				},
				getTotalCountyTax: function() {
					var tax = 0.00;
					_.each(this.purchaseProductWrappers, function(ppw) {
						if(ppw.productWrapper) {
							tax += (ppw.productWrapper.getCountyTax() * ppw.Quantity__c);
						}
					});
					return tax;
				},
				getOrderTotal: function() {
					var total = 0;
					_.each(this.purchaseProductWrappers, function(ppw) {
						if(ppw.productWrapper) {
							total += (ppw.productWrapper.getTotalPrice() * ppw.Quantity__c);
						}
					});
					if(this.Discount__c) {
						total = total - this.Discount__c;
					}
					return total;
				}
			});
		
		};
	}]);

	