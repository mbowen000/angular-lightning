<<<<<<< HEAD
angular.module("angular-lightning",["angular-lightning.datepicker","angular-lightning.picklist","angular-lightning.icon","angular-lightning.modal","angular-lightning.lookup"]),angular.module("angular-lightning.datepicker",[]).constant("DateConfig",{numWeeksShown:5,dateFormat:"MM/DD/YYYY"}).service("DateService",["DateConfig",function(a){"use strict";var b=function(a,b){return this.moment=a.clone(),this.label=this.moment.format("D"),this.inCurrentMonth=a.month()===b,this},c=function(a){this.days=[];var c=a.clone(),d=a.month();c=a.startOf("week");for(var e=0;7>e;e++)this.days.push(new b(c,d)),c=c.add("1","days");return this},d=function(b){this.weeks=[],this.label=b.format("MMMM"),this.year=b.format("YYYY");var d=this.currentDate=b.clone();d=d.startOf("month");for(var e=0;e<a.numWeeksShown;e++){var f=d.clone().add(e,"weeks");this.weeks.push(new c(f))}return this},e=function(a){return this.moment=a.clone(),this.label=a.format("YYYY"),this};return{getDate:function(a){return a?moment(a):moment()},buildMonth:function(a){var b=a.clone();return new d(b)},buildYearsAroundCurrent:function(a){for(var b=[],c=a.clone(),d=0;9>d;d++)b.push(new e(c.clone().subtract(4-d,"years")));return b}}}]).controller("DateDropdownController",["$scope","$document","DateService","$compile","DateConfig",function(a,b,c,d,e){"use strict";var f,g,h,i,j;j=a,this.init=function(a,b){this.controllers=b,this.element=g=a,f=b[1],f.$parsers.push(function(a){return a?moment(a).format(e.dateFormat):void 0}),f.$formatters.push(function(a){return a&&moment.isMoment(a)?a.format(e.dateFormat):void 0});var d=j.$watch(function(){return f.$modelValue},function(a){f.$setViewValue(c.getDate(a).format(e.dateFormat)),f.$render(),d(),l()});g.bind("focus",function(){j.isOpen=!0,j.$digest()})};var k=function(a){var b=g[0].contains(a.target),c=h[0].contains(a.target);!j.isOpen||b||c||(j.isOpen=!1,j.$apply())};j.$watch("isOpen",function(a){a?b.bind("click",k):b.unbind("click",k)}),j.month={};var l=function(){f.$modelValue?j.month=c.buildMonth(moment(f.$modelValue)):j.month=c.buildMonth(moment());var a=angular.element('<div li-date-dropdown ng-show="isOpen" ng-click="isOpen = true"></div>');h=d(a)(j),$(g).after(h)};return j.$watch("yearPickerOpen",function(a){if(a){if(i)return;var b=angular.element("<span li-date-year-picker></span>");b.attr({"current-year":"getCurrentDate()"}),i=d(b)(j),$(h).find("#year").after(i)}}),j.getCurrentDate=function(){return f.$modelValue},j.nextMonth=function(){var a=moment(j.month.currentDate).clone().startOf("month");j.month=c.buildMonth(a.add("1","month"))},j.previousMonth=function(){var a=moment(j.month.currentDate).clone().startOf("month");j.month=c.buildMonth(a.subtract("1","month"))},j.selectDay=function(a){f.$setViewValue(a.moment.format(e.dateFormat)),f.$render()},j.selectYear=function(a){f.$setViewValue(a.format(e.dateFormat)),f.$render(),j.month=c.buildMonth(moment(f.$modelValue))},this}]).directive("liDatepicker",["DateService",function(a){"use strict";return{require:["liDatepicker","ngModel"],controller:"DateDropdownController",scope:!0,link:function(a,b,c,d){return d[0].init(b,d),this}}}]).directive("liDateDropdown",[function(){"use strict";return{templateUrl:"views/fields/date/field-date-dropdown.html",link:function(a,b,c,d){}}}]).directive("liDateYearPicker",["DateService",function(a){"use strict";return{templateUrl:"views/fields/date/field-date-yearpicker.html",link:function(b,c,d,e){var f=0,g=moment(b.getCurrentDate()).clone();b.years=a.buildYearsAroundCurrent(g),b.yearNextPage=function(){f+=1,b.years=a.buildYearsAroundCurrent(g.clone().add(9*f,"years"))},b.yearPrevPage=function(){f-=1,b.years=a.buildYearsAroundCurrent(g.clone().add(9*f,"years"))}}}}]),angular.module("angular-lightning.picklist",[]).service("PicklistService",[function(){"use strict";return{getArrayFromDelimted:function(a){return a.split(";")}}}]).controller("liPicklistController",["$scope",function(a){"use strict";var b,c;a.selected=[],this.init=function(e,f,g,h){b=f,c=h[1],c.$render=function(){c.$modelValue&&(c.$modelValue.indexOf(";")>-1?a.selected=c.$modelValue.split(";"):(a.selected=[],a.selected.push(c.$modelValue)),d())}},a.highlightOption=function(b){a.highlighted=b},a.selectHighlighted=function(){null!=a.highlighted&&_.indexOf(a.options,a.highlighted)>-1&&(a.selected.push(a.highlighted),d())},a.removeHighlighted=function(){null!=a.highlighted&&_.indexOf(a.selected,a.highlighted)>-1&&(a.selected.splice(a.selected.indexOf(a.highlighted),1),a.options.push(a.highlighted),d())};var d=function(){var b=_.difference(a.options,a.selected);a.options=[],_.each(b,function(b){a.options.push(b)}),a.highlighted=null};a.$watchCollection("selected",function(a,b){c.$setViewValue(a.join(";"))})}]).directive("liPicklist",[function(){"use strict";return{scope:{options:"=",selected:"="},controller:"liPicklistController",templateUrl:"views/field-picklist.html",require:["liPicklist","ngModel"],link:function(a,b,c,d){var e;d.length>0&&(e=d[0]),e&&e.init(a,b,c,d)}}}]),angular.module("angular-lightning.lookup",[]).factory("liLookupParser",["$parse",function(a){var b=/^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;return{parse:function(c){var d=c.match(b);if(!d)throw new Error('Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_" but got "'+c+'".');return{itemName:d[3],source:a(d[4]),viewMapper:a(d[2]||d[1]),modelMapper:a(d[1])}}}}]).controller("liLookupController",["$compile","$parse","$q","$timeout","liLookupParser",function(a,b,c,d,e){"use strict";this.init=function(f,g,h,i){var j,k,l,m;k=g,j=f.$new(),l=h,m=i[1],j.objectName=l.objectName,j.matches=[],j.selected=null,j.isFocused=!1;var n=b(l.ngModel),o=function(a,b){return n.assign(a,b)},p=e.parse(l.liLookup);k.bind("keyup",function(a){var b={$viewValue:m.$viewValue};c.when(p.source(j,b)).then(function(a){j.matches.length=0,_.each(a,function(a){b[p.itemName]=a,j.matches.push({label:p.viewMapper(j,b),model:a})}),j.currentVal=m.$viewValue})}),m.$formatters.push(function(a){var b,c,d={};return d[p.itemName]=a,b=p.viewMapper(j,d),d[p.itemName]=void 0,c=p.viewMapper(j,d),b!==c?b:a});var q=angular.element("<div li-lookup-dropdown></div>");q.attr({matches:"matches","current-val":"currentVal","the-object":"objectName",select:"select(idx)"});var r=a(q)(j);k.bind("focus",function(a){j.currentVal=m.$viewValue,j.$digest(),$(k).parents(".slds-lookup").append(r)}),k.bind("blur",function(){d(function(){$("div[li-lookup-dropdown]").remove()},300)}),j.select=function(a){var b,c,d={};d[p.itemName]=c=j.matches[a].model,b=p.modelMapper(j,d),o(j,b),j.matches=[]}}}]).directive("liLookup",[function(){"use strict";return{controller:"liLookupController",require:["liLookup","ngModel"],link:function(a,b,c,d){var e;d.length>0&&(e=d[0]),e&&e.init(a,b,c,d)}}}]).directive("liLookupDropdown",[function(){"use strict";return{templateUrl:"views/fields/lookup/lookup-dropdown.html",scope:{matches:"=",currentVal:"=",theObject:"=",select:"&"},replace:!0,link:function(a,b,c){a.selectMatch=function(b){a.select({idx:b})}}}}]),angular.module("angular-lightning.icon",[]).value("iconConfig",{iconUrl:"assets/icons/"}).directive("liIcon",["iconConfig",function(a){"use strict";return{templateUrl:"views/util/icon.html",scope:{},replace:!0,link:function(b,c,d){var e=_.defaults({type:d.type,icon:d.icon,size:d.size,color:d.color,classes:d.addClasses},{type:"action",icon:"opportunity",size:"",classes:""});b.options=e;var f=(a.iconUrl,[]),g=($(c).find("svg"),$(c).find("use")),h=a.iconUrl+e.type+"-sprite/svg/symbols.svg#"+e.icon;$(g).attr("xlink:href",h),"action"===e.type&&$(c).addClass("slds-icon__container--circle slds-media__figure"),e.color&&("warning"===e.color?f.push("slds-icon-text-warning"):"default"===e.color?f.push("slds-icon-text-default"):"success"===e.color&&f.push("slds-icon-text-success"));var i=e.icon.replace(/([A-Z]+)(_.*?)*(\d*)/gi,function(a,b,c,d){return d?b+"-"+d:c?b+"-":a}),j="slds-icon-"+e.type+"-"+i;"utility"!==e.type&&$(c).addClass(j),f.push("slds-icon"),e.classes&&(f=f.concat(e.classes.split(" "))),"small"===e.size&&f.push("slds-icon--small"),"x-small"===e.size&&f.push("slds-icon--x-small"),b.classes=f.join(" ")}}}]),angular.module("angular-lightning.modal",[]).factory("liModalService",["$rootScope","$compile",function(a,b){"use strict";var c=null,d=null,e=null,f={};return f.open=function(f){var g=angular.element("<div li-modal></div>");e=(f.scope||a).$new(),e.close=function(){c.remove(),d.remove()},g.attr({"template-url":f.templateUrl}),c=b(g)(e);var h=angular.element('<div class="slds-backdrop slds-backdrop--open"></div>');d=b(h)(e),$("body").append(d),$("body").append(c)},f.close=function(){c.remove(),d.remove()},f}]).directive("liModal",[function(){"use strict";return{templateUrl:function(a,b){return b.templateUrl||"views/util/modal.html"},link:function(a,b,c){console.log("linked")}}}]).provider("liModal",function(){"use strict";var a={options:{},$get:["liModalService",function(a){var b={};return b.open=function(b){a.open(b)},b.close=function(){a.close()},b}]};return a}),angular.module("angular-lightning").run(["$templateCache",function(a){"use strict";a.put("views/demo/modal-demo.html",'<div> <div aria-hidden="false" role="dialog" class="slds-modal slds-modal--large slds-fade-in-open"> <div class="slds-modal__container"> <div class="slds-modal__header"> <h2 class="slds-text-heading--medium">Modal Demo for Angular Lightning</h2> <button class="slds-button slds-button--icon-inverse slds-modal__close" ng-click="close()"> <svg aria-hidden="true" class="slds-button__icon slds-button__icon--large"> <use xlink:href="/assets/icons/action-sprite/svg/symbols.svg#close"></use> </svg> <span class="slds-assistive-text">Close</span> </button> </div> <div class="slds-modal__content"> <div> This is custom content! <br> {{message}} </div> </div> <div class="slds-modal__footer"> <div class="slds-x-small-buttons--horizontal"> <button class="slds-button slds-button--neutral">Cancel</button> <button class="slds-button slds-button--neutral slds-button--brand">Save</button> </div> </div> </div> </div> </div>'),a.put("views/field-picklist.html",'<div class="slds-picklist--draggable slds-grid"> <div class="slds-form-element"> <span class="slds-form-element__label" aria-label="select-1">Available</span> <div class="slds-picklist slds-picklist--multi"> <ul class="slds-picklist__options slds-picklist__options--multi shown"> <li draggable="true" id="po-0-0" class="slds-picklist__item slds-has-icon slds-has-icon--left" tabindex="0" role="option" ng-repeat="option in options track by $index" ng-click="highlightOption(option)" aria-selected="{{option==highlighted}}"> <span class="slds-truncate"> <span>{{option}}</span> </span> </li> </ul> </div> </div> <div class="slds-grid slds-grid--vertical"> <button class="slds-button slds-button--icon-container" ng-click="selectHighlighted()"> <span li-icon type="utility" icon="right" size="x-small" color="default"></span> </button> <button class="slds-button slds-button--icon-container" ng-click="removeHighlighted()"> <span li-icon type="utility" icon="left" size="x-small" color="default"></span> </button> </div> <div class="slds-form-element"> <span class="slds-form-element__label" aria-label="select-2">Selected</span> <div class="slds-picklist slds-picklist--multi"> <ul class="slds-picklist__options slds-picklist__options--multi shown"> <li draggable="true" id="po-0-0" class="slds-picklist__item slds-has-icon slds-has-icon--left" tabindex="0" role="option" ng-repeat="option in selected track by $index" ng-click="highlightOption(option)" aria-selected="{{option==highlighted}}"> <span class="slds-truncate"> <span>{{option}}</span> </span> </li> </ul> </div> </div> <div class="slds-grid slds-grid--vertical"> <button class="slds-button slds-button--icon-container"> <span li-icon type="utility" icon="up" size="x-small" color="default"></span> </button> <button class="slds-button slds-button--icon-container"> <span li-icon type="utility" icon="down" size="x-small" color="default"></span> </button> </div> </div>'),a.put("views/fields/date/field-date-dropdown.html",'<div class="slds-dropdown slds-dropdown--left slds-datepicker" aria-hidden="false" data-selection="single"> <div class="slds-datepicker__filter slds-grid"> <div class="slds-datepicker__filter--month slds-grid slds-grid--align-spread slds-size--3-of-4"> <div class="slds-align-middle"> <button class="slds-button slds-button--icon-container" ng-click="previousMonth()"> <span smb-icon type="utility" icon="left" size="x-small"></span> </button> </div> <h2 id="month" class="slds-align-middle" aria-live="assertive" aria-atomic="true">{{month.label}}</h2> <div class="slds-align-middle"> <button class="slds-button slds-button--icon-container" ng-click="nextMonth()"> <span smb-icon type="utility" icon="right" size="x-small"></span> </button> </div> </div> <div class="slds-picklist datepicker__filter--year slds-shrink-none"> <button id="year" class="slds-button slds-button--neutral slds-picklist__label" aria-haspopup="true" ng-click="yearPickerOpen = !yearPickerOpen">{{month.year}} <span smb-icon type="utility" icon="down" size="x-small"></span> </button> </div> </div> <table class="datepicker__month" role="grid" aria-labelledby="month"> <thead> <tr id="weekdays"> <th id="Sunday"> <abbr title="Sunday">S</abbr> </th> <th id="Monday"> <abbr title="Monday">M</abbr> </th> <th id="Tuesday"> <abbr title="Tuesday">T</abbr> </th> <th id="Wednesday"> <abbr title="Wednesday">W</abbr> </th> <th id="Thursday"> <abbr title="Thursday">T</abbr> </th> <th id="Friday"> <abbr title="Friday">F</abbr> </th> <th id="Saturday"> <abbr title="Saturday">S</abbr> </th> </tr> </thead> <tbody> <tr ng-repeat="week in month.weeks"> <td class="datepicker-day" ng-class="{ \'slds-disabled-text\': !day.inCurrentMonth, \'slds-is-selected\': getCurrentDate().isSame(day.moment) }" role="gridcell" ng-repeat="day in week.days" ng-attr-aria-disabled="{{!day.inCurrentMonth}}" ng-click="selectDay(day)"> <span class="slds-day">{{day.label}}</span> </td> </tr> </tbody> </table> </div>'),a.put("views/fields/date/field-date-yearpicker.html",'<div class="slds-dropdown slds-dropdown--left slds-dropdown--menu" ng-if="yearPickerOpen"> <ul class="slds-dropdown__list" role="menu"> <!-- <li id="menu-0-0" href="#" class="slds-dropdown__item"><a href="#" class="slds-truncate" role="menuitem">Menu Item One</a></li>\n		<li id="menu-1-1" href="#" class="slds-dropdown__item"><a href="#" class="slds-truncate" role="menuitem">Menu Item Two</a></li>\n		<li id="menu-2-2" href="#" class="slds-dropdown__item"><a href="#" class="slds-truncate" role="menuitem">Menu Item Three</a></li> --> <li class="slds-dropdown__item"> <a role="menuitem" ng-click="yearPrevPage()">Earlier</a> </li> <li ng-repeat="year in years" class="slds-dropdown__item" ng-class="{ \'slds-has-divider\' : $first }"> <a class="slds-truncate" role="menuitem" ng-click="selectYear(year.moment)">{{year.label}}</a> </li> <li class="slds-dropdown__item slds-has-divider"> <a role="menuitem" ng-click="yearNextPage()">Later</a> </li> </ul> </div>'),a.put("views/fields/field-dropdown.html",'<div class="slds-form-element__control"> <select id="selectSample1" class="slds-select" ng-options="picklistval for picklistval in field.picklistvals" ng-model="field.value" ng-disabled="field.disabled || $parent.$parent.section.state.status === \'pending\'"> </select> </div>'),a.put("views/fields/field-text.html",'<div class="slds-form-element__control"> <input class="slds-input" type="text" placeholder="" ng-model="field.value" name="{{field.name}}" ng-required="field.required" ng-disabled="field.disabled || $parent.$parent.section.state.status === \'pending\'"> </div>'),a.put("views/fields/field-textarea.html",'<textarea class="slds-textarea" rows="4" ng-model="field.value" name="{{field.name}}" ng-required="field.required" ng-disabled="field.disabled || $parent.$parent.section.state.status === \'pending\'">'),a.put("views/fields/field-wysiwyg.html","<trix-editor></trix-editor>"),a.put("views/fields/lookup/lookup-dropdown.html",'<div class="slds-lookup__menu" role="listbox"> <div class="slds-lookup__item"> <button class="slds-button"> <span li-icon type="utility" icon="search" size="small" color="default"></span> &quot;{{currentVal}}&quot; in {{theObject}}</button> </div> <ul class="slds-lookup__list" role="presentation"> <li class="slds-lookup__item" ng-repeat="match in matches track by $index" ng-click="selectMatch($index)"> <a href="javascript:;" role="option"> <span li-icon type="standard" icon="account" size="small"></span> {{match.label}} </a> </li> </ul> </div>'),a.put("views/header.html",'<div class="header-inner" style="padding:20px 30px 0px 30px"> <img src="images/sp+.png"> <h1 class="slds-text-heading--large">Deal Journey</h1> </div>'),a.put("views/util/icon.html",'<svg aria-hidden="true" ng-class="classes"> <use xlink:href="#"></use> </svg>'),a.put("views/util/modal.html",'<div> <div aria-hidden="false" role="dialog" class="slds-modal slds-fade-in-open"> <div class="slds-modal__container"> <div class="slds-modal__header"> <h2 class="slds-text-heading--medium">Modal Header</h2> <button class="slds-button slds-button--icon-inverse slds-modal__close" ng-click="close()"> <svg aria-hidden="true" class="slds-button__icon slds-button__icon--large"> <use xlink:href="/assets/icons/action-sprite/svg/symbols.svg#close"></use> </svg> <span class="slds-assistive-text">Close</span> </button> </div> <div class="slds-modal__content"> <div> <p>Sit nulla est ex deserunt exercitation anim occaecat. Nostrud ullamco deserunt aute id consequat veniam incididunt duis in sint irure nisi. Mollit officia cillum Lorem ullamco minim nostrud elit officia tempor esse quis. Cillum sunt ad dolore quis aute consequat ipsum magna exercitation reprehenderit magna. Tempor cupidatat consequat elit dolor adipisicing.</p> <p>Dolor eiusmod sunt ex incididunt cillum quis nostrud velit duis sit officia. Lorem aliqua enim laboris do dolor eiusmod officia. Mollit incididunt nisi consectetur esse laborum eiusmod pariatur proident. Eiusmod et adipisicing culpa deserunt nostrud ad veniam nulla aute est. Labore esse esse cupidatat amet velit id elit consequat minim ullamco mollit enim excepteur ea.</p> </div> </div> <div class="slds-modal__footer"> <div class="slds-x-small-buttons--horizontal"> <button class="slds-button slds-button--neutral">Cancel</button> <button class="slds-button slds-button--neutral slds-button--brand">Save</button> </div> </div> </div> </div> </div>'),a.put("views/util/progressbar.html",'<div class="progress-container slds-grid" ng-if="!minimal"> <span class="slds-pill progress-status slds-col"> <span class="slds-pill__label">{{value}}% Complete</span> </span> <div class="progressbar slds-col" title="{{value}}%" ng-class="{\'success\': value === 100}"> <div class="progress" ng-style="{\'width\': value + \'%\'}"></div> </div> </div> <div class="progressbar slds-col progressbar-minimal" title="{{value}}%" ng-if="minimal" ng-class="{\'success\': value === 100}"> <div class="progress" ng-style="{\'width\': value + \'%\'}"></div> </div>')}]);
=======
// this just pulls in all the submodules
angular.module('angular-lightning', [ 
	'angular-lightning.datepicker',
	'angular-lightning.picklist',
	'angular-lightning.icon',
	'angular-lightning.modal',
	'angular-lightning.lookup'
]);
angular.module('angular-lightning.datepicker', [])

.constant('DateConfig', {
	numWeeksShown: 5,
	dateFormat: 'MM/DD/YYYY'
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
				return moment();
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

	this.init = function(element, controllers) {
		this.controllers = controllers;
		this.element = inputEl = element;
		ngModelCtrl = controllers[1];

		ngModelCtrl.$parsers.push(function(value) {
			if(value) {
				return moment(value).format(DateConfig.dateFormat);
			}
		});

		ngModelCtrl.$formatters.push(function(value) {
			if(value && moment.isMoment(value)) {
				return value.format(DateConfig.dateFormat);
			}
		});

		var unwatch = $scope.$watch(function() {
			return ngModelCtrl.$modelValue;
		}, function(val) {
			ngModelCtrl.$setViewValue(DateService.getDate(val).format(DateConfig.dateFormat));
			ngModelCtrl.$render();
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

	return this;	
}])

.directive('liDatepicker', ['DateService', function(DateService) {
	'use strict';
	return {
		require: ['liDatepicker','ngModel'],
		controller: 'DateDropdownController',
		scope: true,
		link: function(scope, element, attrs, controllers) {
			controllers[0].init(element, controllers);
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

.controller('liPicklistController', ['$scope', function($scope) {
	'use strict';
	var element, modelCtrl;

	$scope.selected = [];

	this.init = function(_scope, _element, _attrs, controllers) { 
		element = _element;
		modelCtrl = controllers[1];

		modelCtrl.$render = function() {
			if (modelCtrl.$modelValue) {
				if (modelCtrl.$modelValue.indexOf(';') > -1) {
				    $scope.selected = modelCtrl.$modelValue.split(';');
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
		$scope.highlighted = option;
	}

	$scope.selectHighlighted = function() {
		if ($scope.highlighted != null && _.indexOf($scope.options, $scope.highlighted) > -1) {
			$scope.selected.push($scope.highlighted);
			reconcileValues();
		}
	}

	$scope.removeHighlighted = function() {
		if ($scope.highlighted != null && _.indexOf($scope.selected, $scope.highlighted) > -1) {
			$scope.selected.splice($scope.selected.indexOf($scope.highlighted), 1);
			$scope.options.push($scope.highlighted);
			reconcileValues();
		}
	}

	var reconcileValues = function() {
		// get the diff
		var diff = _.difference($scope.options, $scope.selected);
		$scope.options = [];
		_.each(diff, function(d) {
			$scope.options.push(d);
		});
		$scope.highlighted = null;
	};

	$scope.$watchCollection('selected', function(newVals, oldVals) {
		modelCtrl.$setViewValue(newVals.join(';'));
	});
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

		// create ui elements for the dropdown
		var dropdownElem = angular.element('<div li-lookup-dropdown></div>');
		dropdownElem.attr({
			matches: 'matches',
			'current-val': 'currentVal',
			'the-object': 'objectName',
			select: 'select(idx)'
		});

		// compile the ui element
		var dropdownDomElem = $compile(dropdownElem)(scope);

		element.bind('focus', function(event) {
			// insert it into the dom
			scope.currentVal = modelCtrl.$viewValue;
			scope.$digest();
			$(element).parents('.slds-lookup').append(dropdownDomElem);
		});

		element.bind('blur', function () {
			$timeout(function() {
				$(dropdownElem).remove();
			}, 300);
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
			select: '&'
		},
		replace: true,
		link: function(scope, element, attrs) {
			scope.selectMatch = function(idx) {
				scope.select({idx: idx});
			};
		}
	}
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
				classes: attrs.addClasses
			}, {
				type: 'action',
				icon: 'opportunity',
				size: '',
				classes: ''
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
			classes.push('slds-icon');

			// if(options.inputIcon) {
			// 	classes.push('slds-input__icon');
			// }
			if(options.classes) {
				classes = classes.concat(options.classes.split(' '));
			}
			
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

		// add a standard close function
		modalScope.close = function() {
			modal.remove();
			modalBackdrop.remove();
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
			console.log('linked');
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
angular.module('angular-lightning').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/demo/modal-demo.html',
    "<div> <div aria-hidden=\"false\" role=\"dialog\" class=\"slds-modal slds-modal--large slds-fade-in-open\"> <div class=\"slds-modal__container\"> <div class=\"slds-modal__header\"> <h2 class=\"slds-text-heading--medium\">Modal Demo for Angular Lightning</h2> <button class=\"slds-button slds-button--icon-inverse slds-modal__close\" ng-click=\"close()\"> <svg aria-hidden=\"true\" class=\"slds-button__icon slds-button__icon--large\"> <use xlink:href=\"/assets/icons/action-sprite/svg/symbols.svg#close\"></use> </svg> <span class=\"slds-assistive-text\">Close</span> </button> </div> <div class=\"slds-modal__content\"> <div> This is custom content! <br> {{message}} </div> </div> <div class=\"slds-modal__footer\"> <div class=\"slds-x-small-buttons--horizontal\"> <button class=\"slds-button slds-button--neutral\">Cancel</button> <button class=\"slds-button slds-button--neutral slds-button--brand\">Save</button> </div> </div> </div> </div> </div>"
  );


  $templateCache.put('views/field-picklist.html',
    "<div class=\"slds-picklist--draggable slds-grid\"> <div class=\"slds-form-element\"> <span class=\"slds-form-element__label\" aria-label=\"select-1\">Available</span> <div class=\"slds-picklist slds-picklist--multi\"> <ul class=\"slds-picklist__options slds-picklist__options--multi shown\"> <li draggable=\"true\" id=\"po-0-0\" class=\"slds-picklist__item slds-has-icon slds-has-icon--left\" tabindex=\"0\" role=\"option\" ng-repeat=\"option in options track by $index\" ng-click=\"highlightOption(option)\" aria-selected=\"{{option==highlighted}}\"> <span class=\"slds-truncate\"> <span>{{option}}</span> </span> </li> </ul> </div> </div> <div class=\"slds-grid slds-grid--vertical\"> <button class=\"slds-button slds-button--icon-container\" ng-click=\"selectHighlighted()\"> <span li-icon type=\"utility\" icon=\"right\" size=\"x-small\" color=\"default\"></span> </button> <button class=\"slds-button slds-button--icon-container\" ng-click=\"removeHighlighted()\"> <span li-icon type=\"utility\" icon=\"left\" size=\"x-small\" color=\"default\"></span> </button> </div> <div class=\"slds-form-element\"> <span class=\"slds-form-element__label\" aria-label=\"select-2\">Selected</span> <div class=\"slds-picklist slds-picklist--multi\"> <ul class=\"slds-picklist__options slds-picklist__options--multi shown\"> <li draggable=\"true\" id=\"po-0-0\" class=\"slds-picklist__item slds-has-icon slds-has-icon--left\" tabindex=\"0\" role=\"option\" ng-repeat=\"option in selected track by $index\" ng-click=\"highlightOption(option)\" aria-selected=\"{{option==highlighted}}\"> <span class=\"slds-truncate\"> <span>{{option}}</span> </span> </li> </ul> </div> </div> <div class=\"slds-grid slds-grid--vertical\"> <button class=\"slds-button slds-button--icon-container\"> <span li-icon type=\"utility\" icon=\"up\" size=\"x-small\" color=\"default\"></span> </button> <button class=\"slds-button slds-button--icon-container\"> <span li-icon type=\"utility\" icon=\"down\" size=\"x-small\" color=\"default\"></span> </button> </div> </div>"
  );


  $templateCache.put('views/fields/date/field-date-dropdown.html',
    "<div class=\"slds-dropdown slds-dropdown--left slds-datepicker\" aria-hidden=\"false\" data-selection=\"single\"> <div class=\"slds-datepicker__filter slds-grid\"> <div class=\"slds-datepicker__filter--month slds-grid slds-grid--align-spread slds-size--3-of-4\"> <div class=\"slds-align-middle\"> <button class=\"slds-button slds-button--icon-container\" ng-click=\"previousMonth()\"> <span smb-icon type=\"utility\" icon=\"left\" size=\"x-small\"></span> </button> </div> <h2 id=\"month\" class=\"slds-align-middle\" aria-live=\"assertive\" aria-atomic=\"true\">{{month.label}}</h2> <div class=\"slds-align-middle\"> <button class=\"slds-button slds-button--icon-container\" ng-click=\"nextMonth()\"> <span smb-icon type=\"utility\" icon=\"right\" size=\"x-small\"></span> </button> </div> </div> <div class=\"slds-picklist datepicker__filter--year slds-shrink-none\"> <button id=\"year\" class=\"slds-button slds-button--neutral slds-picklist__label\" aria-haspopup=\"true\" ng-click=\"yearPickerOpen = !yearPickerOpen\">{{month.year}} <span smb-icon type=\"utility\" icon=\"down\" size=\"x-small\"></span> </button> </div> </div> <table class=\"datepicker__month\" role=\"grid\" aria-labelledby=\"month\"> <thead> <tr id=\"weekdays\"> <th id=\"Sunday\"> <abbr title=\"Sunday\">S</abbr> </th> <th id=\"Monday\"> <abbr title=\"Monday\">M</abbr> </th> <th id=\"Tuesday\"> <abbr title=\"Tuesday\">T</abbr> </th> <th id=\"Wednesday\"> <abbr title=\"Wednesday\">W</abbr> </th> <th id=\"Thursday\"> <abbr title=\"Thursday\">T</abbr> </th> <th id=\"Friday\"> <abbr title=\"Friday\">F</abbr> </th> <th id=\"Saturday\"> <abbr title=\"Saturday\">S</abbr> </th> </tr> </thead> <tbody> <tr ng-repeat=\"week in month.weeks\"> <td class=\"datepicker-day\" ng-class=\"{ 'slds-disabled-text': !day.inCurrentMonth, 'slds-is-selected': getCurrentDate().isSame(day.moment) }\" role=\"gridcell\" ng-repeat=\"day in week.days\" ng-attr-aria-disabled=\"{{!day.inCurrentMonth}}\" ng-click=\"selectDay(day)\"> <span class=\"slds-day\">{{day.label}}</span> </td> </tr> </tbody> </table> </div>"
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


  $templateCache.put('views/fields/lookup/lookup-dropdown.html',
    "<div class=\"slds-lookup__menu\" role=\"listbox\"> <div class=\"slds-lookup__item\"> <button class=\"slds-button\"> <span li-icon type=\"utility\" icon=\"search\" size=\"small\"></span> &quot;{{currentVal}}&quot; in {{theObject}}</button> </div> <ul class=\"slds-lookup__list\" role=\"presentation\"> <li class=\"slds-lookup__item\" ng-repeat=\"match in matches track by $index\" ng-click=\"selectMatch($index)\"> <a href=\"javascript:;\" role=\"option\"> <span li-icon type=\"standard\" icon=\"account\" size=\"small\"></span> {{match.label}} </a> </li> </ul> </div>"
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


  $templateCache.put('views/util/progressbar.html',
    "<div class=\"progress-container slds-grid\" ng-if=\"!minimal\"> <span class=\"slds-pill progress-status slds-col\"> <span class=\"slds-pill__label\">{{value}}% Complete</span> </span> <div class=\"progressbar slds-col\" title=\"{{value}}%\" ng-class=\"{'success': value === 100}\"> <div class=\"progress\" ng-style=\"{'width': value + '%'}\"></div> </div> </div> <div class=\"progressbar slds-col progressbar-minimal\" title=\"{{value}}%\" ng-if=\"minimal\" ng-class=\"{'success': value === 100}\"> <div class=\"progress\" ng-style=\"{'width': value + '%'}\"></div> </div>"
  );

}]);
>>>>>>> a5aa5c48c3ac50661dd466acce9fc1e2a2ec276e
