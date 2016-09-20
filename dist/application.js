'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'merlin';
  var applicationModuleVendorDependencies = [
    'ngResource', 'ngAnimate', 'ui.router', 'ngFileUpload', 'ngMaterial', 'ui.utils'];


  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider',
  function ($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }
]);


angular.module(ApplicationConfiguration.applicationModuleName).config(['$mdThemingProvider',
  function ($mdThemingProvider) {

    $mdThemingProvider.definePalette('amazingPaletteName', {
      '50': 'ffebee',
      '100': 'ffcdd2',
      '200': 'ef9a9a',
      '300': 'e57373',
      '400': 'ef5350',
      '500': 'f44336',
      '600': 'e53935',
      '700': 'd32f2f',
      '800': 'c62828',
      '900': '1A82E2',
      'A100': 'ff8a80',
      'A200': 'ff5252',
      'A400': 'ff1744',
      'A700': 'd50000',
      'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
      // on this palette should be dark or light

      'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
        '200', '300', '400', 'A100'],
      'contrastLightColors': undefined    // could also specify this if default was 'dark'
    });

    $mdThemingProvider.theme('default')
      .primaryPalette('amazingPaletteName', {
        'default': '900', // by default use shade 400 from the pink palette for primary intentions
        'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
        'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
        'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
      })
      // If you specify less than all of the keys, it will inherit from the
      // default shades
      .accentPalette('deep-purple', {
        'default': '500' // use shade 200 for default, and keep all other shades the same
      });

  }
  ]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
          $state.go('forbidden');
        } else {
          $state.go('authentication.signin').then(function () {
            storePreviousState(toState, toParams);
          });
        }
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    storePreviousState(fromState, fromParams);
  });

  // Store previous state
  function storePreviousState(state, params) {
    // only store this state if it shouldn't be ignored 
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      };
    }
  }
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

(function (app) {
  'use strict';

  app.registerModule('autotasks');
})(ApplicationConfiguration);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('checklists');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('companies');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

(function (app) {
  'use strict';

  app.registerModule('feedbacks');
})(ApplicationConfiguration);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('tasks');

(function (app) {
  'use strict';

  app.registerModule('todotasks');
})(ApplicationConfiguration);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('usergroups');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

'use strict';

// Setting up route
angular.module('autotasks').config(['$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider
      .state('autotasks', {
        abstract: true,
        url: '/autotasks',
        template: '<ui-view/>'
      })
      .state('autotasks.list', {
        url: '',
        templateUrl: 'modules/autotasks/client/views/list-autotasks.client.view.html'
      })
      .state('autotasks.create', {
        url: '/create',
        templateUrl: 'modules/autotasks/client/views/create-company.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('autotasks.view', {
        url: '/:autotaskId',
        templateUrl: 'modules/autotasks/client/views/view-company.client.view.html'
      })
      .state('autotasks.edit', {
        url: '/:autotaskId/edit',
        templateUrl: 'modules/autotasks/client/views/edit-company.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

(function () {
  'use strict';

  // Autotasks controller
  angular
    .module('autotasks')
    .controller('AutotasksController', AutotasksController);

  AutotasksController.$inject = ['$scope', 'Authentication', 'autotaskResolve'];

  function AutotasksController ($scope, Authentication, autotask) {
    var vm = this;

    vm.authentication = Authentication;
    vm.autotask = autotask;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Autotask
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.autotask.$remove(
          //$state.go('autotasks.list')
          );
      }
    }

    // Save Autotask
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.autotaskForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.autotask._id) {
        vm.autotask.$update(successCallback, errorCallback);
      } else {
        vm.autotask.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        /*
        TODO
        $state.go('autotasks.view', {
          autotaskId: res._id
        }); */
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();

(function () {
  'use strict';

  angular
    .module('autotasks')
    .controller('AutotasksListController', AutotasksListController);

  AutotasksListController.$inject = ['AutotasksService'];

  function AutotasksListController(AutotasksService) {
    var vm = this;

    vm.autotasks = AutotasksService.query();
  }
})();

//Autotasks service used to communicate Autotasks REST endpoints
(function () {
  'use strict';

  angular
    .module('autotasks')
    .factory('AutotasksService', AutotasksService);

  AutotasksService.$inject = ['$resource'];

  function AutotasksService($resource) {
    return $resource('api/autotasks/:autotaskId', {
      autotaskId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

'use strict';

// Configuring the Articles module
angular.module('checklists').run(['Menus',
  function (Menus) {
    // Add the articles dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Checklists',
      state: 'checklists',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'checklists', {
      title: 'List checklists',
      state: 'checklists.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'checklists', {
      title: 'Create checklists',
      state: 'checklists.create',
      roles: ['user']
    });
  }
]);

'use strict';

// Setting up route
angular.module('checklists').config(['$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider
      .state('checklists', {
        abstract: true,
        url: '/checklists',
        template: '<ui-view/>'
      })
      .state('checklists.list', {
        url: '',
        templateUrl: 'modules/checklists/client/views/list-checklists.client.view.html'
      })
      .state('checklists.create', {
        url: '/create',
        templateUrl: 
          'modules/checklists/client/views/create-checklist.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('checklists.view', {
        url: '/:checklistId',
        templateUrl: 'modules/checklists/client/views/view-checklist.client.view.html'
      })
      .state('checklists.edit', {
        url: '/:checklistId/edit',
        templateUrl: 'modules/articles/client/views/edit-checklist.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

// checklists controller
angular.module('checklists').controller('ChecklistsController', [
  '$scope', '$stateParams', '$location', 'Authentication', 'Checklists',
  function ($scope, $stateParams, $location, Authentication, Checklists) {
    $scope.authentication = Authentication;

    $scope.items = [];

    // Create new checklist
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'checklistForm');

        return false;
      }

      // Create new checklist object
      var checklist = new Checklists({
        title: this.title,
        content: this.content
      });

      // Redirect after save
      checklist.$save(function (response) {
        $location.path('checklists/' + response[0].id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing checklist
    $scope.remove = function (checklist) {
      if (checklist) {
        checklist.$remove();

        for (var i in $scope.checklists) {
          if ($scope.checklists[i] === checklist) {
            $scope.checklists.splice(i, 1);
          }
        }
      } else {
        $scope.checklist.$remove(function () {
          $location.path('checklists');
        });
      }
    };

    $scope.addItem = function() {
      $scope.items.push({
        type: 'YN'
      });
    };

    // Update existing checklist
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'checklistForm');

        return false;
      }

      var checklist = $scope.checklist;

      checklist.$update(function () {
        $location.path('checklists/' + checklist._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of checklists
    $scope.find = function () {
      console.log('Finding...');
      $scope.checklists = Checklists.query();
    };

    // Find existing checklist
    $scope.findOne = function () {
      $scope.checklist = Checklists.get({
        checklistId: $stateParams.checklistId
      });
    };
  }
]);

'use strict';

//checklists service used for communicating with the checklists REST endpoints
angular.module('checklists').factory('Checklists', ['$resource',
  function ($resource) {
    return $resource('api/checklists/:articleId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Configuring the Articles module
angular.module('companies').run(['Menus',
  function (Menus) {
    // Add the articles dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Companies',
      state: 'companies',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'companies', {
      title: 'List Companies',
      state: 'companies.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'companies', {
      title: 'Create Companies',
      state: 'companies.create',
      roles: ['user']
    });
  }
]);

'use strict';

// Setting up route
angular.module('companies').config(['$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider
      .state('companies', {
        abstract: true,
        url: '/companies',
        template: '<ui-view/>'
      })
      .state('companies.list', {
        url: '',
        templateUrl: 'modules/companies/client/views/list-companies.client.view.html'
      })
      .state('companies.create', {
        url: '/create',
        templateUrl: 'modules/companies/client/views/create-company.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('companies.view', {
        url: '/:companyId',
        templateUrl: 'modules/companies/client/views/view-company.client.view.html'
      })
      .state('companies.edit', {
        url: '/:companyId/edit',
        templateUrl: 'modules/companies/client/views/edit-company.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

// Company controller
angular.module('companies').controller('CompaniesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Companies',
  function ($scope, $stateParams, $location, Authentication, Companies) {
    $scope.authentication = Authentication;

    // Create new Company
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'companyForm');

        return false;
      }

      // Create new Comapny object
      var company = new Companies({
        title: this.title,
        content: this.content
      });

      // Redirect after save
      company.$save(function (response) {
        $location.path('companies/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Company
    $scope.remove = function (company) {
      if (company) {
        company.$remove();

        for (var i in $scope.companies) {
          if ($scope.companies[i] === company) {
            $scope.companies.splice(i, 1);
          }
        }
      } else {
        $scope.company.$remove(function () {
          $location.path('companies');
        });
      }
    };

    // Update existing Company
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'companyForm');

        return false;
      }

      var company = $scope.company;

      company.$update(function () {
        $location.path('companies/' + company._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Companies
    $scope.find = function () {
      $scope.companies = Companies.query();
    };

    // Find existing Company
    $scope.findOne = function () {
      $scope.company = Companies.get({
        companyId: $stateParams.companyId
      });
    };
  }
]);

'use strict';

//Companies service used for communicating with the companies REST endpoints
angular.module('companies').factory('Companies', ['$resource',
  function ($resource) {
    return $resource('api/companies/:companyId', {
      companyId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'modules/core/client/views/home.client.view.html'
    })
    .state('notavailable', {
      url: '/notavailable',
      templateUrl: 'modules/core/client/views/notavailable.client.view.html'
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    });
  }
]);

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

'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);

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

'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
  .directive('showErrors', ['$timeout', '$interpolate', function ($timeout, $interpolate) {
    var linkFn = function (scope, el, attrs, formCtrl) {
      var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
        initCheck = false,
        showValidationMessages = false,
        blurred = false;

      options = scope.$eval(attrs.showErrors) || {};
      showSuccess = options.showSuccess || false;
      inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute class';
      }

      var reset = function () {
        return $timeout(function () {
          el.removeClass('has-error');
          el.removeClass('has-success');
          showValidationMessages = false;
        }, 0, false);
      };

      scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        return toggleClasses(invalid);
      });

      scope.$on('show-errors-check-validity', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          initCheck = true;
          showValidationMessages = true;

          return toggleClasses(formCtrl[inputName].$invalid);
        }
      });

      scope.$on('show-errors-reset', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          return reset();
        }
      });

      toggleClasses = function (invalid) {
        el.toggleClass('has-error', showValidationMessages && invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', showValidationMessages && !invalid);
        }
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      compile: function (elem, attrs) {
        if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
          if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
            throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
          }
        }
        return linkFn;
      }
    };
  }]);

'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector',
  function ($q, $injector) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['user', 'admin'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if(!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: ['*']
    });
  }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

(function () {
  'use strict';

  angular
    .module('feedbacks')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('feedbacks', {
        abstract: true,
        url: '/feedbacks',
        template: '<ui-view/>'
      })
      .state('feedbacks.list', {
        url: '',
        templateUrl: 'modules/feedbacks/client/views/list-feedbacks.client.view.html',
        controller: 'FeedbacksListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Feedbacks List'
        }
      })
      .state('feedbacks.create', {
        url: '/create',
        templateUrl: 'modules/feedbacks/client/views/form-feedback.client.view.html',
        controller: 'FeedbacksController',
        controllerAs: 'vm',
        resolve: {
          feedbackResolve: newFeedback
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Feedbacks Create'
        }
      })
      .state('feedbacks.edit', {
        url: '/:feedbackId/edit',
        templateUrl: 'modules/feedbacks/client/views/form-feedback.client.view.html',
        controller: 'FeedbacksController',
        controllerAs: 'vm',
        resolve: {
          feedbackResolve: getFeedback
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Feedback {{ feedbackResolve.name }}'
        }
      })
      .state('feedbacks.view', {
        url: '/:feedbackId',
        templateUrl: 'modules/feedbacks/client/views/view-feedback.client.view.html',
        controller: 'FeedbacksController',
        controllerAs: 'vm',
        resolve: {
          feedbackResolve: getFeedback
        },
        data:{
          pageTitle: 'Feedback {{ articleResolve.name }}'
        }
      });
  }

  getFeedback.$inject = ['$stateParams', 'FeedbacksService'];

  function getFeedback($stateParams, FeedbacksService) {
    return FeedbacksService.get({
      feedbackId: $stateParams.feedbackId
    }).$promise;
  }

  newFeedback.$inject = ['FeedbacksService'];

  function newFeedback(FeedbacksService) {
    return new FeedbacksService();
  }
})();

(function () {
  'use strict';

  // Feedbacks controller
  angular
    .module('feedbacks')
    .controller('FeedbacksController', FeedbacksController);

  FeedbacksController.$inject = ['$scope', '$state', 'Authentication', 'feedbackResolve'];

  function FeedbacksController ($scope, $state, Authentication, feedback) {
    var vm = this;

    vm.authentication = Authentication;
    vm.feedback = feedback;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Feedback
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.feedback.$remove($state.go('feedbacks.list'));
      }
    }

    // Save Feedback
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.feedbackForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.feedback._id) {
        vm.feedback.$update(successCallback, errorCallback);
      } else {
        vm.feedback.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('feedbacks.view', {
          feedbackId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();

(function () {
  'use strict';

  angular
    .module('feedbacks')
    .controller('FeedbacksListController', FeedbacksListController);

  FeedbacksListController.$inject = ['FeedbacksService'];

  function FeedbacksListController(FeedbacksService) {
    var vm = this;

    vm.feedbacks = FeedbacksService.query();
  }
})();

//Feedbacks service used to communicate Feedbacks REST endpoints
(function () {
  'use strict';

  angular
    .module('feedbacks')
    .factory('FeedbacksService', FeedbacksService);

  FeedbacksService.$inject = ['$resource'];

  function FeedbacksService($resource) {
    return $resource('api/feedbacks/:feedbackId', {
      feedbackId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

'use strict';

// Configuring the tasks module
angular.module('tasks').run(['Menus',
  function (Menus) {
    // Add the tasks dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Tasks',
      state: 'tasks',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'tasks', {
      title: 'List tasks',
      state: 'tasks.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'tasks', {
      title: 'Create tasks',
      state: 'tasks.create',
      roles: ['user']
    });
  }
]);

'use strict';

// Setting up route
angular.module('tasks').config(['$stateProvider',
  function ($stateProvider) {
    // tasks state routing
    $stateProvider
      .state('tasks', {
        abstract: true,
        url: '/tasks',
        template: '<ui-view/>'
      })
      .state('tasks.list', {
        url: '',
        templateUrl: 'modules/tasks/client/views/list-tasks.client.view.html'
      })
      .state('tasks.create', {
        url: '/create',
        templateUrl: 'modules/tasks/client/views/create-task.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('tasks.view', {
        url: '/:taskId',
        templateUrl: 'modules/tasks/client/views/view-task.client.view.html'
      })
      .state('tasks.edit', {
        url: '/:taskId/edit',
        templateUrl: 'modules/tasks/client/views/edit-task.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

// tasks controller
angular.module('tasks').controller('TasksController', ['$scope', '$stateParams', '$location', 'Authentication', 'Tasks',
  function ($scope, $stateParams, $location, Authentication, Tasks) {
    $scope.authentication = Authentication;

    // Create new task
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'taskForm');

        return false;
      }

      // Create new task object
      var task = new Tasks({
        title: this.title,
        content: this.content
      });

      // Redirect after save
      task.$save(function (response) {
        $location.path('tasks/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing task
    $scope.remove = function (task) {
      if (task) {
        task.$remove();

        for (var i in $scope.tasks) {
          if ($scope.tasks[i] === task) {
            $scope.tasks.splice(i, 1);
          }
        }
      } else {
        $scope.task.$remove(function () {
          $location.path('tasks');
        });
      }
    };

    // Update existing task
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'taskForm');

        return false;
      }

      var task = $scope.task;

      task.$update(function () {
        $location.path('tasks/' + task._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of tasks
    $scope.find = function () {
      $scope.tasks = Tasks.query();
    };

    // Find existing task
    $scope.findOne = function () {
      $scope.task = Tasks.get({
        taskId: $stateParams.taskId
      });
    };
  }
]);

'use strict';

//tasks service used for communicating with the tasks REST endpoints
angular.module('tasks').factory('Tasks', ['$resource',
  function ($resource) {
    return $resource('api/tasks/:taskId', {
      taskId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

(function () {
  'use strict';

  angular
    .module('todotasks')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('todotasks', {
        abstract: true,
        url: '/todotasks',
        template: '<ui-view/>'
      })
      .state('todotasks.list', {
        url: '',
        templateUrl: 'modules/todotasks/client/views/list-todotasks.client.view.html',
        controller: 'TodotasksListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'todotasks List'
        }
      })
      .state('todotasks.create', {
        url: '/create',
        templateUrl: 'modules/todotasks/client/views/form-todotask.client.view.html',
        controller: 'TodotasksController',
        controllerAs: 'vm',
        resolve: {
          todotaskResolve: newTodotask
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'todotasks Create'
        }
      })
      .state('todotasks.edit', {
        url: '/:todotaskId/edit',
        templateUrl: 'modules/todotasks/client/views/form-todotask.client.view.html',
        controller: 'TodotaskController',
        controllerAs: 'vm',
        resolve: {
          todotaskResolve: getTodotask
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Todotask {{ todotaskResolve.name }}'
        }
      })
      .state('todotasks.view', {
        url: '/:todotaskId',
        templateUrl: 'modules/todotasks/client/views/view-todotask.client.view.html',
        controller: 'TodotasksController',
        controllerAs: 'vm',
        resolve: {
          todotaskResolve: getTodotask
        },
        data:{
          pageTitle: 'Todotask {{ todotaskResolve.name }}'
        }
      });
  }

  getTodotask.$inject = ['$stateParams', 'TodotasksService'];

  function getTodotask($stateParams, TodotasksService) {
    return TodotasksService.get({
      todotaskId: $stateParams.todotaskId
    }).$promise;
  }

  newTodotask.$inject = ['TodotasksService'];

  function newTodotask(TodotasksService) {
    return new TodotasksService();
  }
})();

(function () {
  'use strict';

  angular
    .module('todotasks')
    .controller('TodotasksListController', TodotasksListController);

  TodotasksListController.$inject = ['TodotasksService'];

  function TodotasksListController(TodotasksService) {
    var vm = this;

    vm.todotasks = TodotasksService.query();
  }
})();

(function () {
  'use strict';

  // todotasks controller
  angular
    .module('todotasks')
    .controller('TodotasksController', TodotasksController);

  TodotasksController.$inject = ['$scope', 'Authentication', 'todotaskResolve'];

  function TodotasksController ($scope, Authentication, todotask) {
    var vm = this;

    vm.authentication = Authentication;
    vm.todotask = todotask;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing todotask
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.todotask.$remove(
          //TODO
          //$state.go('todotasks.list')
          );
      }
    }

    // Save Todotask
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.todotaskForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.todotask._id) {
        vm.todotask.$update(successCallback, errorCallback);
      } else {
        vm.todotask.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        /**TODO 
        $state.go('todotasks.view', {
          todotaskId: res._id
        });
        */
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();

//todotasks service used to communicate todotasks REST endpoints
(function () {
  'use strict';

  angular
    .module('todotasks')
    .factory('TodotasksService', TodotasksService);

  TodotasksService.$inject = ['$resource'];

  function TodotasksService($resource) {
    return $resource('api/todotasks/:todotaskId', {
      todotaskId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

'use strict';

// Configuring the usergroups module
angular.module('usergroups').run(['Menus',
  function (Menus) {
    // Add the usergroups dropdown item
    Menus.addMenuItem('topbar', {
      title: 'usergroups',
      state: 'usergroups',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'usergroups', {
      title: 'List usergroups',
      state: 'usergroups.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'usergroups', {
      title: 'Create usergroups',
      state: 'usergroups.create',
      roles: ['user']
    });
  }
]);

'use strict';

// Setting up route
angular.module('usergroups').config(['$stateProvider',
  function ($stateProvider) {
    // usergroup state routing
    $stateProvider
      .state('usergroups', {
        abstract: true,
        url: '/usergroups',
        template: '<ui-view/>'
      })
      .state('usergroups.list', {
        url: '',
        templateUrl: 'modules/usergroups/client/views/list-usergroups.client.view.html'
      })
      .state('usergroups.create', {
        url: '/create',
        templateUrl: 'modules/usergroups/client/views/create-usergroup.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('usergroups.view', {
        url: '/:usergroupId',
        templateUrl: 'modules/usergroups/client/views/view-usergroup.client.view.html'
      })
      .state('usergroups.edit', {
        url: '/:usergroupId/edit',
        templateUrl: 'modules/usergroups/client/views/edit-usergroup.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

// usergroups controller
angular.module('usergroups').controller('UsergroupsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Usergroups',
  function ($scope, $stateParams, $location, Authentication, Usergroups) {
    $scope.authentication = Authentication;

    // Create new usergroup
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'usergroupForm');

        return false;
      }

      // Create new usergroup object
      var usergroup = new Usergroups({
        title: this.title,
        content: this.content
      });

      // Redirect after save
      usergroup.$save(function (response) {
        $location.path('usergroups/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing usergroup
    $scope.remove = function (usergroup) {
      if (usergroup) {
        usergroup.$remove();

        for (var i in $scope.usergroups) {
          if ($scope.usergroups[i] === usergroup) {
            $scope.usergroups.splice(i, 1);
          }
        }
      } else {
        $scope.usergroup.$remove(function () {
          $location.path('usergroups');
        });
      }
    };

    // Update existing usergroup
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'usergroupForm');

        return false;
      }

      var usergroup = $scope.usergroup;

      usergroup.$update(function () {
        $location.path('usergroups/' + usergroup._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Articles
    $scope.find = function () {
      $scope.usergroups = Usergroups.query();
    };

    // Find existing Article
    $scope.findOne = function () {
      $scope.usergroup = Usergroups.get({
        usergroupId: $stateParams.usergroupId
      });
    };
  }
]);

'use strict';

//usergroups service used for communicating with the usergroups REST endpoints
angular.module('usergroups').factory('Usergroups', ['$resource',
  function ($resource) {
    return $resource('api/usergroup/:usergroupId', {
      usergroupId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      });
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = $scope.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function ($scope, $http, Authentication, PasswordValidator) {
    $scope.user = Authentication.user;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, Authentication, FileUploader) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          var status = true;
          if (password) {
            var result = PasswordValidator.getResult(password);
            var requirementsIdx = 0;

            // Requirements Meter - visual indicator for users
            var requirementsMeter = [
              { color: 'danger', progress: '20' },
              { color: 'warning', progress: '40' },
              { color: 'info', progress: '60' },
              { color: 'primary', progress: '80' },
              { color: 'success', progress: '100' }
            ];

            if (result.errors.length < requirementsMeter.length) {
              requirementsIdx = requirementsMeter.length - result.errors.length - 1;
            }

            scope.requirementsColor = requirementsMeter[requirementsIdx].color;
            scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

            if (result.errors.length) {
              scope.popoverMsg = PasswordValidator.getPopoverMsg();
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.popoverMsg = '';
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);

'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var status = true;
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, function(value) {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              var origin = scope.passwordVerify;
              return (origin !== password) ? false : true;
            };
          }
        });
      }
    };
  }]);

'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Please enter a passphrase or password with greater than 10 characters, numbers, lowercase, upppercase, and special characters.';
        return popoverMsg;
      }
    };
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
