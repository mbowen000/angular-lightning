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
		if(ngModelCtrl.$modelValue && moment.isMoment(ngModelCtrl.$modelValue)) {
			$scope.month = DateService.buildMonth(moment(ngModelCtrl.$modelValue));
		}
		else { 
			$scope.month = DateService.buildMonth(moment());
		}

		var popupEl = angular.element('<div li-date-dropdown ng-show="isOpen" ng-click="isOpen = true"></div>');

		$popup = $compile(popupEl)($scope);
		$(inputEl).after($popup);
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

				return value.format(dateFormat);
			}
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
		return moment(ngModelCtrl.$modelValue);
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