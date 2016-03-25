angular.module('angular-lightning.datepicker', [])

.constant('DateConfig', {
	numWeeksShown: 5,
	dateFormat: 'MM/DD/YYYY', 
	dateTimeFormat: 'MM/DD/YYYY hh:mm A'
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

	$scope = _originalScope;

	this.init = function(element, controllers, attrs) {
		this.controllers = controllers;
		this.element = inputEl = element;

		$scope.showTime = false;
		if (attrs.datepickerType === 'datetime') {
			DateConfig.dateFormat = DateConfig.dateTimeFormat;
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
				
				return value;
			}
			else {
				return null;
			}
		});

		ngModelCtrl.$formatters.push(function(value) {
			if (value) {
				value = moment(value);

				$scope.hour = value.hour();
				if (value.format('A') === 'PM') {
					$scope.hour -= 12;
				}
				$scope.minute = value.minute();
				$scope.ampm = value.format('A');

				return value.format(DateConfig.dateFormat);
			}
			else {
				return null;
			}
		});

		var unwatch = $scope.$watch(function() {
			return ngModelCtrl.$modelValue;
		}, function(val) {
			var theDate = DateService.getDate(val);
			if (theDate) {
				theDate.second(0);
				ngModelCtrl.$setViewValue(theDate.format(DateConfig.dateFormat));
				ngModelCtrl.$render();
			}
			unwatch();
			_buildCalendar();
		});

		inputEl.bind('focus', function() {
			$scope.isOpen = true;
			$scope.$digest();
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
			$scope.month = DateService.buildMonth(moment(ngModelCtrl.$modelValue));
		}
		else { 
			$scope.month = DateService.buildMonth(moment());
		}

		var popupEl = angular.element('<div li-date-dropdown ng-show="isOpen" ng-click="isOpen = true"></div>');

		$popup = $compile(popupEl)($scope);
		$(inputEl).after($popup);


	};

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
		return ngModelCtrl.$modelValue;
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
		ngModelCtrl.$setViewValue(day.moment.format(DateConfig.dateFormat));
		ngModelCtrl.$render();
	};
	$scope.selectYear = function(year) {
		ngModelCtrl.$setViewValue(year.format(DateConfig.dateFormat));
		ngModelCtrl.$render();
		$scope.month = DateService.buildMonth(moment(ngModelCtrl.$modelValue));
	};

	$scope.changeHour = function(val) {
		val = Number(val);
		if (ngModelCtrl.$modelValue.format('A') === 'PM') {
			val += 12;
		}
		ngModelCtrl.$modelValue.hour(val);
		ngModelCtrl.$setViewValue(ngModelCtrl.$modelValue.format(DateConfig.dateFormat));
		ngModelCtrl.$render();

		$scope.ampm = ngModelCtrl.$modelValue.format('A');
	};
	$scope.changeMinute = function(val) {
		ngModelCtrl.$modelValue.minute(val);
		ngModelCtrl.$setViewValue(ngModelCtrl.$modelValue.format(DateConfig.dateFormat));
		ngModelCtrl.$render();
	};
	$scope.changeAMPM = function() {
		if (ngModelCtrl.$modelValue.format('A') === 'AM') {
			ngModelCtrl.$modelValue.add(12, 'hours');
		}
		else {
			ngModelCtrl.$modelValue.subtract(12, 'hours');
		}

		ngModelCtrl.$setViewValue(ngModelCtrl.$modelValue.format(DateConfig.dateFormat));
		ngModelCtrl.$render();

		$scope.ampm = ngModelCtrl.$modelValue.format('A');
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
			var currentYear = moment(scope.getCurrentDate()).clone();
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