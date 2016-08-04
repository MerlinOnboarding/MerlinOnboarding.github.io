'use strict';

angular.module('core').controller('SideNavController', ['$scope', '$rootScope', '$state', 'Authentication', 'Menus', '$mdSidenav',
  function ($scope, $rootScope, $state, Authentication, Menus, $mdSidenav) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;
    //$scope.showNav = $rootScope.showNav;
    $scope.showNav = function() {
      return $rootScope.showNav;
    };

    $scope.focusSection = function() {
      var nav = $mdSidenav('left');
      nav.toggle();
    };
  }
]);
