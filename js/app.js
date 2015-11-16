
var myApp = angular.module('myApp',
  ['ngRoute', 'firebase', 'ngAnimate', 'ngResource', 'datatables', 'ui.bootstrap'])
  .constant('FIREBASE_URL', 'https://nsf-class-selector.firebaseio.com/').controller('AngularWayChangeDataCtrl', AngularWayChangeDataCtrl);

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


function AngularWayChangeDataCtrl($resource, DTOptionsBuilder, DTColumnDefBuilder) {
    var vm = this;
    vm.courses = $resource('hks.json').query();
    vm.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers');
    vm.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2),
        DTColumnDefBuilder.newColumnDef(3).notSortable()
    ];
    vm.courses2add = _buildCourse2Add(1);
    vm.addCourse = addCourse;
    vm.modifyCourse = modifyCourse;
    vm.removeCourse = removeCourse;

    function _buildCourse2Add(Number) {
        return {
            Number: 'Number',
            Days: 'Days',
            Semester: 'Semester'
        };
    }
    function addCourse() {
        vm.courses.push(angular.copy(vm.courses2add));
        vm.courses2add = _buildCourse2Add(vm.courses2add.Number + 1);
    }
    function modifyCourse(index) {
        vm.courses.splice(index, 1, angular.copy(vm.courses2add));
        vm.courses2add = _buildCourse2Add(vm.courses2add.Number + 1);
    }
    function removeCourse(index) {
        vm.courses.splice(index, 1);
    }
}





    // $resource('hks.json').query().$promise.then(function(courses) {
    //     vm.courses = courses;
    // });


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