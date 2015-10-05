angular.module('pointofsale.productwrapper', [])


	.factory('ProductWrapperService', ['force', '$q', 'ProductWrapper', 'PricebookService', 'blockUI', '$timeout', function(force, $q, ProductWrapper, PricebookService, blockUI, $timeout) {

		var productwrappers = [];

		var productWrapperDef = null;

		return {
			fetchAll: function() {
				
				if(productWrapperDef) {
					return productWrapperDef;
				}
				else {
					productWrapperDef = force.query('SELECT Name, Id, Category__c, Total_Price__c, (SELECT Id, ProductAlias__r.Product_Name__c, ProductAlias__r.Total_Price__c, ProductAlias__r.UnitPrice__c, ProductAlias__r.Sales_Tax_Amount__c, ProductAlias__r.County_Tax_Amount__c FROM ProductWrapperAliases__r) FROM ProductWrapper__c').then(function(response) {
						var objs = [];
						angular.forEach(response.records, function(record) {
							objs.push(new ProductWrapper(record));
						});
						productwrappers = objs;
						return objs;
					}, function(error) {
						return error;
					});
				}
				return productWrapperDef;
			
			}, 
			findProductWrapperById: function(Id) {
				return _.find(productwrappers, function(pw) {
					return pw.Id === Id;
				});
			}
			
		};
	}])

	.factory('ProductWrapper', ['PurchaseProductWrapper', 'ProductWrapperAlias', function(PurchaseProductWrapper, ProductWrapperAlias) {
		return function(data) {

			this.productWrapperAliases = [];

			_.extend(this, _.clone(data));

			this.init = function() {
				var self = this;
				if(this.ProductWrapperAliases__r !== null) {
					_.each(this.ProductWrapperAliases__r.records, function(pwa) {
						self.productWrapperAliases.push(new ProductWrapperAlias(pwa));
					});
				}
			};

			this.getUnitPrice = function() {
				var unitprice = 0;
				_.each(this.productWrapperAliases, function(pwa) {
					if(pwa.productAlias) {
						unitprice += pwa.productAlias.UnitPrice__c;
					}
				});
				return unitprice;
			};

			this.getSalesTax = function() { 
				var tax = 0;
				_.each(this.productWrapperAliases, function(pwa) {
					if(pwa.productAlias) {
						tax += pwa.productAlias.Sales_Tax_Amount__c;
					}
				});
				return tax;
			};


			this.getCountyTax = function() { 
				var tax = 0;
				_.each(this.productWrapperAliases, function(pwa) {
					if(pwa.productAlias) {
						tax += pwa.productAlias.County_Tax_Amount__c;
					}
				});
				return tax;
			};

			this.getTotalPrice = function() {
				var total = 0.00;
				total = this.getUnitPrice() + this.getSalesTax() + this.getCountyTax();
				return total;
			};

			this.init();

			return this;
		};
	}])

	.factory('ProductAlias', [function() {
		return function(data) {
			angular.extend(this, {
				hasTax: function() {
					if(this.Sales_Tax_Amount__c > 0 || this.County_Tax_Amount__c > 0) {
						return true;
					}
					else { 
						return false; 
					}
				}
			}, data);
		};
	}])

	.factory('ProductWrapperAlias', ['force', 'ProductAlias', function(force, ProductAlias) {
		return function(data) {
			angular.extend(this, {
				init: function() {
					if(this.ProductAlias__r) {
						this.productAlias = new ProductAlias(this.ProductAlias__r);
					}
				},
				save: function() {
					var self = this;
					
				}

			}, data);

			this.init();

			return this;
		};
	}])

	.factory('PurchaseProductWrapper', ['force', 'blockUI', function(force, blockUI) {

		var lazyUpdate = _.throttle(function() {
					
			blockUI.start();
			this.update({
				picklist: ['Quantity__c', 'Id']
			}).then(function() {

			}).finally(function() {
				blockUI.stop();
			});
		}, 3000, { leading:false });

		return function(data) {
			angular.extend(this, {
				init: function() {
					//this.getAssociatedPbe();

				},
				save: function() {
					var self = this;
					return force.create('PurchaseProductWrapper__c', _.omit(self, ['productWrapper', 'ProductWrapper__r'])).then(function(response) {
						_.extend(self, {Id: response.id });
					});
				},
				update: function(options) {
					var self = this;
					var picklist = [];
					if(options && options.picklist) {
						picklist = options.picklist;
					}
					return force.update('PurchaseProductWrapper__c', _.pick(self, picklist));
				},
				changeQuantity: function(purchase) {
					var self = this;

					if(this.Quantity__c < 1) {
						// user might want to remove this...
						if(window.confirm('Do you want to remove this item?')) {
						
							purchase.deletePurchaseProductWrapper(null, self).then(function() {
								console.log('removed');
							});
							
						}
					}
					else if(this.Quantity__c > 0) {
						lazyUpdate.call(this, arguments);
					}
				}
			}, data);

			this.init();

			return this;
		};
	}]);