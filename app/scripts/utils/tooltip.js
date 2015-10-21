angular.module('testapp.tooltip', [])

	.directive('smbTooltip', ['$compile', function($compile) {
		'use strict';
		return {
			scope: {
				value: '=',

			},
			link: function(scope, element, attrs) {
				
				var tooltipContent = attrs.smbTooltip;

				var template = '<div class="slds-tooltip slds-nubbin--left" role="tooltip">' + 
					'<div class="slds-tooltip__content">' + 
				    	'<div class="slds-tooltip__body">' + 
				    		tooltipContent + 
				    	'</div>' +
				  	'</div>' + 
				'</div>';

				var tooltipElement = $compile(template)(scope);

				var showTooltip = function() {
					var pos = $(element).offset();
					
					
					$('body').append(tooltipElement);
					$(tooltipElement).hide();

					var top = pos.top - ($(tooltipElement).height() / 2) + 5;
					var left = pos.left + $(element).outerWidth() + 20;

					$(tooltipElement).css({
						position: 'absolute',
						top: top + 'px',
						left: left + 'px'
					});
					$(tooltipElement).show();
					
				};	
				var removeTooltip = function() {
					//todo: destroy the scope and any other cleanup
					tooltipElement.remove();
				};

				$(element).hover(showTooltip, removeTooltip);

			}
		};		
	}]);