// this just pulls in all the submodules
angular.module('angular-lightning', [ 
	'angular-lightning.datepicker',
	'angular-lightning.picklist',
	'angular-lightning.icon'
]);
angular.module('angular-lightning.datepicker', [])

.constant('DateConfig', {
	numWeeksShown: 5
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
			return moment(value);
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

.controller('DateDropdownController', ['$scope', '$document', 'DateService', '$compile', function($scope, $document, DateService, $compile) {
	'use strict';

	var self = this;
	var ngModelCtrl, inputEl, $popup, $yearPicker;

	this.init = function(element, controllers) {
		this.controllers = controllers;
		this.element = inputEl = element;
		ngModelCtrl = controllers[2];

		var unwatch = $scope.$watch(function() {
			return ngModelCtrl.$modelValue;
		}, function(val) {
			console.log(val);
			ngModelCtrl.$setViewValue(DateService.getDate(val));
			unwatch();
			_buildCalendar();
		});

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
	
	var _buildCalendar = function() {
		if(ngModelCtrl.$modelValue) {
			$scope.month = DateService.buildMonth(ngModelCtrl.$modelValue);
		}
		else { 
			$scope.month = DateService.buildMonth(moment());
		}

		var popupEl = angular.element('<div smb-field-date-dropdown ng-show="isOpen" ng-click="isOpen = true" class="smb-date-dropdown"></div>');

		$popup = $compile(popupEl)($scope);
		$(inputEl).after($popup);


	};

	$scope.$watch('yearPickerOpen', function(val) {
		if(val) {

			// if its already created then do nothing
			if($yearPicker) {
				return;
			}

			var yearPickerEl = angular.element('<span smb-field-date-year-picker></span>');
			yearPickerEl.attr({
				'current-year' : 'getCurrentDate()'
			});	

			$yearPicker = $compile(yearPickerEl)($scope);
			$($popup).find('#year').after($yearPicker);
		}
	
	});

	$scope.getCurrentDate = function() { 
		return ngModelCtrl.$modelValue;
	};

	$scope.nextMonth = function() {
		var currentStart = $scope.month.currentDate.clone().startOf('month');
		$scope.month = DateService.buildMonth(currentStart.add('1', 'month'));
	};
	$scope.previousMonth = function() {
		var currentStart = $scope.month.currentDate.clone().startOf('month');
		$scope.month = DateService.buildMonth(currentStart.subtract('1', 'month'));
	};
	$scope.selectDay = function(day) {
		ngModelCtrl.$setViewValue(day.moment);
		ngModelCtrl.$render();
	};
	$scope.selectYear = function(year) {
		ngModelCtrl.$setViewValue(year);
		ngModelCtrl.$render();
		$scope.month = DateService.buildMonth(ngModelCtrl.$modelValue);
	};

	return this;	
}])

.directive('liDatepicker', ['DateService', function(DateService) {
	'use strict';
	return {
		require: ['liDatepicker','?^smbFieldDate', 'ngModel'],
		controller: 'DateDropdownController',
		// controller: function($scope) {


		// 	this.init = function(element, controllers) {				
		// 		this.controllers = controllers;
		// 		this.element =  element;
		// 		var ngModelCtrl = controllers[2];

		// 		// turn the date string into a Date object (should turn into moment for future purposes)
		// 		//$scope.field.value = DateService.getDate($scope.field.value);
		// 		// ngModelCtrl.$setViewValue(DateService.getDate(ngModelCtrl.$viewValue));
		// 		var unwatch = $scope.$watch(function() {
		// 			return ngModelCtrl.$modelValue;
		// 		}, function(val) {
		// 			console.log(val);
		// 			ngModelCtrl.$setViewValue(DateService.getDate(val));
		// 			unwatch();
		// 		});
				
		// 	};

		// 	return this;
		// },
		link: function(scope, element, attrs, controllers) {
			controllers[0].init(element, controllers);
			return this;
		}
	};
}])

.directive('smbFieldDateDropdown', [function() {
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

.directive('smbFieldDateYearPicker', ['DateService', function(DateService) {
	'use strict';
	return {
		templateUrl: 'views/fields/date/field-date-yearpicker.html',
		link: function(scope, element, attrs, controllers) {
			var currentIndex = 0;
			var currentYear = scope.getCurrentDate().clone();
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
}]);
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

.controller('liPicklistController', [function() {
	'use strict';
	this.init = function(scope, element) { 
		console.log('init');
		this.element = element;
		this.scope = scope;

		this.reconcileValues();
	};

	this.selectOption = function(option) {
		this.selectedOption = option;
		console.log(this);
	};

	this.reconcileValues = function() {
		var self = this; 1, 2, 3 | 1, 2
		var clone = [];
		_.each(self.scope.options, function(option) {
			if(self.scope.selected.indexOf(option) !== -1) {
				// if its found in the selected list, remove it
				clone = self.scope.options.slice(self.scope.options);
				clone.splice(clone.indexOf(option), 1);
				//newArr = self.scope.options.slice();
			}
		});
		self.scope.options = clone;
	};
}])

.directive('liPicklist', [function() {
	'use strict';
	return {
		scope: {
			options: '=',
			selected: '='
		},
		controller: 'liPicklistController',
		templateUrl: 'views/field-picklist.html',
		require: ['liPicklist'],
		link: function(scope, element, attrs, controllers) {
			var picklistController;

			if(controllers.length > 0) {
				picklistController = controllers[0];
			}

			if(picklistController) {
				picklistController.init(scope, element);
			}
		}	
	};
}]);
angular.module('angular-lightning.icon', []).

directive('liIcon', ['$rootScope', function($rootScope) {
	'use strict';
	return {
		templateUrl: 'views/util/icon.html',
		scope: {

		},
		link: function(scope, element, attrs) {
			var options = _.defaults({
				type: attrs.type,
				icon: attrs.icon,
				size: attrs.size,
				color: attrs.color
			}, {
				type: 'action',
				icon: 'opportunity',
				size: 'small'
			});

			scope.options = options;
			
			var classes = [];

			var svgElement = $(element).find('svg');

			var useElement = $(element).find('use');

			var newRef = 'assets/icons/' + options.type + '-sprite/svg/symbols.svg#' + options.icon;
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
			classes.push('slds-icon');
			
			// push size
			//classes.push('slds-icon--small');
			if(options.size === 'small') {
				classes.push('slds-icon--small');
			}
			if(options.size === 'x-small') {
				classes.push('slds-icon--x-small');
			}

			scope.classes = classes.join(' ');


		}
	};
}]);
angular.module('angular-lightning').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/app.html',
    "<div inform class=\"inform-fixed\"></div> <div ng-include=\"'views/header.html'\"></div> <div class=\"slds-grid slds-wrap\"> <aside class=\"layout-sidebar slds-col--padded slds-size--12-of-12 slds-medium-size--6-of-12 slds-large-size--4-of-12\"> <div class=\"slds-card steps\" smb-stepoverview> <div class=\"slds-card__header slds-grid\"> <div class=\"slds-media slds-media--center slds-has-flexi-truncate\"> <!-- <div class=\"slds-media__figure\">\r" +
    "\n" +
    "\t\t\t        \t<span smb-icon type=\"utility\" icon=\"warning\" color=\"warning\"></span>\r" +
    "\n" +
    "\t     \t\t\t</div> --> <div class=\"slds-media__body\"> <h2 class=\"slds-text-heading--small slds-truncate\">Summary</h2> </div> </div> </div> <div class=\"slds-card__body\"> <table class=\"slds-table slds-table--bordered slds-max-medium-table--stacked-horizontal page-nav\"> <tr ng-repeat-start=\"page in form.pages\" ng-click=\"page.activate()\"> <td>{{page.name}} ({{page.progress()}}%)</td> <td style=\"text-align:right\"> <!-- invalid icon --> <span smb-icon type=\"utility\" icon=\"warning\" size=\"x-small\" color=\"warning\" ng-if=\"page.formCtrl.$invalid\"></span> <!-- valid icon --> <span smb-icon type=\"utility\" icon=\"success\" size=\"x-small\" color=\"success\" ng-if=\"page.formCtrl.$valid\"></span> <span smb-icon type=\"utility\" icon=\"right\" size=\"x-small\" color=\"default\" ng-if=\"page.active\"></span> </td> </tr> <tr ng-repeat-end class=\"progresswrappertr\"> <td colspan=\"2\" class=\"progresswrapper\"> <div smb-progressbar minimal value=\"page.progress()\"></div> </td> </tr> </table> </div> </div> </aside> <main class=\"layout-main slds-col--padded slds-size--12-of-12 slds-medium-size--6-of-12 slds-large-size--8-of-12\"> <div smb-form form=\"form\" ng-form=\"mainform\" ng-if=\"form\"></div> <button class=\"slds-button slds-button--brand\" ng-click=\"saveForm()\">Save</button> </main> </div>"
  );


  $templateCache.put('views/field-picklist.html',
    "<div class=\"slds-picklist--draggable slds-grid\" ng-controller=\"liPicklistController as pc\"> <div class=\"slds-form-element\"> <span class=\"slds-form-element__label\" aria-label=\"select-1\">First Category</span> <div class=\"slds-picklist slds-picklist--multi\"> <ul class=\"slds-picklist__options slds-picklist__options--multi shown\"> <li draggable=\"true\" id=\"po-0-0\" class=\"slds-picklist__item slds-has-icon slds-has-icon--left\" aria-selected=\"false\" tabindex=\"0\" role=\"option\" ng-repeat=\"option in options\" ng-click=\"pc.selectOption(option)\"> <span class=\"slds-truncate\"> <span>{{option}}</span> </span> </li> <!-- <li draggable=\"true\" id=\"po-1-1\" class=\"slds-picklist__item slds-has-icon slds-has-icon--left\" aria-selected=\"false\" tabindex=\"-1\" role=\"option\">\r" +
    "\n" +
    "          <span class=\"slds-truncate\">\r" +
    "\n" +
    "            <span>Option Two</span>\r" +
    "\n" +
    "          </span>\r" +
    "\n" +
    "        </li>\r" +
    "\n" +
    "        <li draggable=\"true\" id=\"po-2-2\" class=\"slds-picklist__item slds-has-icon slds-has-icon--left\" aria-selected=\"false\" tabindex=\"-1\" role=\"option\">\r" +
    "\n" +
    "          <span class=\"slds-truncate\">\r" +
    "\n" +
    "            <span>Option Three</span>\r" +
    "\n" +
    "          </span>\r" +
    "\n" +
    "        </li>\r" +
    "\n" +
    "        <li draggable=\"true\" id=\"po-3-3\" class=\"slds-picklist__item slds-has-icon slds-has-icon--left\" aria-selected=\"false\" tabindex=\"-1\" role=\"option\">\r" +
    "\n" +
    "          <span class=\"slds-truncate\">\r" +
    "\n" +
    "            <span>Option Four</span>\r" +
    "\n" +
    "          </span>\r" +
    "\n" +
    "        </li> --> </ul> </div> </div> <div class=\"slds-grid slds-grid--vertical\"> <button class=\"slds-button slds-button--icon-container\" ng-click=\"removeValues()\"> <span li-icon type=\"utility\" icon=\"left\" size=\"x-small\"></span> </button> <button class=\"slds-button slds-button--icon-container\" ng-click=\"addValues()\"> <span li-icon type=\"utility\" icon=\"right\" size=\"x-small\"></span> </button> </div> <div class=\"slds-form-element\"> <span class=\"slds-form-element__label\" aria-label=\"select-2\">Second Category</span> <div class=\"slds-picklist slds-picklist--multi\"> <ul class=\"slds-picklist__options slds-picklist__options--multi shown\"> <li draggable=\"true\" id=\"po-0-0\" class=\"slds-picklist__item slds-has-icon slds-has-icon--left\" aria-selected=\"false\" tabindex=\"0\" role=\"option\" ng-repeat=\"option in selected\" ng-click=\"pc.selectOption(option)\"> <span class=\"slds-truncate\"> <span>{{option}}</span> </span> </li> </ul> </div> </div> <div class=\"slds-grid slds-grid--vertical\"> <button class=\"slds-button slds-button--icon-container\"> <span smb-icon type=\"utility\" icon=\"up\" size=\"x-small\"></span> </button> <button class=\"slds-button slds-button--icon-container\"> <span smb-icon type=\"utility\" icon=\"down\" size=\"x-small\"></span> </button> </div> </div>"
  );


  $templateCache.put('views/field.html',
    "<label class=\"slds-form-element__label smb-field-label\" for=\"inputSample2\" ng-class=\"{ 'disabled': !field.visible }\">{{field.label}}</label> <div class=\"smb-field-wrap-main\" ng-switch=\"field.type\" ng-class=\"{ 'disabled': !field.visible }\"> <!-- dynamic field generation --> <div ng-switch-when=\"text\" smb-field-text></div> <div ng-switch-when=\"date\" smb-field-date></div> <div ng-switch-when=\"picklist\" smb-field-picklist></div> <div ng-switch-when=\"dropdown\" smb-field-dropdown></div> <div ng-switch-when=\"textarea\" smb-field-textarea></div> <div ng-switch-when=\"wysiwyg\" smb-field-wysiwyg></div> </div>"
  );


  $templateCache.put('views/fields/date/field-date-dropdown.html',
    "<div class=\"slds-dropdown slds-dropdown--left slds-datepicker\" aria-hidden=\"false\" data-selection=\"single\"> <div class=\"slds-datepicker__filter slds-grid\"> <div class=\"slds-datepicker__filter--month slds-grid slds-grid--align-spread slds-size--3-of-4\"> <div class=\"slds-align-middle\"> <button class=\"slds-button slds-button--icon-container\" ng-click=\"previousMonth()\"> <span smb-icon type=\"utility\" icon=\"left\" size=\"x-small\"></span> </button> </div> <h2 id=\"month\" class=\"slds-align-middle\" aria-live=\"assertive\" aria-atomic=\"true\">{{month.label}}</h2> <div class=\"slds-align-middle\"> <button class=\"slds-button slds-button--icon-container\" ng-click=\"nextMonth()\"> <span smb-icon type=\"utility\" icon=\"right\" size=\"x-small\"></span> </button> </div> </div> <div class=\"slds-picklist datepicker__filter--year slds-shrink-none\"> <button id=\"year\" class=\"slds-button slds-button--neutral slds-picklist__label\" aria-haspopup=\"true\" ng-click=\"yearPickerOpen = !yearPickerOpen\">{{month.year}} <span smb-icon type=\"utility\" icon=\"down\" size=\"x-small\"></span> </button> </div> </div> <table class=\"datepicker__month\" role=\"grid\" aria-labelledby=\"month\"> <thead> <tr id=\"weekdays\"> <th id=\"Sunday\"> <abbr title=\"Sunday\">S</abbr> </th> <th id=\"Monday\"> <abbr title=\"Monday\">M</abbr> </th> <th id=\"Tuesday\"> <abbr title=\"Tuesday\">T</abbr> </th> <th id=\"Wednesday\"> <abbr title=\"Wednesday\">W</abbr> </th> <th id=\"Thursday\"> <abbr title=\"Thursday\">T</abbr> </th> <th id=\"Friday\"> <abbr title=\"Friday\">F</abbr> </th> <th id=\"Saturday\"> <abbr title=\"Saturday\">S</abbr> </th> </tr> </thead> <tbody> <tr ng-repeat=\"week in month.weeks\"> <td class=\"datepicker-day\" ng-class=\"{ 'slds-disabled-text': !day.inCurrentMonth, 'slds-is-selected': getCurrentDate().date() === day.moment.date() }\" role=\"gridcell\" ng-repeat=\"day in week.days\" ng-attr-aria-disabled=\"{{!day.inCurrentMonth}}\" ng-click=\"selectDay(day)\"> <span class=\"slds-day\">{{day.label}}</span> </td> </tr> </tbody> </table> </div>"
  );


  $templateCache.put('views/fields/date/field-date-yearpicker.html',
    "<div class=\"slds-dropdown slds-dropdown--left slds-dropdown--menu\" ng-if=\"yearPickerOpen\"> <ul class=\"slds-dropdown__list\" role=\"menu\"> <!-- <li id=\"menu-0-0\" href=\"#\" class=\"slds-dropdown__item\"><a href=\"#\" class=\"slds-truncate\" role=\"menuitem\">Menu Item One</a></li>\r" +
    "\n" +
    "\t\t<li id=\"menu-1-1\" href=\"#\" class=\"slds-dropdown__item\"><a href=\"#\" class=\"slds-truncate\" role=\"menuitem\">Menu Item Two</a></li>\r" +
    "\n" +
    "\t\t<li id=\"menu-2-2\" href=\"#\" class=\"slds-dropdown__item\"><a href=\"#\" class=\"slds-truncate\" role=\"menuitem\">Menu Item Three</a></li> --> <li class=\"slds-dropdown__item\"> <a role=\"menuitem\" ng-click=\"yearPrevPage()\">Earlier</a> </li> <li ng-repeat=\"year in years\" class=\"slds-dropdown__item\" ng-class=\"{ 'slds-has-divider' : $first }\"> <a class=\"slds-truncate\" role=\"menuitem\" ng-click=\"selectYear(year.moment)\">{{year.label}}</a> </li> <li class=\"slds-dropdown__item slds-has-divider\"> <a role=\"menuitem\" ng-click=\"yearNextPage()\">Later</a> </li> </ul> </div>"
  );


  $templateCache.put('views/fields/field-dropdown.html',
    "<div class=\"slds-form-element__control\"> <select id=\"selectSample1\" class=\"slds-select\" ng-options=\"picklistval for picklistval in field.picklistvals\" ng-model=\"field.value\" ng-disabled=\"field.disabled || $parent.$parent.section.state.status === 'pending'\"> </select> </div>"
  );


  $templateCache.put('views/fields/field-text.html',
    "<div class=\"slds-form-element__control\"> <input class=\"slds-input\" type=\"text\" placeholder=\"\" ng-model=\"field.value\" name=\"{{field.name}}\" ng-required=\"field.required\" ng-disabled=\"field.disabled || $parent.$parent.section.state.status === 'pending'\"> </div>"
  );


  $templateCache.put('views/fields/field-textarea.html',
    "<textarea class=\"slds-textarea\" rows=\"4\" ng-model=\"field.value\" name=\"{{field.name}}\" ng-required=\"field.required\" ng-disabled=\"field.disabled || $parent.$parent.section.state.status === 'pending'\">"
  );


  $templateCache.put('views/fields/field-wysiwyg.html',
    "<trix-editor></trix-editor>"
  );


  $templateCache.put('views/form.html',
    "<div ng-repeat=\"page in form.pages\" ng-form=\"{{page.devname}}\" smb-page class=\"page\" ng-show=\"page.active\"> <div class=\"title-container slds-media\"> <span smb-icon type=\"{{page.icon.type}}\" icon=\"{{page.icon.name}}\"></span> <div class=\"slds-text-heading--medium slds-col slds-media__body smb-page-header\">{{page.name}}</div> </div> <div smb-progressbar value=\"page.progress()\"></div> <div class=\"\"> <div ng-repeat=\"section in page.sections\" smb-section ng-form=\"{{section.devname}}\" class=\"smb-section\"> <!-- <div class=\"slds-text-heading--small slds-text-heading--underline\">{{section.name}}</div> --> <h3 class=\"slds-section-title section-group--is-open smb-section-title\"> <span smb-icon type=\"utility\" icon=\"switch\"></span> {{section.name}} <span class=\"slds-badge slds-theme--inverse\" ng-if=\"section.state.status === 'pending'\" smb-tooltip=\"This section is locked by Finance Approval 1 - It will require re-approval if unlocked.\">Locked</span> </h3> <div class=\"slds-grid slds-wrap slds-form--stacked\"> <div class=\"slds-col--padded slds-medium-size--1-of-2 slds-small-size--1-of-1\" ng-class=\"{'slds-size--2-of-2': field.fullwidth}\" ng-repeat=\"field in section.elements\"> <div class=\"slds-form-element\" smb-field field=\"field\" ng-class=\"{'slds-is-required' : field.required, 'slds-has-error' : {{field.name}}.$invalid && {{field.name}}.$dirty }\" ng-form=\"{{field.name}}\"></div> </div> </div> </div> </div> </div>"
  );


  $templateCache.put('views/header.html',
    "<div class=\"header-inner\" style=\"padding:20px 30px 0px 30px\"> <img src=\"images/sp+.png\"> <h1 class=\"slds-text-heading--large\">Deal Journey</h1> </div>"
  );


  $templateCache.put('views/util/icon.html',
    "<!-- <span class=\"slds-icon__container--circle slds-icon-action-update slds-media__figure\"> --> <svg aria-hidden=\"true\" ng-class=\"classes\"> <use xlink:href=\"#\"></use> </svg> <span class=\"slds-assistive-text\">{{page.name}}</span> <!-- </span> -->"
  );


  $templateCache.put('views/util/progressbar.html',
    "<div class=\"progress-container slds-grid\" ng-if=\"!minimal\"> <span class=\"slds-pill progress-status slds-col\"> <span class=\"slds-pill__label\">{{value}}% Complete</span> </span> <div class=\"progressbar slds-col\" title=\"{{value}}%\" ng-class=\"{'success': value === 100}\"> <div class=\"progress\" ng-style=\"{'width': value + '%'}\"></div> </div> </div> <div class=\"progressbar slds-col progressbar-minimal\" title=\"{{value}}%\" ng-if=\"minimal\" ng-class=\"{'success': value === 100}\"> <div class=\"progress\" ng-style=\"{'width': value + '%'}\"></div> </div>"
  );

}]);
