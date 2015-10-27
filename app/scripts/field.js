angular.module('testapp.field', [
	'testapp.core', 
	'testapp.fieldDatepicker', 
	'testapp.fieldDropdown', 
	'testapp.fieldPicklist',
	'testapp.fieldText',
	'testapp.fieldTextarea',
	'testapp.fieldWysiwyg'
	])

.factory('Field', [function() {
	'use strict';
	return function(options) {
		_.extend(this, options, {
			toJSON: function() {
				return _.pick(this, ['name', 'value']);
			}
		});
	};
}])

.controller('FieldController', ['$scope', 'Evaluator', function($scope, Evaluator) {
	'use strict';

	var self = this;
	this.init = function(element, controllers) {
		this.controllers = controllers;
		this.scope = $scope;
		this.element = element;
		this.elemId = _.uniqueId('elem_');
		this.model = null;
		if(controllers[2]) {
			this.model = controllers[2];
			// put the form ctrlr on the service object for use
			$scope.field.formCtrl = controllers[2];
		}
		_.defaults($scope.field, {
			visible: true,
			required: false,
			dependency: {},
			name: 'unknown'
		});

		this.setupDependencies();

		$scope.$watch('field.value', function(newVal, oldVal) {	
			self.emitChange($scope.field);
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
			if(self.controllers[1]) {
				self.controllers[1].digestChange(field);	
			}
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
}])

.directive('smbField', [function() {
	'use strict';
	return {
		templateUrl: 'views/field.html',
		scope: {
			field: '=field'
		},
		require: ['smbField', '?^smbForm', '^form'],
		controller: 'FieldController',
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
}]);