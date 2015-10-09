angular.module('testapp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/app.html',
    "<div ng-include=\"'views/header.html'\"></div> <div class=\"slds-grid slds-wrap\"> <nav class=\"slds-col slds-size--1-of-1\"></nav> <aside class=\"slds-col slds-size--1-of-2 slds-medium-size--1-of-6 slds-large-size--4-of-12\"> <ul ng-repeat=\"page in pages.models\"> <li ng-click=\"page.fetch()\">{{page.get('name')}}</li> </ul> </aside> <main class=\"slds-col slds-size--1-of-2 slds-medium-size--5-of-6 slds-large-size--8-of-12\"> <div smb-form form=\"form\" ng-form=\"mainform\"> </div> </main> </div>"
  );


  $templateCache.put('views/field-date.html',
    "<input class=\"slds-input\" type=\"date\" ng-model=\"field.value\" ng-required=\"field.required\">"
  );


  $templateCache.put('views/field-picklist.html',
    "<div class=\"slds-picklist--draggable slds-grid\"> <div class=\"slds-form-element\"> <span class=\"slds-form-element__label\" aria-label=\"select-1\">First Category</span> <div class=\"slds-picklist slds-picklist--multi\"> <ul class=\"slds-picklist__options slds-picklist__options--multi shown\"> <li draggable=\"true\" id=\"po-0-0\" class=\"slds-picklist__item slds-has-icon slds-has-icon--left\" aria-selected=\"false\" tabindex=\"0\" role=\"option\"> <span class=\"slds-truncate\"> <span>Option One</span> </span> </li> <li draggable=\"true\" id=\"po-1-1\" class=\"slds-picklist__item slds-has-icon slds-has-icon--left\" aria-selected=\"false\" tabindex=\"-1\" role=\"option\"> <span class=\"slds-truncate\"> <span>Option Two</span> </span> </li> <li draggable=\"true\" id=\"po-2-2\" class=\"slds-picklist__item slds-has-icon slds-has-icon--left\" aria-selected=\"false\" tabindex=\"-1\" role=\"option\"> <span class=\"slds-truncate\"> <span>Option Three</span> </span> </li> <li draggable=\"true\" id=\"po-3-3\" class=\"slds-picklist__item slds-has-icon slds-has-icon--left\" aria-selected=\"false\" tabindex=\"-1\" role=\"option\"> <span class=\"slds-truncate\"> <span>Option Four</span> </span> </li> </ul> </div> </div> <div class=\"slds-grid slds-grid--vertical\"> <button class=\"slds-button slds-button--icon-container\"> <svg aria-hidden=\"true\" class=\"slds-button__icon\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#left\"></use> </svg> <span class=\"slds-assistive-text\">Pick list</span> </button> <button class=\"slds-button slds-button--icon-container\"> <svg aria-hidden=\"true\" class=\"slds-button__icon\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#right\"></use> </svg> <span class=\"slds-assistive-text\">Pick list</span> </button> </div> <div class=\"slds-form-element\"> <span class=\"slds-form-element__label\" aria-label=\"select-2\">Second Category</span> <div class=\"slds-picklist slds-picklist--multi\"> <ul class=\"slds-picklist__options slds-picklist__options--multi shown\"></ul> </div> </div> <div class=\"slds-grid slds-grid--vertical\"> <button class=\"slds-button slds-button--icon-container\"> <svg aria-hidden=\"true\" class=\"slds-button__icon\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#up\"></use> </svg> <span class=\"slds-assistive-text\">Pick list</span> </button> <button class=\"slds-button slds-button--icon-container\"> <svg aria-hidden=\"true\" class=\"slds-button__icon\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#down\"></use> </svg> <span class=\"slds-assistive-text\">Pick list</span> </button> </div> </div>"
  );


  $templateCache.put('views/field.html',
    "<span class=\"fieldwrapper\" ng-if=\"field.visible\"> <label class=\"slds-form-element__label\" for=\"inputSample2\">{{field.label}}</label> <div ng-switch=\"field.type\"> <!-- dynamic field generation --> <div ng-switch-when=\"text\"> <div class=\"slds-form-element__control\"> <input id=\"inputSample2\" class=\"slds-input\" type=\"text\" placeholder=\"\" ng-model=\"field.value\"> </div> </div> <div ng-switch-when=\"date\" smb-field-date required></div> <div ng-switch-when=\"picklist\" smb-field-picklist></div> </div> </span>"
  );


  $templateCache.put('views/form.html',
    "<div ng-repeat=\"page in form.pages\"> <div class=\"slds-text-heading--medium\">{{page.name}}</div> <div class=\"slds-form--stacked\"> <div ng-repeat=\"section in page.sections\"> <div class=\"slds-text-heading--small\">{{section.name}}</div> <div class=\"slds-form-element\" smb-field field=\"field\" ng-repeat=\"field in section.fields\"> <!-- form field template injected here --> </div> </div> </div> </div>"
  );


  $templateCache.put('views/header.html',
    "<div class=\"slds-hint-parent hint-parent-demo\"> <button class=\"slds-button slds-button--icon-border-filled slds-button--icon-border-small\"> <svg aria-hidden=\"true\" class=\"slds-button__icon slds-button__icon--hint slds-button__icon--small\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#down\"></use> </svg> <span class=\"slds-assistive-text\">Show More</span> </button> <button class=\"slds-button slds-button--icon-border\"> <svg aria-hidden=\"true\" class=\"slds-button__icon slds-button__icon--hint\"> <use xlink:href=\"/assets/icons/utility-sprite/svg/symbols.svg#settings\"></use> </svg> <span class=\"slds-assistive-text\">Settings</span> </button> </div>"
  );

}]);
