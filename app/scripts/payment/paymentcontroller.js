angular.module('pointofsale.payment', ['pointofsale.purchase'])

.controller('paymentcontroller', ['$scope', '$rootScope', 'Payment', 'posservice', 'PurchaseService', 'Payments', '$filter', function($scope, $rootScope, Payment, posservice, PurchaseService, Payments, $filter) {
	
	var account = {};
	$scope.templateurl = 'views/payment.html';
	
	posservice.getAccount().then(function(act) {
		account = act;
	});
	
	$rootScope.$on('purchase-retrieved', function($event, purchase) {
		$scope.purchase = purchase;
		$scope.addPayment();
	});

	$scope.payments = Payments.payments;

	$scope.chargePerPayment = function() {
		var amount = 0.00;
		if($scope.purchase) {
			amount = $scope.purchase.getOrderTotal() / $scope.payments.length;

			_.each($scope.payments, function(payment) {
				if(!payment.BluePay__Amount__c) {
					payment.BluePay__Amount__c = $filter('currency')(amount);
				}
			});
		}
		return amount;
	};

	$scope.paymentTotal = function() {
		var total = 0;
		_.each($scope.payments, function(payment) {
			if(payment.BluePay__Amount__c) {
				total = total + parseFloat(payment.BluePay__Amount__c);
			}
		});
		return total;
	};

	$scope.remainingBalance = function() {
		return $scope.purchase.getOrderTotal() - $scope.paymentTotal();
	};

	$scope.addPayment = function() {
		$scope.payments.push(new Payment({
			//BluePay__Email__c: account.PersonEmail
		}));
		console.log($scope.payments);
	};


}])

.service('Payments', [function() {
	return {
		payments: []
	};
}])

.factory('Payment', ['force', 'PurchaseService', function(force, PurchaseService) {
	return function(options) {
		return angular.extend(this, {
			save: function() {
				var self = this;
				if (self.BluePay__Address__c == null || self.BluePay__City__c == null
					|| self.BluePay__State__c == null || self.BluePay__Zipcode__c == null
					|| self.BluePay__Phone__c == null || self.BluePay__Email__c == null
					|| self.BluePay__Amount__c == null || self.BluePay__Card_Number__c == null
					|| self.BluePay__Expiration_Month__c == null || self.BluePay__Expiration_Year__c == null
					|| self.BluePay__CVV2__c == null) {
						alert('Please fill in all of the fields on the form');
					return self;
				}
				PurchaseService.findOrCreatePurchase().then(function(purchase) {
					console.log(purchase);
					self.BluePay__Opportunity_Name__c = purchase.Opportunity__c;
					self.BluePay__Transaction_Type__c = 'Sale';
					self.BluePay__Payment_Type__c = 'Credit Card';
					self.BluePay__Account_Name__c = purchase.Account__c;
					self.BluePay__Contact_Name__c = purchase.Account__r.PersonContactId;
					self.FirstName__c = purchase.Account__r.FirstName;
					self.LastName__c = purchase.Account__r.LastName;
					delete self.save; // removing attributes before saving and processing payment
					delete self.$$hashKey;
					delete self.formName;
					Visualforce.remoting.Manager.invokeAction(
                        window.remoteActionURL,
                        self, 
                        function(result, event){
                        	if (result.BluePay__Transaction_Result__c ==='APPROVED' && result.BluePay__Transaction_Type__c.toUpperCase() !== 'AUTH') {
                    			console.log('Success!');
                        	} else {
                        		console.error(event.message);
                        	}
                        }
                    );
					return self;
				});
			}
		});
	};
}]);