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