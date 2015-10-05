// pricebook
angular.module('pointofsale.pricebook', [])

	.factory('PricebookService', ['force', '$q', function(force, $q) {

		var pricebookentries = [];
		var last_request_failed = false;

		return {
			pricebookEntryDeferred: undefined,
			pricebookDeferred: undefined,
			getPricebook: function(name) { 
				var self = this;
				if(self.pricebookDeferred && !last_request_failed) {
					return self.pricebookDeferred.promise;
				}
				self.pricebookDeferred = $q.defer();

				return force.query('SELECT Id, Name FROM Pricebook2 WHERE Name = \'' + name + '\'').then(function(results) {
					if(results.records.length > 0) {
						last_request_failed = false;
						return self.pricebookDeferred.resolve(results.records[0]);
					}
					else return null;
				}, function(error) {
					last_request_failed = true;
					return self.pricebookDeferred.reject(error);
				});
			},
			getPricebookEntries: function(pricebookId) {
				var self = this;
				// if cached
				if(self.pricebookEntryDeferred) {
					return this.pricebookEntryDeferred.promise;
				} 

				self.pricebookEntryDeferred = $q.defer();

				// if non-cached...
				return force.query('SELECT Id, Name, UnitPrice, Tax_Amount__c, Total_Price__c, Taxable__c, County_Entertainment_Taxable__c, County_Amusement_Tax_Amount__c, Product2.Id FROM PricebookEntry WHERE Pricebook2.Name = \'test\'').then(function(response) {
					pricebookentries = response.records;
					return self.pricebookEntryDeferred.resolve(pricebookentries);
				});
			},
			// returns deferred, to allow fetching of pbes if they haven't been already...
			findPricebookEntryByProductId: function(criteria) {
				return this.getPricebookEntries().then(function() {
					return _.find(pricebookentries, function(pbe) {
						return pbe.Product2.Id === criteria;
					});	
				});
			}
		};

	}]);