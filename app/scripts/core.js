// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.

var extend = function(protoProps, staticProps) {
	var parent = this;
	var child;

	// The constructor function for the new subclass is either defined by you
	// (the "constructor" property in your `extend` definition), or defaulted
	// by us to simply call the parent's constructor.
	if (protoProps && _.has(protoProps, 'constructor')) {
	  child = protoProps.constructor;
	} else {
	  child = function(){ return parent.apply(this, arguments); };
	}

	// Add static properties to the constructor function, if supplied.
	_.extend(child, parent, staticProps);

	// Set the prototype chain to inherit from `parent`, without calling
	// `parent`'s constructor function.
	var Surrogate = function(){ this.constructor = child; };
	Surrogate.prototype = parent.prototype;
	child.prototype = new Surrogate;

	// Add prototype properties (instance properties) to the subclass,
	// if supplied.
	if (protoProps) _.extend(child.prototype, protoProps);

	// Set a convenience property in case the parent's prototype is needed
	// later.
	child.__super__ = parent.prototype;

	return child;
};

angular.module('testapp.core', [])

/**
* Model
* Defines a record in the system
**/
.factory('Model', ['force', function(force) {
	'use strict';

	var Model = function(attributes, options) {

		options || (options = {});
		
		this.attributes = attributes || {};

		if(options.sObject) {
			this.sObject = options.sObject;
		}

		this.initialize.apply(this, arguments);
	};

	_.extend(Model.prototype, {
		sObject: 'fakeobject',
		attrs: ['Id'],
		limit: 1000,
		initialize: function() {}
	});

	Model.extend = extend;

	return Model;

}])

/**
* Collection
* Defines a set of records in the system
**/
.factory('Collection', ['force', 'Model', function(force, Model) {
	'use strict';

	var Collection = function(models, options) {
		options || (options = {});

		if(options.model) {
			this.model = options.model;
		}
		if(options.sObject) {
			this.sObject = options.sObject;
		}
		if(models) {
			this.models = models;
		}

		this.initialize.apply(this, arguments);

	};

	_.extend(Collection.prototype, {
		model: Model,
		models: [],
		sObject: 'fakeobject',
		attrs: ['Id'],
		limit: 100,
		initialize: function() {},
		fetch: function() {
			var self = this;
			
			var soql = 'SELECT ' + this.attrs.join(',') + ' FROM ' + this.sObject + ' LIMIT ' + this.limit;
			
			return force.query(soql).then(function(response) {
				// create models out of response

				var models = self.parseModels(response.records);

				return models;
			});
		},

		parseModels: function(data) {
			var self = this;

			if(data) {
				_.each(data, function(record) {
					var model = new self.model(record);
					self.models.push(model);
				});
			}

			return self.models;
		}
	});

	Collection.extend = extend;

	return Collection;

}]);
