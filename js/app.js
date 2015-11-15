
var myApp = angular.module('myApp',
  ['ngRoute', 'firebase', 'ngAnimate', 'ui.bootstrap'])
  .constant('FIREBASE_URL', 'https://nsf-class-selector.firebaseio.com/');

myApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/login', {
      templateUrl: 'views/login.html',
      controller: 'RegistrationController'
    }).
    when('/register', {
      templateUrl: 'views/register.html',
      controller: 'RegistrationController'
    }).
    when('/myclasses', {
      templateUrl: 'views/myclasses.html',
      controller: 'RegistrationController'
    }).
    when('/classes', {
      templateUrl: 'views/classes.html',
      controller: 'RegistrationController'
    }).
    when('/success', {
      templateUrl: 'views/success.html',
      controller: 'SuccessController',
      resolve: {
          currentAuth: function(Authentication){
            return Authentication.requireAuth();
          }
      }
    }).
    otherwise({
      redirectTo: '/login'
    });
}]);

angular.module('myApp').controller('CollapseDemoCtrl', function ($scope) {
  $scope.isCollapsed = false;
});
angular.module('myApp').controller('DropdownCtrl', function ($scope, $log) {

});

myApp.run(['$rootScope', '$location',
   function($rootScope, $location) {
      $rootScope.$on('$routeChangeError',
          function(event, next, previous, error){
              if (error == 'AUTH_REQUIRED') {
                $rootScope.message = 'Sorry, you must log in to accsess that page';
                $location.path('/logon');
              }
          });
  
}]);