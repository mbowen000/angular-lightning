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

				var template = '<div class="slds-tooltip" role="tooltip">' + 
					'<div class="slds-tooltip__content">' + 
				    	'<div class="slds-tooltip__body">' + 
				    		tooltipContent + 
				    	'</div>' +
				  	'</div>' + 
				'</div>';

				if(scope.templateUrl ) {
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
				} 

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
					if ((left + width) <= (window.pageXOffset + window.innerWidth)) {
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