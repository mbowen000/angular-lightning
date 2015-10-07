'use strict';


describe('A Model...', function() {
  var Model;

  beforeEach(module('testapp.core', 'forceng'));

  beforeEach(inject(function(_Model_) {
    Model = _Model_;
  }));

  it('should have an initialize function', function() {
    // spy on the prototype function
    spyOn(Model.prototype, 'initialize');

    // define a new one so the constructor is fired
    var model = new Model();
    
    expect(model.initialize).toHaveBeenCalled();

  });

  it('should have an initialize function that can be overridden', function() {

    var MyModel = Model.extend({
      initialize: function() {
        this.value = 'test';
      }
    });

    spyOn(MyModel.prototype, 'initialize').and.callThrough();

    var mymodel = new MyModel();

    expect(mymodel.initialize).toHaveBeenCalled();
    expect(mymodel.value).toEqual('test');

  });
});

describe('A Collection...: ', function () {

  // load the controller's module
  beforeEach(module('testapp.core', 'forceng'));

  var Collection, Model, force, $q, $rootScope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_Collection_, _force_, $injector) {
    Collection = _Collection_;
    force = _force_;
    $injector = $injector;
    $q = $injector.get('$q');
    $rootScope = $injector.get('$rootScope');
    Model = $injector.get('Model');
    
    spyOn(force, 'query').and.callFake(function() {
      var def = $q.defer();
      def.resolve(JSON.parse('{"totalSize":10,"done":true,"records":[{"attributes":{"type":"Account","url":"/services/data/v33.0/sobjects/Account/001j000000Id7K6AAJ"},"Id":"001j000000Id7K6AAJ","Name":"GenePoint"},{"attributes":{"type":"Account","url":"/services/data/v33.0/sobjects/Account/001j000000Id7K7AAJ"},"Id":"001j000000Id7K7AAJ","Name":"United Oil & Gas, UK"},{"attributes":{"type":"Account","url":"/services/data/v33.0/sobjects/Account/001j000000Id7K8AAJ"},"Id":"001j000000Id7K8AAJ","Name":"United Oil & Gas, Singapore"},{"attributes":{"type":"Account","url":"/services/data/v33.0/sobjects/Account/001j000000Id7K9AAJ"},"Id":"001j000000Id7K9AAJ","Name":"Edge Communications"},{"attributes":{"type":"Account","url":"/services/data/v33.0/sobjects/Account/001j000000Id7KAAAZ"},"Id":"001j000000Id7KAAAZ","Name":"Burlington Textiles Corp of America"},{"attributes":{"type":"Account","url":"/services/data/v33.0/sobjects/Account/001j000000Id7KBAAZ"},"Id":"001j000000Id7KBAAZ","Name":"Pyramid Construction Inc."},{"attributes":{"type":"Account","url":"/services/data/v33.0/sobjects/Account/001j000000Id7KCAAZ"},"Id":"001j000000Id7KCAAZ","Name":"Dickenson plc"},{"attributes":{"type":"Account","url":"/services/data/v33.0/sobjects/Account/001j000000Id7KDAAZ"},"Id":"001j000000Id7KDAAZ","Name":"Grand Hotels & Resorts Ltd"},{"attributes":{"type":"Account","url":"/services/data/v33.0/sobjects/Account/001j000000Id7KEAAZ"},"Id":"001j000000Id7KEAAZ","Name":"Express Logistics and Transport"},{"attributes":{"type":"Account","url":"/services/data/v33.0/sobjects/Account/001j000000Id7KFAAZ"},"Id":"001j000000Id7KFAAZ","Name":"University of Arizona"}]}'));  
      return def.promise;
    });
    
  }));

  it('should exist and have some default options', function () {
    expect(Collection).toBeDefined();
    
    var collection = new Collection();

    // we should have some default options set on the Collection
    expect(collection).toBeDefined();
    expect(collection.sObject).toEqual('fakeobject');
    expect(collection.attrs).toContain('Id');

  });

  it('should have an initialize function and it should be called by the constructor', function() {
    spyOn(Collection.prototype, 'initialize');

    var collection = new Collection();

    expect(collection.initialize).toHaveBeenCalled();
  });

  it('should have overridden options when instantiated', function() {

    // instantiate and override option(s)
    var collection = new Collection([], {
      sObject: 'Account'
    });

    expect(collection.sObject).toEqual('Account');

  });

  it('should contain models if they are passed into the contsructor', function() {
    var models = [{
      testkey:'testvalue1'
    }, {
      testkey: 'testvalue2'
    }];
    var collection = new Collection(models);

    expect(collection.models.length).toEqual(2);
  });

  it('should fetch models when the http service is called', function() {

    var TestCollection = Collection.extend({
      sObject: 'Account'
    });

    var collection = new TestCollection();


    collection.fetch().then(function(models) {
      
      expect(models).toBeDefined();
      expect(models.length).toEqual(10);
      
      // it should create models in the collection
      expect(collection.models.length).toEqual(10);
      
      // the models in the collection should be of type 'Model' by default
      expect(collection.models[0]).toEqual(jasmine.any(Model));
    });

    // force the $q to resolve
    $rootScope.$digest();

  });

  it('should have models of specified type if specified', function() {
    
    var AccountModel = Model.extend({  
        sObject: 'Account'  
    });

    var AccountCollection = Collection.extend({
      sObject: 'Account',
      model: AccountModel
    });

    var collection = new AccountCollection();

    collection.fetch().then(function(response) {
      // standard stuff
      expect(response).toBeDefined();
      expect(collection.models.length).toEqual(10);

      expect(collection.models[0].attributes).toBeDefined();

      expect(collection.models[0].sObject).toEqual('Account');
    });

    // force the $q to resolve
    $rootScope.$digest();

  });
});