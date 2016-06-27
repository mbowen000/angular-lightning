angular.module('angular-lightning.sticky', [])

.directive('liSticky', ['$compile', function($compile) {
	'use strict';

	return {
		link: function(scope, element, attrs) {
			var originalWidth = $(element).width();

			// put a "ghost" element to retain width tracking of the parent
			var ghostE = "<div style=\"width:100%\"></div>";
			var ghost = $compile(ghostE)(scope);

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
	   			$(element).css({height: $(window).height()-headerHeight});
			};

			// bind the window resize event to recalculate the height
			$(window).resize(resize);
			resize();

			// this will make the affixed nav scroll down to eliminate the gap above it until it clears it
			var scrollPosition = function() {
				var gap = $(".slds-page-header").outerHeight();
				var scrollPos = $(window).scrollTop();
				if(scrollPos < gap) {
					$(element).css({marginTop: 0-scrollPos});
					resize(scrollPos);
				}
				else {
					$(element).css({marginTop: 0-gap});
					$(element).css({height: $(window).height()});

				}
			};

			$(window).scroll(scrollPosition);
			$(window).bind('gesturechange', scrollPosition);
			scrollPosition();
		}
	};
}]);