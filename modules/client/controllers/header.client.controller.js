'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$rootScope', '$state', 'Authentication', 'Menus', '$mdSidenav',
  function ($scope, $rootScope, $state, Authentication, Menus, $mdSidenav) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });

    $scope.openMenu = function($mdOpenMenu, ev) {
      $mdOpenMenu(ev);
    };

    $rootScope.showNav = true;

    $scope.toggleSidenav = function() {
      //$rootScope.showNav = !$rootScope.showNav;
      var nav = $mdSidenav('left');
      nav.toggle();
    };
  }
]);
