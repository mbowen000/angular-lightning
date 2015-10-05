angular.module('pointofsale', [
	'pointofsale.productwrapper', 
	'pointofsale.pricebook',
	'pointofsale.purchase',
	'pointofsale.payment',
	'ui.grid', 
	'forceng', 
	'config', 
	'ngRoute',
	'blockUI',
	'ngAnimate',
	'ui.bootstrap'
	])

	.config(function($routeProvider, $sceDelegateProvider) {
		
		$routeProvider.when('/:mode/:accountid/:opportunityid?', {
			controller: 'appcontroller',
			templateUrl: 'views/app.html'
		}).otherwise({
			redirectTo: '/products'
		});

		$sceDelegateProvider.resourceUrlWhitelist([
			'https://localhost:9000/views/**',
			'views/**'
		]);

	})

	.run(['$route', function($route) {
		$route.reload();
	}])

	.factory('posservice', [
		'force',
		'appconfig', 
		'$q', 
	function(force, appconfig, $q) {
		
		var account = null;
		
		force.init({
			accessToken: appconfig.SESSION_ID,
			useProxy: false
		});

		var accountDef = null;

		return {
			getAccount: function(accountId) {
				if(accountDef) {
					return accountDef;
				}
				else {
					accountDef = force.retrieve('Account', accountId, null);	
				}
				return accountDef;				
			},
			findProductWrapperById: function(Id) {
				return _.find(this.productwrappers, function(pw) {
					return pw.Id === Id;
				});
			},
			productwrappers: []
		};
	}])

	.controller('appcontroller', ['$scope', '$rootScope', 'posservice', 'ProductWrapperService', 'PurchaseService', '$route', '$routeParams', '$location', 'blockUI', function($scope, $rootScope, posservice, ProductWrapperService, PurchaseService, $route, $routeParams, $location, blockUI) {
		
		$scope.app = {
			name: 'POS Application'
		};

		$scope.$on('$routeChangeSuccess', function() {
			if(!$routeParams.accountid) {
				alert('no account provided, please provide one.');
			}
			else {

				$scope.mode = $routeParams.mode;

				blockUI.start();
				posservice.getAccount($routeParams.accountid).then(function(account) {

					$scope.account = account;

					ProductWrapperService.fetchAll().then(function(response) {
						
						$scope.productwrappers = posservice.productwrappers = response;
						
						PurchaseService.findOrCreatePurchase($routeParams.accountid, $routeParams.opportunityid || null).then(function(purchase) {
							$scope.purchase = $rootScope.purchase =  purchase;
							$location.path($routeParams.mode + '/' + $scope.account.Id + '/' + $scope.purchase.Id);
						}).finally(function(){
							blockUI.stop();
						});

						/*
						OpportunityService.findOrCreateOpportunity($routeParams.accountid, $routeParams.opportunityid || null).then(function(opportunity) {
							$scope.opportunity = opportunity;

							PricebookService.getPricebookEntries($scope.opportunity).then(function(response) {
								$scope.pricebookentries = response;

								// when all is said and done...
								// $route.updateParams({
								// 	'accountid': $scope.account.Id,
								// 	'opportunityid': $scope.opportunity.Id
								// });
								$location.path($scope.account.Id + '/' + $scope.opportunity.Id);
								blockUI.stop();
							});
						});
						*/

						
					});
				});
				
			}
		});
	}])

	.controller('productlistcontroller', ['$scope', 'ProductWrapperService', function($scope, ProductWrapperService) {
		$scope.columns = [
			{
				field: "Name"
			},
			{
				field: "Category__c",
				displayName: "Category"
			},
			{
				field: 'Add',
				displayName: 'Add',
				cellTemplate: '<div class="grid-action-cell"><button class="btn btn-xs btn-primary" ng-click="grid.appScope.$parent.purchase.addPurchaseProductWrapper($event, row.entity)">Add</button></div>'
			}
		];

		$scope.addWrapperToOpportunity = function($event, wrapper) {
			// delegate action to the service (we dont want logic in the controller)
			ProductWrapperService.addSelectedProductWrapper(wrapper);
		};
	}])

	.controller('orderstatuscontroller', ['$scope', 'ProductWrapperService', '$location', '$routeParams', 'appconfig', '$modal', function($scope, ProductWrapperService, $location, $routeParams, appconfig, $modal) {
		
		$scope.taxTooltipTemplateUrl = 'views/tax-tooltip.html';

		$scope.mode = $routeParams.mode;

		$scope.goToPayment = function() { 
			$location.path('payment' + '/' + $scope.account.Id + '/' + $scope.purchase.Id);
		};

		$scope.goToProducts = function() { 
			$location.path('products' + '/' + $scope.account.Id + '/' + $scope.purchase.Id);
		};

		$scope.adjustDiscount = function() {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'views/discount-modal.html',
				controller: 'DiscountModalController',
				resolve: {
					purchase: function() {
						return $scope.purchase;
					}
				}
			});			
		};

		
	}])

	.controller('DiscountModalController', ['$scope', '$modalInstance', 'blockUI', function($scope, $modalInstance, blockUI) {
		$scope.done = function() {

			blockUI.start();
			$scope.purchase.save({picklist: ['Discount__c', 'Id']}).then(function() {
				$modalInstance.dismiss('cancel');
			}, function(error) {
				console.error("Could not save discount: " + error);
			}).finally(function() {
				blockUI.stop();
			});

		};
	}]);