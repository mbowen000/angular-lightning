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