angular.module('angular-lightning.tabs', [])

.controller('liTabsetController', ['$scope', function ($scope) {
	'use strict';
	var ctrl = this, tabs = ctrl.tabs = $scope.tabs = [];

	ctrl.select = function(selectedTab) {
		angular.forEach(tabs, function(tab) {
			if (tab.active && tab !== selectedTab) {
				tab.active = false;
				tab.onDeselect();
				selectedTab.selectCalled = false;
			}
		});
		selectedTab.active = true;
		
		if (!selectedTab.selectCalled) {
			selectedTab.onSelect();
			selectedTab.selectCalled = true;
		}
	};

	ctrl.addTab = function addTab(tab) {
		tabs.push(tab);
		// we can't run the select function on the first tab
		// since that would select it twice
		if (tabs.length === 1 && tab.active !== false) {
		  tab.active = true;
		} else if (tab.active) {
		  ctrl.select(tab);
		} else {
		  tab.active = false;
		}
	};

	ctrl.removeTab = function removeTab(tab) {
		var index = tabs.indexOf(tab);
		
		if (tab.active && tabs.length > 1 && !destroyed) {
		  var newActiveIndex = index === tabs.length - 1 ? index - 1 : index + 1;
		  ctrl.select(tabs[newActiveIndex]);
		}
		tabs.splice(index, 1);
	};

	var destroyed;
	$scope.$on('$destroy', function() {
		destroyed = true;
	});
}])

.directive('liTabset', function() {
	'use strict';
	return {
		transclude: true,
		replace: true,
		scope: {
			type: '@'
		},
		controller: 'liTabsetController',
		templateUrl: 'views/util/tabset.html',
		link: function(scope, element, attrs) {
			scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
		    scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
		}
	};
})

.directive('liTab', ['$parse', function($parse) {
	'use strict';
	return {
		require: '^liTabset',
		replace: true,
		templateUrl: 'views/util/tab.html',
		transclude: true,
		scope: {
		  active: '=?',
		  heading: '@',
		  onSelect: '&select',
		  onDeselect: '&deselect'
		},
		controller: function() {

		},
		controllerAs: 'tab',
		link: function(scope, elm, attrs, tabsetCtrl, transclude) {
			scope.$watch('active', function(active) {
				if (active) {
				    tabsetCtrl.select(scope);
				}
			});

			scope.disabled = false;

			if (attrs.disable) {
				scope.$parent.$watch($parse(attrs.disable), function(value) {
				    scope.disabled = !! value;
				});
			}

			scope.select = function() {
				if (!scope.disabled) {
				    scope.active = true;
				}
			};

			tabsetCtrl.addTab(scope);

			scope.$on('$destroy', function() {
		        tabsetCtrl.removeTab(scope);
		    });

			scope.$transcludeFn = transclude;
		}
	};
}])

.directive('liTabHeadingTransclude', function() {
	'use strict';
	return {
	restrict: 'A',
	require: '^liTab',
	link: function(scope, elm) {
		scope.$watch('headingElement', function updateHeadingElement(heading) {
			if (heading) {
			    elm.html('');
			    elm.append(heading);
			}
		});
	}
	};
})

.directive('liTabContentTransclude', function() {
	'use strict';
	return {
		restrict: 'A',
		require: '^liTabset',
		link: function(scope, elm, attrs) {
		  var tab = scope.$eval(attrs.liTabContentTransclude);

		  tab.$transcludeFn(tab.$parent, function(contents) {
		    angular.forEach(contents, function(node) {
		      if (isTabHeading(node)) {
		        //Let tabHeadingTransclude know.
		        tab.headingElement = node;
		      } else {
		        elm.append(node);
		      }
		    });
		  });
		}
	};

	function isTabHeading(node) {
		return node.tagName && (
		  node.hasAttribute('li-tab-heading') ||
		  node.hasAttribute('data-li--tab-heading') ||
		  node.hasAttribute('x-li--tab-heading') ||
		  node.tagName.toLowerCase() === 'li--tab-heading' ||
		  node.tagName.toLowerCase() === 'data-li--tab-heading' ||
		  node.tagName.toLowerCase() === 'x-li--tab-heading'
		);
	}
});