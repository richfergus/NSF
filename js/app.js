
var myApp = angular.module('myApp',
  ['ngRoute', 'firebase', 'ngAnimate', 'smart-table', 'ui.bootstrap'])
  .constant('FIREBASE_URL', 'https://nsf-class-selector.firebaseio.com/');



angular.module('myApp').controller('ButtonsCtrl', function ($scope) {
  $scope.singleModel = 1;

  $scope.radioModel = 'Middle';

  $scope.checkModel = {
    left: false,
    middle: true,
    right: false
  };

  $scope.checkResults = [];

  $scope.$watchCollection('checkModel', function () {
    $scope.checkResults = [];
    angular.forEach($scope.checkModel, function (value, key) {
      if (value) {
        $scope.checkResults.push(key);
      }
    });
  });
});

angular.module('myApp').controller('basicsCtrl', ['$scope', function ($scope) {
    $scope.rowCollection = [
        {firstName: 'Laurent', lastName: 'Renard', birthDate: new Date('1987-05-21'), balance: 102, email: 'whatever@gmail.com'},
        {firstName: 'Blandine', lastName: 'Faivre', birthDate: new Date('1987-04-25'), balance: -2323.22, email: 'oufblandou@gmail.com'},
        {firstName: 'Francoise', lastName: 'Frere', birthDate: new Date('1955-08-27'), balance: 42343, email: 'raymondef@gmail.com'}
    ];
}]);

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
// function AngularWayChangeDataCtrl($resource, DTOptionsBuilder, DTColumnDefBuilder) {
//     var vm = this;
//     vm.courses = $resource('hks.json').query();
//     vm.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers');
//     vm.dtColumnDefs = [
//         DTColumnDefBuilder.newColumnDef(0),
//         DTColumnDefBuilder.newColumnDef(1),
//         DTColumnDefBuilder.newColumnDef(2),
//         DTColumnDefBuilder.newColumnDef(3).notSortable()
//     ];
//     vm.courses2add = _buildCourse2Add(1);
//     vm.addCourse = addCourse;
//     vm.modifyCourse = modifyCourse;
//     vm.removeCourse = removeCourse;

//     function _buildCourse2Add(Number) {
//         return {
//             Number: 'Number',
//             Title: '[Course]Title',
//             Semester: 'Semester'
//         };
//     }
//     function addCourse() {
//         vm.courses.push(angular.copy(vm.courses2add));
//         vm.courses2add = _buildCourse2Add(vm.courses2add.Number + 1);
//     }
//     function modifyCourse(index) {
//         vm.courses.splice(index, 1, angular.copy(vm.courses2add));
//         vm.courses2add = _buildCourse2Add(vm.courses2add.Number + 1);
//     }
//     function removeCourse(index) {
//         vm.courses.splice(index, 1);
//     }
// }





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