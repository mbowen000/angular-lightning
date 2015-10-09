angular.module('testapp.field', ['testapp.core'])

.factory('FieldCollection', ['Collection', 'FieldModel', function(Collection, FieldModel) {
	'use strict';
	return Collection.extend({
		model: FieldModel,
		initialize: function() {

		}
	});
}])

.factory('FieldModel', ['Model', function(Model) {
	'use strict';
	return Model.extend({
		initialize: function() {
			if(this.get('type') === 'date') {
				this.prepareDateModel();
			}
		},
		prepareDateModel: function() {
			this.set('value', new Date(this.get("value")));
		}
	});
}])

.directive('smbForm', [function() {
	'use strict';
	return {
		templateUrl: 'views/form.html',
		scope: {
			form: '=form'
		},
		require: ['smbForm'],
		controller: function($scope) {
			this.init = function(element, controllers) {
				this.controllers = controllers;
				this.element = element;				
			};	

			_.extend(this, {
				// look up a field by name ( needs to traverse the page -> section -> field structure so might be slow with large forms!!! )
				// if this gets slow, could cache all the fields in a flattened array of fields and use that to search
				findFieldByName: function(name) {
					var needle = null;
					_.each($scope.form.pages, function(page) { 
						_.each(page.sections, function(section) {
							needle = _.findWhere(section.fields, {name: name});
						});
					});

					return needle;
				},
				digestChange: function(field) {
					
					// right now this is just a marshaller

					// this function can do any filtering necessary etc and act as a Marshal for changes in fields. Throttling etc could happen here too.
					$scope.$broadcast('dependency-detected', field);
				}

			});

			

		},
		link: function(scope, element, attrs, controllers) {
			controllers[0].init(element, controllers);
			return this;
		}
	};
}])

.directive('smbField', ['Evaluator', function(Evaluator) {
	'use strict';
	return {
		templateUrl: 'views/field.html',
		scope: {
			field: '=field'
		},
		require: ['smbField', '^smbForm'],
		controller: function($scope) {
			var self = this;
			this.init = function(element, controllers) {
				this.controllers = controllers;
				this.scope = $scope;
				this.element = element;
				this.elemId = _.uniqueId('elem_');
				_.defaults($scope.field, {
					visible: true,
					required: false,
					dependency: {}
				});

				this.setupDependencies();

				$scope.$watch('field.value', function(newVal, oldVal) {
					if(newVal !== oldVal) {
						self.emitChange($scope.field);
					}
				});

				// set up listener to listen to changes form-wide
				$scope.$on('dependency-detected', _.bind(self.listenToChanges, self));
			};	

			_.extend(this, {
				setupDependencies: function() {
					// for each dependency push into the top-level form
					if(_.keys($scope.field.dependency).length > 0) {
						this.evaluator = new Evaluator($scope.field.dependency, this);
					}
				},
				emitChange: function(field) {
					self.controllers[1].digestChange(field);
				},
				listenToChanges: function($event, dependency) {
					
					if(this.evaluator) {
						// we might care
						if(_.contains(this.evaluator.getFieldsThatMatter(), dependency.name)) {
							// we do care
							//this.controllers[1].evaluate(this.evaluator);
							this.evaluator.evaluate($scope);
						}
					}

				}
			});

		},
		link: function(scope, element, attrs, controllers) {
			controllers[0].init(element, controllers);
			return this;
		}
	};
}])

.factory('Evaluator', [function() {
	'use strict';
	return function(dependency, parent) {
		var self = this;
		this.dependency = dependency;
		this.watchers = [];
		this.parent = parent;

		_.defaults(this.dependency, {
			invoke: "show"
		});

		return _.extend(this, {
			evaluate: function(scope) {

				var cond = false;

				// only doing OR for now for simplicity... should handle AND with complex # of evaluations
				_.each(this.dependency.criteria, function(criteria) {
					var foundfield = self.parent.controllers[1].findFieldByName(criteria.field);
					if(foundfield.value === criteria.condition) { cond = true; }
				});

				return this.processInvoker(cond, scope);
			},
			processInvoker: function(meetsCondition, scope) {
				
				// todo: actually invoke an invoker so we can do other things other than hide/show
				if(this.dependency.invoke === "show") {
					if(meetsCondition) {
						scope.field.visible = true;
					} 
					else {
						scope.field.visible = false;	
					} 
				}
			},
			getFieldsThatMatter: function() {
				return _.uniq(_.pluck(this.dependency.criteria, 'field'));
			},
			convertCriteriaToExpression: function() {
				// turn our criteria objects into an angular ready expression
				
				// e.g if criteria is operator equals and condition "test"
				// return:
				// === 'test'

				// if criteria is greater than and condition is a date .. turn into a moment and compare etc.
				// date = new moment('10-7-2014')
				//moment.after(date)

				// other conditions could be: Contains, Date Equals, 

				// fake for now
				return "Base_Fee__c = 'test'";
			}


			//if(['field a', 'field b] ... field A changed and im field C ... evaluate the current situation

		});
		
	};
}])

.directive('smbFieldDate', [function() {
	'use strict';
	return {
		templateUrl: 'views/field-date.html',
		require: ['smbFieldDate', '^smbField'],
		controller: function($scope) {
			this.init = function(element, controllers) {
				this.controllers = controllers;
				this.element = element;
			};

			return this;
		},
		link: function(scope, element, attrs, controllers) {
			controllers[0].init(element, controllers);
			return this;
		}
	};
}])

.directive('smbFieldPicklist', [function() {
	'use strict';
	return {
		templateUrl: 'views/field-picklist.html',
		require: ['^smbField']
	};
}])

.service('FormService', ['$http', function($http) {
	'use strict';
	return {
		getFormConfig: function() {
			return $http.get('assets/mockresponse-spconfig.json').then(function(response) {
				//self.parseModels(response.data.pages);
				return response.data;
			});
		}
	};
}]);