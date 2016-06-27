// this just pulls in all the submodules
angular.module('angular-lightning', [ 
	'angular-lightning.datepicker',
	'angular-lightning.picklist',
	'angular-lightning.icon',
	'angular-lightning.modal',
	'angular-lightning.lookup',
	'angular-lightning.wysiwyg',
	'angular-lightning.tooltip',
	'angular-lightning.tabs',
	'angular-lightning.progress',
	'angular-lightning.sticky',
	'angular-lightning.popover'
]);

angular.module('angular-lightning.datepicker', [])

.constant('DateConfig', {
	numWeeksShown: 5,
	dateFormat: 'MM/DD/YYYY',
	dateModel: 'YYYY-MM-DD',
	dateTimeFormat: 'MM/DD/YYYY hh:mm A',
	datetimeModel: 'YYYY-MM-DD HH:mm:ss'
})

.service('DateService', ['DateConfig', function(DateConfig) {
	'use strict';
	
	var Day = function(startMoment, currentMonth) {
		this.moment = startMoment.clone();
		this.label = this.moment.format('D');
		this.inCurrentMonth = (startMoment.month() === currentMonth);
		return this;
	};

	var Week = function(startMoment) {
		this.days = [];
		var start = startMoment.clone();
		var currentMonth = startMoment.month();
		start = startMoment.startOf('week');		
		for(var i=0; i<7; i++) {
			this.days.push(new Day(start, currentMonth));
			start = start.add('1', 'days');
		}
		return this;
	};

	var Month = function(startMoment) {
		this.weeks = [];
		this.label = startMoment.format('MMMM');
		this.year = startMoment.format('YYYY');
		var start = this.currentDate = startMoment.clone();
		start = start.startOf('month');
		for(var i=0; i<DateConfig.numWeeksShown; i++) {
			var startWeek = start.clone().add(i, 'weeks');
			this.weeks.push(new Week(startWeek));
		}
		return this;
	};

	var Year = function(startMoment) {
		this.moment = startMoment.clone();
		this.label = startMoment.format('YYYY');
		return this;
	};

	return {
		getDate: function(value) {
			if(value) {
				return moment(value);	
			}
			else {
				return null;
			}
			
		},
		buildMonth: function(currentDate) {
			var start = currentDate.clone();
			return new Month(start);
		},
		buildYearsAroundCurrent: function(currentYearMoment) {
			var years = [];
			var startYear = currentYearMoment.clone();
			for(var i=0; i<9; i++) {
				years.push(new Year(startYear.clone().subtract(4-i, 'years')));
			}
			return years;
		}
	};
}])

.controller('DateDropdownController', ['$scope', '$document', 'DateService', '$compile', 'DateConfig', function(_originalScope, $document, DateService, $compile, DateConfig) {
	'use strict';

	var self = this;
	var ngModelCtrl, inputEl, $popup, $yearPicker, $scope;

	var dateFormat = DateConfig.dateFormat;
	var dateModel = DateConfig.dateModel;

	$scope = _originalScope;

	var _buildCalendar = function() {
		if(ngModelCtrl.$modelValue) {
			$scope.month = DateService.buildMonth(moment(ngModelCtrl.$modelValue));
		}
		else { 
			$scope.month = DateService.buildMonth(moment());
		}

		// only render if its not rendered already
		if(!$popup) {
			var popupEl = angular.element('<div li-date-dropdown ng-show="isOpen" ng-click="isOpen = true"></div>');

			$popup = $compile(popupEl)($scope);
			
			$(inputEl).after($popup);
		}

	};

	this.init = function(element, controllers, attrs) {
		this.controllers = controllers;
		this.element = inputEl = element;

		$scope.showTime = false;
		if (attrs.datepickerType && attrs.datepickerType === 'datetime') {
			dateFormat = DateConfig.dateTimeFormat;
			dateModel = DateConfig.datetimeModel;
			$scope.showTime = true;
		}

		ngModelCtrl = controllers[1];

		ngModelCtrl.$parsers.push(function(value) {
			if (value) {
				value = moment(value);
				
				$scope.hour = value.hour();
				if (value.format('A') === 'PM') {
					$scope.hour -= 12;
				}
				$scope.minute = value.minute();
				$scope.ampm = value.format('A');
			
				return value.format(dateModel);
			}
			else {
				return null;
			}
		});

		ngModelCtrl.$formatters.push(function(value) {
			if (value && moment.isMoment(value)) {
				$scope.hour = value.hour();
				if (value.format('A') === 'PM') {
					$scope.hour -= 12;
				}
				$scope.minute = value.minute();
				$scope.ampm = value.format('A');
				_buildCalendar();
				return value.format(dateFormat);
			}
			_buildCalendar();
		});

		var unwatch = $scope.$watch(function() {
			if (ngModelCtrl.$modelValue) {
				return moment(ngModelCtrl.$modelValue);
			}
		}, function(val) {
			if (val) {
				var theDate = DateService.getDate(val);
				theDate.second(0);
				ngModelCtrl.$setViewValue(theDate.format(dateFormat));
				ngModelCtrl.$render();
			}
			
			unwatch();
			_buildCalendar();
		});

		inputEl.bind('focus', function() {
			$scope.isOpen = true;
			$scope.yearPickerOpen = false;
			$scope.$digest();
		});

		// ngModelCtrl.$render = function() {
		// 	console.log(ngModelCtrl);
		// }

	};

	var documentClickBind = function(event) {
		// check if the click event contains the dropdown or the input itself, if it contains neither, don't set isOpen false, otherwise do.
		// todo: this requires Jquery - i would love to get rid of this dependency by registering the popup as a dom element in this directive
		
		//var clickedElementIsInInput = $(self.element)[0].contains(event.target);
		//var clickedElementIsInPopupElement = $(self.element).parents('.slds-form-element').siblings('.smb-date-dropdown')[0].contains(event.target);

		var clickedElementIsInInput = inputEl[0].contains(event.target);
		var clickedElementIsInPopup = $popup[0].contains(event.target);

		if($scope.isOpen && !(clickedElementIsInInput || clickedElementIsInPopup )) {
			$scope.isOpen = false;
			$scope.$apply();					
		}
	};

	$scope.$watch('isOpen', function(value) {
		if(value) {
			$document.bind('click', documentClickBind);
		}
		else {
			$document.unbind('click', documentClickBind);
		}
	});

	//build the calendar around the current date
	$scope.month = {};
	
	$scope.$watch('yearPickerOpen', function(val) {
		if(val) {

			// if its already created then do nothing
			if($yearPicker) {
				return;
			}

			var yearPickerEl = angular.element('<span li-date-year-picker></span>');
			yearPickerEl.attr({
				'current-year' : 'getCurrentDate()'
			});	

			$yearPicker = $compile(yearPickerEl)($scope);
			$($popup).find('#year').after($yearPicker);
		}
	
	});

	$scope.getCurrentDate = function() { 
		if(ngModelCtrl.$modelValue) {
			return moment(ngModelCtrl.$modelValue);	
		}
		else {
			return moment();
		}
	};

	$scope.getCurrentDateAsMoment = function() {
		return moment(ngModelCtrl.$modelValue);
	};

	$scope.nextMonth = function() {
		var currentStart = moment($scope.month.currentDate).clone().startOf('month');
		$scope.month = DateService.buildMonth(currentStart.add('1', 'month'));
	};
	$scope.previousMonth = function() {
		var currentStart = moment($scope.month.currentDate).clone().startOf('month');
		$scope.month = DateService.buildMonth(currentStart.subtract('1', 'month'));
	};
	$scope.selectDay = function(day) {
		ngModelCtrl.$setViewValue(day.moment.format(dateFormat));
		ngModelCtrl.$render();
	};
	$scope.selectYear = function(year) {
		ngModelCtrl.$setViewValue(year.format(dateFormat));
		ngModelCtrl.$render();
		$scope.month = DateService.buildMonth(moment(ngModelCtrl.$modelValue));
	};

	$scope.changeHour = function(val) {
		val = Number(val);
		var momentModel = DateService.getDate(ngModelCtrl.$modelValue);

		if (momentModel.format('A') === 'PM') {
			val += 12;
		}
		momentModel.hour(val);
		ngModelCtrl.$setViewValue(momentModel.format(dateFormat));
		ngModelCtrl.$render();

		$scope.ampm = momentModel.format('A');
	};
	$scope.changeMinute = function(val) {
		var momentModel = DateService.getDate(ngModelCtrl.$modelValue);

		momentModel.minute(val);
		ngModelCtrl.$setViewValue(momentModel.format(dateFormat));
		ngModelCtrl.$render();
	};
	$scope.changeAMPM = function() {
		var momentModel = DateService.getDate(ngModelCtrl.$modelValue);
		
		if (momentModel.format('A') === 'AM') {
			momentModel.add(12, 'hours');
		}
		else {
			momentModel.subtract(12, 'hours');
		}

		ngModelCtrl.$setViewValue(momentModel.format(dateFormat));
		ngModelCtrl.$render();

		$scope.ampm = momentModel.format('A');
	};

	return this;	
}])

.directive('liDatepicker', ['DateService', function(DateService) {
	'use strict';
	return {
		require: ['liDatepicker','ngModel'],
		controller: 'DateDropdownController',
		scope: true,
		link: function(scope, element, attrs, controllers) {
			controllers[0].init(element, controllers, attrs);
			return this;
		}
	};
}])

.directive('liDateDropdown', [function() {
	'use strict';
	return {
		templateUrl: 'views/fields/date/field-date-dropdown.html',
		//require: ['smbFieldDateDropdown', '^smbFieldDate'],
		//controller: 'DateDropdownController',
		link: function(scope, element, attrs, controllers) {
			//controllers[0].init(element, controllers);
			//return this;
		}
	};
}])

.directive('liDateYearPicker', ['DateService', function(DateService) {
	'use strict';
	return {
		templateUrl: 'views/fields/date/field-date-yearpicker.html',
		link: function(scope, element, attrs, controllers) {
			var currentIndex = 0;
			var currentYear;

			if (moment.isMoment(scope.getCurrentDate()) && scope.getCurrentDate().isValid()) {
				currentYear = moment(scope.getCurrentDate()).clone();
			}
			else {
				currentYear = moment();
			}

			scope.years = DateService.buildYearsAroundCurrent(currentYear);

			scope.yearNextPage = function() {
				currentIndex = currentIndex + 1;
				scope.years = DateService.buildYearsAroundCurrent(currentYear.clone().add(currentIndex*9, 'years'));
			};

			scope.yearPrevPage = function() {
				currentIndex = currentIndex - 1;
				scope.years = DateService.buildYearsAroundCurrent(currentYear.clone().add(currentIndex*9, 'years'));
			};
		}
	};
}])

;
angular.module('angular-lightning.picklist', [])

.service('PicklistService', [function() {
	'use strict';
	return {
		/**
		* Gets an array from a delimited list of values, since in salesforce they're stored in comma separated lists
		**/
		getArrayFromDelimted: function(values) {
			return values.split(';');
		}
	};
}])

.controller('liPicklistController', ['$scope', function($scope) {
	'use strict';
	var element, modelCtrl;

	var ModelObj = function(val) {
		this.value = val;
		this.selected = false;
		this.uid = _.uniqueId('p_');
		return this;
	}

	$scope.selected = [];

	this.init = function(_scope, _element, _attrs, controllers) {
		element = _element;
		modelCtrl = controllers[1];

		$scope.options = _.map($scope.options, function(val, key) {
				return new ModelObj(val);
		});

		modelCtrl.$render = function() {
			if (modelCtrl.$modelValue) {
				if (modelCtrl.$modelValue.indexOf(';') > -1) {
				    //$scope.selected = modelCtrl.$modelValue.split(';');
						var temp = _.map(modelCtrl.$modelValue.split(';'), function(val, key) {
								return new ModelObj(val);
						});

						var toMove = _.filter($scope.options, function(o) {
								return _.findWhere(temp, {value: o.value}) !== undefined;
						});

						$scope.selected = $scope.selected.concat(toMove);

				}
				else {
					$scope.selected = [];
					$scope.selected.push(modelCtrl.$modelValue);
				}
				reconcileValues();
			}
		};
	};

	$scope.highlightOption = function(option) {
		var index = _.indexOf($scope.highlightedToAdd, option);

		if (index === -1) {
			$scope.highlightedToAdd.push(option);
		} else {
			$scope.highlightedToAdd.splice(index, 1);
		}
	}

	$scope.areOptionsHighlighted = function() {
		return _.where($scope.options, {selected: true}).length > 0;
	}

	$scope.areSelectedHighlighted = function() {
		return _.where($scope.selected, {selected: true}).length > 0;
	}

	$scope.selectHighlighted = function() {
			//$scope.selected = $scope.highlightedToAdd.concat($scope.selected);
			var toMove = _.where($scope.options, {selected: true});
			$scope.selected = $scope.selected.concat(toMove);
			reconcileValues();
			//$scope.highlightedToAdd = [];
	}

	$scope.removeHighlighted = function() {
		//var thingsToKeep = _.difference($scope.selected, $scope.highlightedToRemove);
		var toMove = _.where($scope.selected, {selected: true});
		//$scope.selected = _.without($scope.selected, toMove);
		$scope.selected = _.filter($scope.selected, function(opt) {
				return _.find(toMove, opt) === undefined;
		});
		$scope.options = $scope.options.concat(toMove);

		reconcileValues();
	}

	var reconcileValues = function() {
		// get the diff
		//var diff = _.difference($scope.options, $scope.selected);
		var diff = _.filter($scope.options, function(opt) {
				return _.find($scope.selected, opt) === undefined;
		});
		$scope.options = [];
		_.each(diff, function(d) {
			$scope.options.push(d);
		});
		$scope.highlighted = [];
	};

	$scope.$watchCollection('selected', function(newVals, oldVals) {
		if(newVals) {
			modelCtrl.$setViewValue(_.pluck(newVals, 'value').join(';'));
		}
	});
}])

.directive('liPicklist', [function() {
	'use strict';
	return {
		scope: {
			options: '='
		},
		controller: 'liPicklistController',
		templateUrl: 'views/fields/field-picklist.html',
		require: ['liPicklist', 'ngModel'],
		link: function(scope, element, attrs, controllers) {
			var picklistController;

			if(controllers.length > 0) {
				picklistController = controllers[0];
			}

			if(picklistController) {
				picklistController.init(scope, element, attrs, controllers);
			}
		}
	};
}]);

angular.module('angular-lightning.lookup', [])

.factory('liLookupParser', ['$parse', function($parse) {
	var TYPEAHEAD_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;
    return {
      parse: function(input) {
        var match = input.match(TYPEAHEAD_REGEXP);
        if (!match) {
          throw new Error(
            'Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_"' +
              ' but got "' + input + '".');
        }

        return {
          itemName: match[3],
          source: $parse(match[4]),
          viewMapper: $parse(match[2] || match[1]),
          modelMapper: $parse(match[1])
        };
      }
    };
}])

.controller('liLookupController', ['$compile', '$parse', '$q', '$timeout', 'liLookupParser', function($compile, $parse, $q, $timeout, lookupParser) {
	'use strict';
	this.init = function(_scope, _element, _attrs, controllers) {
		var scope, element, attrs, modelCtrl;
		element = _element;
		scope = _scope.$new();
		attrs = _attrs;
		modelCtrl = controllers[1];

		scope.objectName = attrs.objectName;
		scope.matches = [];
		scope.selected = null;
		scope.isFocused = false;
		scope.dropdownFields = [];

		if (attrs.dropdownFields && JSON.parse(attrs.dropdownFields).length > 0) {
			scope.dropdownFields = JSON.parse(attrs.dropdownFields);
		}

		//Set object to model
		var parsedModel = $parse(attrs.ngModel);
	    var $setModelValue = function(scope, newValue) {
	      return parsedModel.assign(scope, newValue);
	    };

		// parse the expression the user has provided for what function/value to execute
		var parsedExpression = lookupParser.parse(attrs.liLookup);

		// create a listener for typing
		element.bind('keyup', function(event) {
			// when the deferred given to us by the expression resolves, we'll loop over all the results and put them into the matches scope var which 
			// has been handed down to the dropdown directive
			// we need to give the current model value to the functoin we're executing as a local
			var locals = {
				$viewValue: modelCtrl.$viewValue
			};

			$q.when(parsedExpression.source(scope, locals)).then(function(results) {
				scope.matches.length = 0;
				_.each(results, function(result) {
					locals[parsedExpression.itemName] = result;
					scope.matches.push({
						label: parsedExpression.viewMapper(scope, locals),
						model: result
					});
				});

				scope.currentVal = modelCtrl.$viewValue;
			});
		});


		//This is what sets the label on the input!
		modelCtrl.$formatters.push(function(modelValue) {
			var candidateViewValue, emptyViewValue;
	        var locals = {};

			locals[parsedExpression.itemName] = modelValue;
	        candidateViewValue = parsedExpression.viewMapper(scope, locals);
	        locals[parsedExpression.itemName] = undefined;
	        emptyViewValue = parsedExpression.viewMapper(scope, locals);

	        return candidateViewValue !== emptyViewValue ? candidateViewValue : modelValue;
		});

		//Make sure model is always an object
		modelCtrl.$parsers.push(function(value) {
			if (typeof value !== 'object') {
				return null;
			}
		});

		// create ui elements for the dropdown
		var dropdownElem = angular.element('<div li-lookup-dropdown></div>');
		dropdownElem.attr({
			matches: 'matches',
			'current-val': 'currentVal',
			'the-object': 'objectName',
			'dropdown-fields': 'dropdownFields',
			select: 'select(idx)'
		});

		// compile the ui element
		var dropdownDomElem = $compile(dropdownElem)(scope);

		element.bind('focus', function() {
			// insert it into the dom
			scope.currentVal = modelCtrl.$viewValue;
			scope.$digest();
			$(dropdownDomElem).show();
			$(element).parents('.slds-lookup').append(dropdownDomElem);
		});

		$(document).on('click', function (event) {
			if (!dropdownDomElem[0].contains(event.target) && !$(event.target).is($(element))) {
				$(dropdownDomElem).hide();
			}
		});

		scope.select = function(idx) {
			var locals = {};
			var model, item;

			locals[parsedExpression.itemName] = item = scope.matches[idx].model;
      		model = parsedExpression.modelMapper(scope, locals);
			$setModelValue(scope, model);

			scope.matches = [];
		};
	};

}])

.directive('liLookup', [function() {
	'use strict';
	return {
		controller: 'liLookupController',
		require: ['liLookup', 'ngModel'],
		link: function(scope, element, attrs, controllers) {
			var lookupController;

			if(controllers.length > 0) {
				lookupController = controllers[0];
			}

			if(lookupController) {
				lookupController.init(scope, element, attrs, controllers);
			}
		}	
	};
}])

.directive('liLookupDropdown', [function() {
	'use strict';
	return {
		templateUrl: 'views/fields/lookup/lookup-dropdown.html',
		scope: {
			matches: '=',
			currentVal: '=',
			theObject: '=',
			dropdownFields: '=',
			select: '&'
		},
		replace: true,
		link: function(scope, element, attrs) {
			scope.selectMatch = function(idx) {
				scope.select({idx: idx});
			};

			scope.getField = function(obj, field) {
				//Check if field is a relationship
				if (field.indexOf('.') > -1) {
					var objs = field.split('.');

					for (var i=0;i<objs.length;i++) {
						var k = objs[i];
						obj = obj[k];
					}

					return obj;
				}
				else {
					return obj[field];
				}
			};
		}
	};
}]);
angular.module('angular-lightning.wysiwyg', [])

.controller('liWysiwygController', ['$scope', function($scope) {
	'use strict';
	var modelCtrl;
	$scope.wysiwygId = 'uniqueId';
	$scope.content = 'Demo Content';

	this.init = function(_scope, _element, _attrs, controllers) {
		var attrs = _attrs;
		modelCtrl = controllers[1];
		
		modelCtrl.$render = function() {
			if (modelCtrl.$modelValue) {
				_scope.content = modelCtrl.$modelValue;
				// var elem = $('trix-editor[input="'+$scope.wysiwygId+'"')[0];
				// if (elem) {
				// 	elem.editor.loadHTML(modelCtrl.$modelValue);
				// }
			}
		};

		_scope.wysiwygId = attrs.wysiwygId;
	};

	$(document).bind("trix-change", function(event) {
		if ($(event.target).is($('trix-editor[input="'+$scope.wysiwygId+'"'))) {
			var elem = $('trix-editor[input="'+$scope.wysiwygId+'"')[0];
			modelCtrl.$setViewValue($(elem).val());
		}
	});
}])

.directive('liWysiwyg', [function() {
	'use strict';
	return {
		templateUrl: 'views/fields/field-wysiwyg.html',
		require: ['liWysiwyg', 'ngModel'],
		controller: 'liWysiwygController',
		link: function(scope, element, attrs, controllers) {
			var wysiwygController = controllers[0];
			wysiwygController.init(scope, element, attrs, controllers);
		}
	};
}]);
angular.module('angular-lightning.icon', [])

.value('iconConfig', {
	iconUrl: 'assets/icons/'
})

.directive('liIcon', ['iconConfig', function(iconConfig) {
	'use strict';
	return {
		templateUrl: 'views/util/icon.html',
		scope: {

		},
		replace: true,
		link: function(scope, element, attrs) {
			var options = _.defaults({
				type: attrs.type,
				icon: attrs.icon,
				size: attrs.size,
				color: attrs.color,
				classes: attrs.addClasses,
				noDefaultIcon: attrs.noDefaultIcon
			}, {
				type: 'action',
				icon: 'opportunity',
				size: '',
				classes: '',
				noDefaultIcon: false
			});

			scope.options = options;

			var url = iconConfig.iconUrl;
			
			var classes = [];

			var svgElement = $(element).find('svg');

			var useElement = $(element).find('use');

			var newRef = iconConfig.iconUrl + options.type + '-sprite/svg/symbols.svg#' + options.icon;
			$(useElement).attr('xlink:href', newRef);

			if(options.type === 'action') {
				$(element).addClass('slds-icon__container--circle slds-media__figure');
			}
		
			// todo .. make this just append the slds-icon-text-[whatever color]
			if(options.color) {
				if(options.color === 'warning') {
					classes.push('slds-icon-text-warning');
				}
				else if(options.color === 'default') {
					classes.push('slds-icon-text-default');	
				}
				else if(options.color === 'success') {
					classes.push('slds-icon-text-success');
				}
			}
			else {
				//classes.push('slds-icon-text-default');	
			}
			

			// apply the color and style w/ icon specific class
			// if its a icon like new_custom4 we need the class to be new-custom-4 but the iconpath will be the un-changed new_custom4 (stupid!)
			var adjustedClass = options.icon.replace(/([A-Z]+)(_.*?)*(\d*)/ig, function(match, p1, p2, p3) {
				if(p3) {
					// we have a digit, so we'll concat p1 and p3
					return p1 + '-' + p3;
				}
				else if(p2) {
					return p1 + '-';
				}
				else {
					return match;
				}
			});

			var colorclass = 'slds-icon-' + options.type + '-' + adjustedClass;
			if(options.type !== 'utility') {
				$(element).addClass(colorclass);
				//classes.push(colorclass);
			}
			else {
				//$(svgElement).addClass('slds-icon');
				
			}

			// always add 
			if(!options.noDefaultIcon) {
				classes.push('slds-icon');	
			}
			
			// if(options.inputIcon) {
			// 	classes.push('slds-input__icon');
			// }
			if(options.classes) {
				classes = classes.concat(options.classes.split(' '));
			}
			
			// push size
			//classes.push('slds-icon--small');
			if(options.size === 'large') {
				classes.push('slds-icon--large');
			}
			else if(options.size === 'small') {
				classes.push('slds-icon--small');
			}
			else if(options.size === 'x-small') {
				classes.push('slds-icon--x-small');
			}

			scope.classes = classes.join(' ');


		}
	};
}]);
angular.module('angular-lightning.modal', [])

/**
* The service is responsible for creating the modal on the document... can in the future put things here to manage multiple modals etc.
**/
.factory('liModalService', ['$rootScope', '$compile', function($rootScope, $compile) {
	'use strict';
	var modal = null;
	var modalBackdrop = null;

	// this we should allow to be passed in so we can augment an existing scope
	var modalScope = null;

	var $modalService = {
		// some properties here
	};

	$modalService.open = function(options) {
		// append to dom here
		var modalEl = angular.element('<div li-modal></div>');
		
		modalScope = (options.scope || $rootScope).$new();

		// allow extension of the modal scope with a resolve option
		if(options.resolve) {
			_.extend(modalScope, options.resolve);
		}

		// add a standard close function
		modalScope.close = function() {
			modal.remove();
			modalBackdrop.remove();
			modalScope.$destroy();
		};

		modalEl.attr({
			'template-url': options.templateUrl
		});
		modal = $compile(modalEl)(modalScope);

		var modalElBackdrop = angular.element('<div class="slds-backdrop slds-backdrop--open"></div>');
		modalBackdrop = $compile(modalElBackdrop)(modalScope);

		// append the backdrop first
		$("body").append(modalBackdrop);

		// then the modal
		$("body").append(modal);
	};

	$modalService.close = function() {
		modal.remove();
		modalBackdrop.remove();
		modalScope.$destroy();
	};

	return $modalService;
}])

.directive('liModal', [function() {
	'use strict';
	return {
		templateUrl: function(tElem, tAttrs) {
			return tAttrs.templateUrl || 'views/util/modal.html';
		},
		link: function(scope, elem, attrs) {
			
		}
	}
}])

.provider('liModal', function() {
	'use strict';
	var $modalProvider = {
		options: {

		},
		$get: ['liModalService', function(liModalService) {
			var $modal = {};

			$modal.open = function(options) {
				liModalService.open(options);
			};

			$modal.close = function() {
				liModalService.close();
			};

			return $modal;
		}]
	}

	return $modalProvider;
});
angular.module('angular-lightning.tooltip', [])

	.directive('liTooltip', ['$compile', '$templateRequest', function($compile, $templateRequest) {
		'use strict';
		return {
			link: function(scope, element, attrs) {
				
				var templateUrl;
				var scope = scope.$new();

				var tooltipContent = attrs.liTooltip;
				scope.templateUrl = attrs.template || null;
				var enabledExpression = attrs.tooltipEnabled || 'always';
				var position = attrs.tooltipPosition || 'right';

				var template = '<div class="slds-tooltip" role="tooltip">' + 
					'<div class="slds-tooltip__content">' + 
				    	'<div class="slds-tooltip__body">' + 
				    		tooltipContent + 
				    	'</div>' +
				  	'</div>' + 
				'</div>';

				if(scope.templateUrl) {
					template = '<div class="slds-tooltip" role="tooltip">' + 
						'<div class="slds-tooltip__content">' + 
					    	'<div class="slds-tooltip__body" ng-include="getTemplateUrl()">' +  
					    	'</div>' +
					  	'</div>' + 
					'</div>';
				}

				scope.getTemplateUrl = function() {
					if(scope.templateUrl) {
						return scope.templateUrl;
					}
				};

				var tooltipElement = $compile(template)(scope);

				var showTooltip = function() {
					if(!checkIfTooltipShown()) {
						return false;
					}

					var pos = $(element).offset();
					
					
					$('body').append(tooltipElement);
					$(tooltipElement).hide();

					var top = pos.top - ($(tooltipElement).height() / 2) + 5;
					$(tooltipElement).css({
						position: 'absolute',
						top: top + 'px',
					});

					var width = $(element).outerWidth();
					var left = pos.left + width + 20;
					var right = pos.left - $(tooltipElement).outerWidth() - 20;

					//Check if element is inside viewport, if not, show on left side
					if (position === 'right' && (left + width) <= (window.pageXOffset + window.innerWidth)) {
						$(tooltipElement).css({left: left + 'px'});
						$(tooltipElement).addClass('slds-nubbin--left');
					}
					else {
						$(tooltipElement).css({left: right + 'px'});
						$(tooltipElement).addClass('slds-nubbin--right');
					}

					$(tooltipElement).show();
					
				};	
				var removeTooltip = function() {
					//todo: destroy the scope and any other cleanup
					tooltipElement.remove();
				};

				var checkIfTooltipShown = function() {	
					if(enabledExpression === 'always') {
						return true;
					}
					return scope.$eval(enabledExpression);
				};

				$(element).mouseover(function(e) {
					e.stopPropagation();
					showTooltip();
				}).mouseout(function(e) {
					e.stopPropagation();
					removeTooltip();
				});

			}
		};		
	}]);
angular.module('angular-lightning.tabs', [])

.controller('liTabsetController', ['$scope', function ($scope) {
	'use strict';
	var ctrl = this, tabs = ctrl.tabs = $scope.tabs = [];

	ctrl.select = function(selectedTab) {
		angular.forEach(tabs, function(tab) {
			if (tab.active && tab !== selectedTab) {
				tab.active = false;
				tab.onDeselect();
				selectedTab.selectCalled = false;
			}
		});
		selectedTab.active = true;
		
		if (!selectedTab.selectCalled) {
			selectedTab.onSelect();
			selectedTab.selectCalled = true;
		}
	};

	ctrl.addTab = function addTab(tab) {
		tabs.push(tab);
		// we can't run the select function on the first tab
		// since that would select it twice
		if (tabs.length === 1 && tab.active !== false) {
		  tab.active = true;
		} else if (tab.active) {
		  ctrl.select(tab);
		} else {
		  tab.active = false;
		}
	};

	ctrl.removeTab = function removeTab(tab) {
		var index = tabs.indexOf(tab);
		
		if (tab.active && tabs.length > 1 && !destroyed) {
		  var newActiveIndex = index === tabs.length - 1 ? index - 1 : index + 1;
		  ctrl.select(tabs[newActiveIndex]);
		}
		tabs.splice(index, 1);
	};

	var destroyed;
	$scope.$on('$destroy', function() {
		destroyed = true;
	});
}])

.directive('liTabset', function() {
	'use strict';
	return {
		transclude: true,
		replace: true,
		scope: {
			type: '@'
		},
		controller: 'liTabsetController',
		templateUrl: 'views/util/tabset.html',
		link: function(scope, element, attrs) {
			scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
		    scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
		}
	};
})

.directive('liTab', ['$parse', function($parse) {
	'use strict';
	return {
		require: '^liTabset',
		replace: true,
		templateUrl: 'views/util/tab.html',
		transclude: true,
		scope: {
		  active: '=?',
		  heading: '@',
		  onSelect: '&select',
		  onDeselect: '&deselect'
		},
		controller: function() {

		},
		controllerAs: 'tab',
		link: function(scope, elm, attrs, tabsetCtrl, transclude) {
			scope.$watch('active', function(active) {
				if (active) {
				    tabsetCtrl.select(scope);
				}
			});

			scope.disabled = false;

			if (attrs.disable) {
				scope.$parent.$watch($parse(attrs.disable), function(value) {
				    scope.disabled = !! value;
				});
			}

			if (attrs.activeFirst) {
				scope.active = true;
			}

			scope.select = function() {
				if (!scope.disabled) {
				    scope.active = true;
				}
			};

			tabsetCtrl.addTab(scope);

			scope.$on('$destroy', function() {
		        tabsetCtrl.removeTab(scope);
		    });

			scope.$transcludeFn = transclude;
		}
	};
}])

.directive('liTabHeadingTransclude', function() {
	'use strict';
	return {
	restrict: 'A',
	require: '^liTab',
	link: function(scope, elm) {
		scope.$watch('headingElement', function updateHeadingElement(heading) {
			if (heading) {
			    elm.html('');
			    elm.append(heading);
			}
		});
	}
	};
})

.directive('liTabContentTransclude', function() {
	'use strict';
	return {
		restrict: 'A',
		require: '^liTabset',
		link: function(scope, elm, attrs) {
		  var tab = scope.$eval(attrs.liTabContentTransclude);

		  tab.$transcludeFn(tab.$parent, function(contents) {
		    angular.forEach(contents, function(node) {
		      if (isTabHeading(node)) {
		        //Let tabHeadingTransclude know.
		        tab.headingElement = node;
		      } else {
		        elm.append(node);
		      }
		    });
		  });
		}
	};

	function isTabHeading(node) {
		return node.tagName && (
		  node.hasAttribute('li-tab-heading') ||
		  node.hasAttribute('data-li--tab-heading') ||
		  node.hasAttribute('x-li--tab-heading') ||
		  node.tagName.toLowerCase() === 'li--tab-heading' ||
		  node.tagName.toLowerCase() === 'data-li--tab-heading' ||
		  node.tagName.toLowerCase() === 'x-li--tab-heading'
		);
	}
});
angular.module('angular-lightning.progress', [])

	.directive('liProgressbar', [function() {
		'use strict';
		return {
			templateUrl: 'views/util/progressbar.html',
			scope: {
				value: '=',
				nobadge: '@'
			},
			link: function(scope, element, attrs) {
				if(_.has(attrs, 'minimal')) {
					scope.minimal = true;
				}

				scope.getValue = function() {
					var val = scope.value || 0;
					return (val < 100) ? Math.round(val / 100 * 100) : 100;
				}
			}
		};
	}]);

angular.module('angular-lightning.sticky', [])

.directive('liSticky', ['$compile', function($compile) {
	'use strict';
	return {
		scope: {
			liAbove: '@'
		},
		link: function(scope, element, attrs) {
			var originalWidth = $(element).width();

			// put a "ghost" element to retain width tracking of the parent
			var ghostE = "<div></div>";
			var ghost = $compile(ghostE)(scope);

			$(ghost).css({
				'width' : originalWidth
			});

			$(element).after(ghost);

			$(element).css({
				'position': 'fixed',
				'width': originalWidth
			});

			// this can be configurable
			$(element).addClass("slds-scrollable--y").addClass("sticky-container");

			$(window).resize(function() {
				$(element).css({
					width: $(ghost).width()
				});
			});

			// scrolling stuff and vert resize
			var aside = $(element).parents('aside');

			var resize = function(adj) {
				var headerHeight = $(".slds-page-header").outerHeight();
				if(adj) {
					headerHeight = headerHeight - adj;
				}
				if(scope.autoHeight) {
	   				$(element).css({height: $(window).height()-headerHeight});
	   			}
			};

			// bind the window resize event to recalculate the height
			
			$(window).resize(resize);
			resize();
		


			// this will make the affixed nav scroll down to eliminate the gap above it until it clears it
			var scrollPosition = function() {
				if(scope.liAbove) {
					var aboveElement = $(scope.liAbove);
					var gap = aboveElement.outerHeight();
					var scrollPos = $(window).scrollTop();
					if(scrollPos < gap) {
						$(element).css({marginTop: 0-scrollPos});
						resize(scrollPos);
					}
					else {
						$(element).css({marginTop: 0-gap});
						if(scope.autoHeight) {
							$(element).css({height: $(window).height()});
						}

					}
				}
				
			};

			$(window).scroll(scrollPosition);
			$(window).bind('gesturechange', scrollPosition);
			scrollPosition();
		}
	}
}]);
angular.module('angular-lightning.popover', [])

	.directive('liPopover', ['$compile', '$templateRequest', '$document', function($compile, $templateRequest, $document) {
		'use strict';
		return {
			link: function(scope, element, attrs) {
				
				var popoverElement;
				var clickOpenHandler;
				var clickClosedHandler;
				var scope = scope.$new();
				var templateUrl = attrs.templateUrl || 'views/util/popover.html';
				scope.isOpen = false;
				var position = attrs.position || 'top';

				var closeTooltip = function() {
					scope.isOpen = false;
					popoverElement.remove();
				}

				

				var showTooltip = function() {
					
					scope.isOpen = true;
					if(templateUrl) {
						$templateRequest(templateUrl).then(function(template) {
							popoverElement = $compile(template)(scope);

							$('body').append(popoverElement);

							var pos = $(element).offset();
							
							if(position == 'top') {
								var top = pos.top - ($(popoverElement).outerHeight()) - 15;
								var leftPos = pos.left - ($(popoverElement).width() / 2) + ($(element).outerWidth() / 2);
							}
							else if(position == 'left') {
								var top = pos.top - ($(popoverElement).outerHeight() / 2) + $(element).outerHeight() /2;
								var leftPos = pos.left - $(popoverElement).outerWidth();	
							}
							
							$(popoverElement).css({
								position: 'absolute',
								top: top,
								left: leftPos
							});

							// add 'nubbin'
							if(position == 'top') {
								$(popoverElement).addClass('slds-nubbin--bottom');	
							}
							else if(position == 'left') {
								$(popoverElement).addClass('slds-nubbin--right');
							}
							

							
						});
					}
					
					
				}


				function toggleTooltip() {
					if(!scope.isOpen) {
						showTooltip();
					}
					else {
						closeTooltip();
					}
					
				}

				element.on('click', toggleTooltip);

			}
		};		
	}]);
angular.module('angular-lightning').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/demo/boilerplate/content.html',
    "<!-- wrap the main grid with .slds-grid --> <content class=\"slds-grid slds-wrap slds-p-top--small\"> <!-- each column here --> <div class=\"slds-col--padded slds-size--1-of-1 slds-medium-size--1-of-2\"> <!-- example card --> <div class=\"slds-card\"> <div class=\"slds-card__header slds-grid\"> <div class=\"slds-media slds-media--center slds-has-flexi-truncate\"> <div class=\"slds-media__figure\"> <svg aria-hidden=\"true\" class=\"slds-icon slds-icon-standard-contact slds-icon--small\"> <use xlink:href=\"/assets/icons/standard-sprite/svg/symbols.svg#contact\"></use> </svg> </div> <div class=\"slds-media__body\"> <h2 class=\"slds-text-heading--small slds-truncate\">Card Header (2)</h2> </div> </div> <div class=\"slds-no-flex\"> <div class=\"slds-button-group\"> <button class=\"slds-button slds-button--neutral slds-button--small\">Button</button> <button class=\"slds-button slds-button--icon-border-filled slds-toggle-visibility\"> <svg aria-hidden=\"true\" class=\"slds-button__icon\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#down\"></use> </svg> <span class=\"slds-assistive-text\">Show More</span> </button> </div> </div> </div> <div class=\"slds-card__body\"> <table class=\"slds-table slds-table--bordered slds-max-medium-table--stacked-horizontal slds-no-row-hover\"> <thead> <tr> <th class=\"slds-text-heading--label slds-size--1-of-4\" scope=\"col\">Name</th> <th class=\"slds-text-heading--label slds-size--1-of-4\" scope=\"col\">Company</th> <th class=\"slds-text-heading--label slds-size--1-of-4\" scope=\"col\">Title</th> <th class=\"slds-text-heading--label slds-size--1-of-4\" scope=\"col\">Email</th> <th class=\"slds-row-action\" scope=\"col\"> <button class=\"slds-button slds-button--icon-border-filled slds-button--icon-x-small\"> <svg aria-hidden=\"true\" class=\"slds-button__icon slds-button__icon--hint slds-button__icon--small\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#down\"></use> </svg> <span class=\"slds-assistive-text\">Show More</span> </button> </th> </tr> </thead> <tbody> <tr class=\"slds-hint-parent\"> <td class=\"slds-size--1-of-4\" data-label=\"Name\">Adam Choi</td> <td class=\"slds-size--1-of-4\" data-label=\"Company\">Company One</td> <td class=\"slds-size--1-of-4\" data-label=\"Title\">Director of Operations</td> <td class=\"slds-size--1-of-4\" data-label=\"Email\">adam@company.com</td> <td> <button class=\"slds-button slds-button--icon-border-filled slds-button--icon-x-small\"> <svg aria-hidden=\"true\" class=\"slds-button__icon slds-button__icon--hint slds-button__icon--small\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#down\"></use> </svg> <span class=\"slds-assistive-text\">Show More</span> </button> </td> </tr> <tr class=\"slds-hint-parent\"> <td class=\"slds-size--1-of-4\" data-label=\"Name\">Adam Choi</td> <td class=\"slds-size--1-of-4\" data-label=\"Company\">Company One</td> <td class=\"slds-size--1-of-4\" data-label=\"Title\">Director of Operations</td> <td class=\"slds-size--1-of-4\" data-label=\"Email\">adam@company.com</td> <td> <button class=\"slds-button slds-button--icon-border-filled slds-button--icon-x-small\"> <svg aria-hidden=\"true\" class=\"slds-button__icon slds-button__icon--hint slds-button__icon--small\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#down\"></use> </svg> <span class=\"slds-assistive-text\">Show More</span> </button> </td> </tr> <tr class=\"slds-hint-parent\"> <td class=\"slds-size--1-of-4\" data-label=\"Name\">Adam Choi</td> <td class=\"slds-size--1-of-4\" data-label=\"Company\">Company One</td> <td class=\"slds-size--1-of-4\" data-label=\"Title\">Director of Operations</td> <td class=\"slds-size--1-of-4\" data-label=\"Email\">adam@company.com</td> <td> <button class=\"slds-button slds-button--icon-border-filled slds-button--icon-x-small\"> <svg aria-hidden=\"true\" class=\"slds-button__icon slds-button__icon--hint slds-button__icon--small\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#down\"></use> </svg> <span class=\"slds-assistive-text\">Show More</span> </button> </td> </tr> </tbody> </table> </div> <div class=\"slds-card__footer\"><a href=\"#\">View All <span class=\"slds-assistive-text\">entity type</span></a></div> </div> <!-- end example card --> </div> <!-- end first column --> <!-- start second column --> <div class=\"slds-col--padded slds-size--1-of-1 slds-medium-size--1-of-2\"> <div class=\"slds-scrollable--x\"> <table class=\"slds-table slds-table--bordered\"> <thead> <tr class=\"slds-text-heading--label\"> <th class=\"slds-row-select\" scope=\"col\"> <label class=\"slds-checkbox\" for=\"select-all\"> <input name=\"checkbox\" type=\"checkbox\" id=\"select-all\"> <span class=\"slds-checkbox--faux\"></span> <span class=\"slds-form-element__label slds-assistive-text\">select all</span> </label> </th> <th class=\"slds-is-sortable\" scope=\"col\"> <span class=\"slds-truncate\">Opportunity Name</span> <button class=\"slds-button slds-button--icon-bare\"> <svg aria-hidden=\"true\" class=\"slds-button__icon slds-button__icon--small\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#arrowdown\"></use> </svg> <span class=\"slds-assistive-text\">Sort</span> </button> </th> <th scope=\"col\"> <span class=\"slds-truncate\">Account Name</span> </th> <th scope=\"col\"> <span class=\"slds-truncate\">Close Date</span> </th> <th scope=\"col\"> <span class=\"slds-truncate\">Stage</span> </th> <th scope=\"col\"> <span class=\"slds-truncate\">Confidence</span> </th> <th scope=\"col\"> <span class=\"slds-truncate\">Amount</span> </th> <th scope=\"col\"> <span class=\"slds-truncate\">Contact</span> </th> <th class=\"slds-row-action\" scope=\"col\"> <button class=\"slds-button slds-button--icon-border-filled slds-button--icon-x-small\"> <svg aria-hidden=\"true\" class=\"slds-button__icon slds-button__icon--hint slds-button__icon--small\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#down\"></use> </svg> <span class=\"slds-assistive-text\">Show More</span> </button> </th> </tr> </thead> <tbody> <tr class=\"slds-hint-parent\"> <td class=\"slds-row-select\"> <label class=\"slds-checkbox\" for=\"select-row1\"> <input name=\"select-row1\" type=\"checkbox\" id=\"select-row1\"> <span class=\"slds-checkbox--faux\"></span> <span class=\"slds-form-element__label slds-assistive-text\">select row1</span> </label> </td> <th data-label=\"opportunity-name\" role=\"row\"><a href=\"#\" class=\"slds-truncate\">Acme 25</a></th> <td data-label=\"account\"><a href=\"#\" class=\"slds-truncate\">Acme</a></td> <td data-label=\"activity\"> <span class=\"slds-truncate\">4/14/2015</span> </td> <td data-label=\"stage\"> <span class=\"slds-truncate\">Prospecting</span> </td> <td data-label=\"confidence\"> <span class=\"slds-truncate\">20%</span> </td> <td data-label=\"amount\"> <span class=\"slds-truncate\">$25k</span> </td> <td data-label=\"contact\"> <span class=\"slds-truncate\">--</span> </td> <td class=\"slds-row-action\"> <button class=\"slds-button slds-button--icon-border-filled slds-button--icon-x-small\"> <svg aria-hidden=\"true\" class=\"slds-button__icon slds-button__icon--hint slds-button__icon--small\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#down\"></use> </svg> <span class=\"slds-assistive-text\">Show More</span> </button> </td> </tr> <tr class=\"slds-hint-parent\"> <td> <label class=\"slds-checkbox\" for=\"select-row2\"> <input name=\"select-row2\" type=\"checkbox\" id=\"select-row2\"> <span class=\"slds-checkbox--faux\"></span> <span class=\"slds-form-element__label slds-assistive-text\">select row2</span> </label> </td> <th data-label=\"opportunity-name\" role=\"row\"><a href=\"#\" class=\"slds-truncate\">Cloudhub + Anypoint Connectors</a></th> <td data-label=\"account\"><a href=\"#\" class=\"slds-truncate\">Cloudhub</a></td> <td data-label=\"activity\"> <span class=\"slds-truncate\">9/30/2015</span> </td> <td data-label=\"stage\"> <span class=\"slds-truncate\">Closing</span> </td> <td data-label=\"confidence\"> <span class=\"slds-truncate\">90%</span> </td> <td data-label=\"amount\"> <span class=\"slds-truncate\">$40k</span> </td> <td data-label=\"contact\"><a href=\"#\" class=\"slds-truncate\">jrogers@cloudhub.com</a></td> <td class=\"slds-row-action\"> <button class=\"slds-button slds-button--icon-border-filled slds-button--icon-x-small\"> <svg aria-hidden=\"true\" class=\"slds-button__icon slds-button__icon--hint slds-button__icon--small\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#down\"></use> </svg> <span class=\"slds-assistive-text\">Show More</span> </button> </td> </tr> <tr class=\"slds-hint-parent\"> <td> <label class=\"slds-checkbox\" for=\"select-row3\"> <input name=\"select-row3\" type=\"checkbox\" id=\"select-row3\"> <span class=\"slds-checkbox--faux\"></span> <span class=\"slds-form-element__label slds-assistive-text\">select row3</span> </label> </td> <th data-label=\"opportunity-name\" role=\"row\"><a href=\"#\" class=\"slds-truncate\">Rohde Corp 30</a></th> <td data-label=\"account\"><a href=\"#\" class=\"slds-truncate\">Rohde Corp</a></td> <td data-label=\"activity\"> <span class=\"slds-truncate\">6/18/2015</span> </td> <td data-label=\"stage\"> <span class=\"slds-truncate\">Prospecting</span> </td> <td data-label=\"confidence\"> <span class=\"slds-truncate\">40%</span> </td> <td data-label=\"amount\"> <span class=\"slds-truncate\">$30k</span> </td> <td data-label=\"contact\"><a href=\"#\" class=\"slds-truncate\">achoi@rohdecorp.com</a></td> <td class=\"slds-row-action\"> <button class=\"slds-button slds-button--icon-border-filled slds-button--icon-x-small\"> <svg aria-hidden=\"true\" class=\"slds-button__icon slds-button__icon--hint slds-button__icon--small\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#down\"></use> </svg> <span class=\"slds-assistive-text\">Show More</span> </button> </td> </tr> </tbody> </table> </div> </div> <!-- end second column --> </content>"
  );


  $templateCache.put('views/demo/boilerplate/header.html',
    "<div class=\"slds-page-header\" role=\"banner\"> <div class=\"slds-grid\"> <div class=\"slds-col slds-has-flexi-truncate\"> <div class=\"slds-media\"> <div class=\"slds-media__figure\"> <svg aria-hidden=\"true\" class=\"slds-icon slds-icon--large slds-icon-standard-user\"> <use xlink:href=\"/assets/icons/standard-sprite/svg/symbols.svg#user\"></use> </svg> </div> <div class=\"slds-media__body\"> <p class=\"slds-text-heading--label\">Record Type</p> <div class=\"slds-grid\"> <h1 class=\"slds-text-heading--medium slds-m-right--small slds-truncate slds-align-middle\" title=\"Record Title\">Record Title</h1> <div class=\"slds-col slds-shrink-none\"> <button class=\"slds-button slds-button--neutral slds-not-selected\" aria-live=\"assertive\"> <span class=\"slds-text-not-selected\"> <svg aria-hidden=\"true\" class=\"slds-button__icon--stateful slds-button__icon--left\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#add\"></use> </svg>Follow</span> <span class=\"slds-text-selected\"> <svg aria-hidden=\"true\" class=\"slds-button__icon--stateful slds-button__icon--left\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#check\"></use> </svg>Following</span> <span class=\"slds-text-selected-focus\"> <svg aria-hidden=\"true\" class=\"slds-button__icon--stateful slds-button__icon--left\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#close\"></use> </svg>Unfollow</span> </button> </div> </div> </div> </div> </div> <div class=\"slds-col slds-no-flex slds-align-bottom\"> <div class=\"slds-button-group\" role=\"group\"> <button class=\"slds-button slds-button--neutral\">Edit</button> <button class=\"slds-button slds-button--neutral\">Delete</button> <button class=\"slds-button slds-button--neutral\">Clone</button> <div class=\"slds-button--last\"> <button class=\"slds-button slds-button--icon-border-filled\"> <svg aria-hidden=\"true\" class=\"slds-button__icon\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#down\"></use> </svg> <span class=\"slds-assistive-text\">More</span> </button> </div> </div> </div> </div> <div class=\"slds-grid slds-page-header__detail-row\"> <div class=\"slds-col--padded slds-size--1-of-4\"> <dl> <dt> <p class=\"slds-text-heading--label slds-truncate\" title=\"Field 1\">Field 1</p> </dt> <dd> <p class=\"slds-text-body--regular slds-truncate\" title=\"Description that demonstrates truncation with a long text field\">Description that demonstrates truncation with a long text field</p> </dd> </dl> </div> <div class=\"slds-col--padded slds-size--1-of-4\"> <dl> <dt> <p class=\"slds-text-heading--label slds-truncate\" title=\"Field2 (3)\">Field 2 (3) <button class=\"slds-button slds-button--icon-bare\"> <svg aria-hidden=\"true\" class=\"slds-button__icon slds-button__icon--small\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#down\"></use> </svg> <span class=\"slds-assistive-text\">More Actions</span> </button> </p> </dt> <dd> <p class=\"slds-text-body--regular\">Multiple Values</p> </dd> </dl> </div> <div class=\"slds-col--padded slds-size--1-of-4\"> <dl> <dt> <p class=\"slds-text-heading--label slds-truncate\" title=\"Field 3\">Field 3</p> </dt> <dd><a href=\"javascript:void(0)\">Hyperlink</a></dd> </dl> </div> <div class=\"slds-col--padded slds-size--1-of-4\"> <dl> <dt> <p class=\"slds-text-heading--label slds-truncate\" title=\"Field 4\">Field 4</p> </dt> <dd> <p> <span>Description (2-line truncation—must use JS to t...</span> </p> </dd> </dl> </div> </div> </div>"
  );


  $templateCache.put('views/demo/header.html',
    "<header class=\"menu\"> <ul class=\"slds-list--horizontal\"> <li><a href=\"index.html\">Components</a></li> <li><a href=\"boilerplate.html\">Example Layout</a></li> <li><a href=\"https://github.com/mbowen000/angular-lightning\">Github Project</a></li> </ul> </header>"
  );


  $templateCache.put('views/demo/modal-demo.html',
    "<div> <div aria-hidden=\"false\" role=\"dialog\" class=\"slds-modal slds-modal--large slds-fade-in-open\"> <div class=\"slds-modal__container\"> <div class=\"slds-modal__header\"> <h2 class=\"slds-text-heading--medium\">Modal Demo for Angular Lightning</h2> <button class=\"slds-button slds-button--icon-inverse slds-modal__close\" ng-click=\"close()\"> <svg aria-hidden=\"true\" class=\"slds-button__icon slds-button__icon--large\"> <use xlink:href=\"/assets/icons/action-sprite/svg/symbols.svg#close\"></use> </svg> <span class=\"slds-assistive-text\">Close</span> </button> </div> <div class=\"slds-modal__content\"> <div> This is custom content! <br> {{message}} </div> </div> <div class=\"slds-modal__footer\"> <div class=\"slds-x-small-buttons--horizontal\"> <button class=\"slds-button slds-button--neutral\">Cancel</button> <button class=\"slds-button slds-button--neutral slds-button--brand\">Save</button> </div> </div> </div> </div> </div>"
  );


  $templateCache.put('views/demo/tooltip-demo.html',
    "<p> Something Scope value: {{dc.textfield}} </p>"
  );


  $templateCache.put('views/fields/date/field-date-dropdown.html',
    "<div class=\"slds-dropdown slds-dropdown--left slds-datepicker\" aria-hidden=\"false\" data-selection=\"single\"> <div class=\"slds-datepicker__filter slds-grid\"> <div class=\"slds-datepicker__filter--month slds-grid slds-grid--align-spread slds-size--3-of-4\"> <div class=\"slds-align-middle\"> <button class=\"slds-button slds-button--icon-container\" ng-click=\"previousMonth()\"> <span li-icon type=\"utility\" icon=\"left\" size=\"x-small\" color=\"default\"></span> </button> </div> <h2 id=\"month\" class=\"slds-align-middle\" aria-live=\"assertive\" aria-atomic=\"true\">{{month.label}}</h2> <div class=\"slds-align-middle\"> <button class=\"slds-button slds-button--icon-container\" ng-click=\"nextMonth()\"> <span li-icon type=\"utility\" icon=\"right\" size=\"x-small\" color=\"default\"></span> </button> </div> </div> <div class=\"slds-picklist slds-picklist--fluid slds-shrink-none\"> <button id=\"year\" class=\"slds-button slds-button--neutral slds-picklist__label\" aria-haspopup=\"true\" ng-click=\"yearPickerOpen = !yearPickerOpen\">{{month.year}} <span li-icon type=\"utility\" icon=\"down\" size=\"x-small\"></span> </button> </div> </div> <table class=\"datepicker__month\" role=\"grid\" aria-labelledby=\"month\"> <thead> <tr id=\"weekdays\"> <th id=\"Sunday\"> <abbr title=\"Sunday\">S</abbr> </th> <th id=\"Monday\"> <abbr title=\"Monday\">M</abbr> </th> <th id=\"Tuesday\"> <abbr title=\"Tuesday\">T</abbr> </th> <th id=\"Wednesday\"> <abbr title=\"Wednesday\">W</abbr> </th> <th id=\"Thursday\"> <abbr title=\"Thursday\">T</abbr> </th> <th id=\"Friday\"> <abbr title=\"Friday\">F</abbr> </th> <th id=\"Saturday\"> <abbr title=\"Saturday\">S</abbr> </th> </tr> </thead> <tbody> <tr ng-repeat=\"week in month.weeks\"> <td class=\"datepicker-day\" ng-class=\"{ 'slds-disabled-text': !day.inCurrentMonth, 'slds-is-selected': getCurrentDateAsMoment().isSame(day.moment, 'day') }\" role=\"gridcell\" ng-repeat=\"day in week.days\" ng-attr-aria-disabled=\"{{!day.inCurrentMonth}}\" ng-click=\"selectDay(day)\"> <span class=\"slds-day\">{{day.label}}</span> </td> </tr> </tbody> </table> <div class=\"slds-grid\" ng-if=\"showTime\"> <div class=\"slds-col\"> <input type=\"text\" class=\"slds-input\" ng-model=\"hour\" ng-change=\"changeHour(hour)\"> </div> <div class=\"slds-col\"> <input type=\"text\" class=\"slds-input\" ng-model=\"minute\" ng-change=\"changeMinute(minute)\"> </div> <div class=\"slds-col\"> <input type=\"button\" class=\"slds-button slds-button--neutral\" value=\"{{ampm}}\" ng-click=\"changeAMPM()\"> </div> </div> </div>"
  );


  $templateCache.put('views/fields/date/field-date-yearpicker.html',
    "<div class=\"slds-dropdown slds-dropdown--left slds-dropdown--menu li-datepicker-year-dropdown\" ng-if=\"yearPickerOpen\"> <ul class=\"slds-dropdown__list\" role=\"menu\"> <!-- <li id=\"menu-0-0\" href=\"#\" class=\"slds-dropdown__item\"><a href=\"#\" class=\"slds-truncate\" role=\"menuitem\">Menu Item One</a></li>\n" +
    "\t\t<li id=\"menu-1-1\" href=\"#\" class=\"slds-dropdown__item\"><a href=\"#\" class=\"slds-truncate\" role=\"menuitem\">Menu Item Two</a></li>\n" +
    "\t\t<li id=\"menu-2-2\" href=\"#\" class=\"slds-dropdown__item\"><a href=\"#\" class=\"slds-truncate\" role=\"menuitem\">Menu Item Three</a></li> --> <li class=\"slds-dropdown__item\"> <a role=\"menuitem\" ng-click=\"yearPrevPage()\">Earlier</a> </li> <li ng-repeat=\"year in years\" class=\"slds-dropdown__item\" ng-class=\"{ 'slds-has-divider' : $first }\"> <a class=\"slds-truncate\" role=\"menuitem\" ng-click=\"selectYear(year.moment)\">{{year.label}}</a> </li> <li class=\"slds-dropdown__item slds-has-divider\"> <a role=\"menuitem\" ng-click=\"yearNextPage()\">Later</a> </li> </ul> </div>"
  );


  $templateCache.put('views/fields/field-dropdown.html',
    "<div class=\"slds-form-element__control\"> <select id=\"selectSample1\" class=\"slds-select\" ng-options=\"picklistval for picklistval in field.picklistvals\" ng-model=\"field.value\" ng-disabled=\"field.disabled || $parent.$parent.section.state.status === 'pending'\"> </select> </div>"
  );


  $templateCache.put('views/fields/field-picklist.html',
    "<style>.picklist-label {\r" +
    "\n" +
    "  margin: auto;\r" +
    "\n" +
    "  padding: 0px 50px;\r" +
    "\n" +
    "  display: block;\r" +
    "\n" +
    "  text-align: center;\r" +
    "\n" +
    "  font-weight: bold;\r" +
    "\n" +
    "  cursor: default;\r" +
    "\n" +
    "  font-size: 10px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    ".slds-picklist__options {\r" +
    "\n" +
    "  width: initial;\r" +
    "\n" +
    "}</style> <div class=\"slds-picklist--draggable slds-grid\" style=\"display: flex; flex-flow: row wrap\"> <div class=\"slds-form-element\" style=\"flex: 0.5 1 0%\"> <div class=\"slds-picklist slds-picklist--multi\"> <ul class=\"slds-picklist__options slds-picklist__options--multi shown\"> <span class=\"picklist-label\" aria-label=\"select-1\">Available</span> <li draggable=\"true\" id=\"po-0-0\" class=\"slds-picklist__item slds-has-icon slds-has-icon--left\" tabindex=\"0\" role=\"option\" ng-repeat=\"option in options track by $index\" ng-click=\"option.selected = !option.selected\" aria-selected=\"{{option.selected}}\"> <span class=\"slds-truncate\"> <span>{{option.value}}</span> </span> </li> </ul> </div> </div> <div class=\"slds-grid slds-grid--vertical\" style=\"width:45px\"> <button class=\"slds-button slds-button--icon-container\" ng-click=\"selectHighlighted()\" ng-disabled=\"!areOptionsHighlighted()\"> <span li-icon type=\"utility\" icon=\"right\" size=\"x-small\" color=\"default\"></span> </button> <button class=\"slds-button slds-button--icon-container\" ng-click=\"removeHighlighted()\" ng-disabled=\"!areSelectedHighlighted()\"> <span li-icon type=\"utility\" icon=\"left\" size=\"x-small\" color=\"default\"></span> </button> </div> <div class=\"slds-form-element\" style=\"flex: 0.5 1 0%\"> <div class=\"slds-picklist slds-picklist--multi\"> <ul class=\"slds-picklist__options slds-picklist__options--multi shown\"> <span class=\"picklist-label\" aria-label=\"select-2\">Selected</span> <li draggable=\"true\" id=\"po-0-0\" class=\"slds-picklist__item slds-has-icon slds-has-icon--left\" tabindex=\"0\" role=\"option\" ng-repeat=\"option in selected track by $index\" ng-click=\"option.selected = !option.selected\" aria-selected=\"{{option.selected}}\"> <span class=\"slds-truncate\"> <span>{{option.value}}</span> </span> </li> </ul> </div> </div> </div>"
  );


  $templateCache.put('views/fields/field-text.html',
    "<div class=\"slds-form-element__control\"> <input class=\"slds-input\" type=\"text\" placeholder=\"\" ng-model=\"field.value\" name=\"{{field.name}}\" ng-required=\"field.required\" ng-disabled=\"field.disabled || $parent.$parent.section.state.status === 'pending'\"> </div>"
  );


  $templateCache.put('views/fields/field-textarea.html',
    "<textarea class=\"slds-textarea\" rows=\"4\" ng-model=\"field.value\" name=\"{{field.name}}\" ng-required=\"field.required\" ng-disabled=\"field.disabled || $parent.$parent.section.state.status === 'pending'\">"
  );


  $templateCache.put('views/fields/field-wysiwyg.html',
    "<input id=\"{{wysiwygId}}\" ng-value=\"content\" type=\"hidden\"> <trix-editor input=\"{{wysiwygId}}\" class=\"slds-textarea\"></trix-editor>"
  );


  $templateCache.put('views/fields/lookup/lookup-dropdown.html',
    "<div class=\"slds-lookup__menu\" role=\"listbox\"> <table class=\"slds-table slds-table--bordered\" role=\"listbox\"> <thead> <tr> <th colspan=\"{{dropdownFields.length}}\"> <span li-icon type=\"utility\" icon=\"search\" size=\"small\" color=\"default\"></span> &quot;{{currentVal}}&quot; in {{theObject}} </th> </tr> <tr ng-if=\"matches.length > 0\"> <th class=\"slds-text-heading--small\">Name</th> <th class=\"slds-text-heading--small\" ng-repeat=\"field in dropdownFields\">{{field.Label}}</th> </tr> </thead> <tbody> <tr ng-repeat=\"match in matches track by $index\" ng-click=\"selectMatch($index)\" style=\"cursor: pointer\"> <td>{{match.label}}</td> <td ng-repeat=\"field in dropdownFields\">{{getField(match.model, field.Name)}}</td> </tr> </tbody> </table> </div>"
  );


  $templateCache.put('views/header.html',
    "<div class=\"header-inner\" style=\"padding:20px 30px 0px 30px\"> <img src=\"images/sp+.png\"> <h1 class=\"slds-text-heading--large\">Deal Journey</h1> </div>"
  );


  $templateCache.put('views/util/icon.html',
    "<svg aria-hidden=\"true\" ng-class=\"classes\"> <use xlink:href=\"#\"></use> </svg>"
  );


  $templateCache.put('views/util/modal.html',
    "<div> <div aria-hidden=\"false\" role=\"dialog\" class=\"slds-modal slds-fade-in-open\"> <div class=\"slds-modal__container\"> <div class=\"slds-modal__header\"> <h2 class=\"slds-text-heading--medium\">Modal Header</h2> <button class=\"slds-button slds-button--icon-inverse slds-modal__close\" ng-click=\"close()\"> <svg aria-hidden=\"true\" class=\"slds-button__icon slds-button__icon--large\"> <use xlink:href=\"/assets/icons/action-sprite/svg/symbols.svg#close\"></use> </svg> <span class=\"slds-assistive-text\">Close</span> </button> </div> <div class=\"slds-modal__content\"> <div> <p>Sit nulla est ex deserunt exercitation anim occaecat. Nostrud ullamco deserunt aute id consequat veniam incididunt duis in sint irure nisi. Mollit officia cillum Lorem ullamco minim nostrud elit officia tempor esse quis. Cillum sunt ad dolore quis aute consequat ipsum magna exercitation reprehenderit magna. Tempor cupidatat consequat elit dolor adipisicing.</p> <p>Dolor eiusmod sunt ex incididunt cillum quis nostrud velit duis sit officia. Lorem aliqua enim laboris do dolor eiusmod officia. Mollit incididunt nisi consectetur esse laborum eiusmod pariatur proident. Eiusmod et adipisicing culpa deserunt nostrud ad veniam nulla aute est. Labore esse esse cupidatat amet velit id elit consequat minim ullamco mollit enim excepteur ea.</p> </div> </div> <div class=\"slds-modal__footer\"> <div class=\"slds-x-small-buttons--horizontal\"> <button class=\"slds-button slds-button--neutral\">Cancel</button> <button class=\"slds-button slds-button--neutral slds-button--brand\">Save</button> </div> </div> </div> </div> </div>"
  );


  $templateCache.put('views/util/popover.html',
    "<div class=\"slds-popover\" role=\"dialog\"> <div class=\"slds-popover__body\"> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi laudantium molestias reprehenderit nostrum quod natus saepe ea corrupti odit minima?</p> </div> </div>"
  );


  $templateCache.put('views/util/progressbar.html',
    "<div class=\"progress-container slds-grid\"> <span class=\"slds-badge\" ng-if=\"!nobadge\">{{getValue()}}% Complete</span> <div class=\"progressbar slds-col\" title=\"{{value}}%\" ng-class=\"{'success': getValue() === 100}\"> <div class=\"progress\" ng-style=\"{'width': getValue() + '%'}\"></div> </div> </div>"
  );


  $templateCache.put('views/util/tab.html',
    "<li class=\"slds-tabs--scoped__item slds-text-heading--label li-tab\" ng-class=\"{'slds-active': active}\" role=\"presentation\"> <div class=\"slds-tabs--scoped__link\" ng-click=\"select()\" role=\"tab\" li-tab-heading-transclude>{{heading}}</div> </li>"
  );


  $templateCache.put('views/util/tabset.html',
    "<div class=\"slds-tabs--scoped\"> <ul class=\"slds-tabs--scoped__nav\" style=\"margin-bottom:0\" role=\"tablist\" ng-transclude></ul> <div class=\"slds-tabs--scoped__content\" ng-repeat=\"tab in tabs\" ng-class=\"{'slds-show': tab.active, 'slds-hide': !tab.active}\" li-tab-content-transclude=\"tab\"></div> </div>"
  );

}]);
