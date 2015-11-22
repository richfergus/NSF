
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


angular.module('myApp').controller('CourseListCtrl', ['$scope', '$rootScope', '$firebaseArray',
    function($scope, $rootScope, $firebaseArray) {
            // List Courses
            var coursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/courses/');
            var courses = $firebaseArray(coursesRef);
            courses.$loaded()
              .then(function(){
                $scope.courses = courses;
              });
                  // console.log(courses);

              $scope.addCourse  = function (course) {
                  $rootScope.message = 'this user '+ $scope.currentUser.$id +'| this course ' + course.Number;
                  // console.log( $scope.currentUser.$id + course['Course Title'] );

                  var addCourse = new Firebase('https://nsf-class-selector.firebaseio.com/' + 'usercourses').child($rootScope.currentUser.$id).push({

                    "coursenumber": course.Number,
                    "Course Title": course['Course Title'],
                    "days": course.Days,
                    "credits": course.Credits,
                    "faculty": course.Faculty
                  });
              };
             

    }]);





angular.module('myApp').controller('MyCourseList', ['$scope','$rootScope', function ($scope, $rootScope) {
      
                  // Get a database reference to our posts
            
              

              console.log(angular.element(document).scope());

                          
                          var ref = new Firebase('https://nsf-class-selector.firebaseio.com/' + 'usercourses/');

                                // Attach an asynchronous callback to read the data at our posts reference
                                ref.on("value", function(snapshot) {

                                  // console.log(user);
                                  console.log(snapshot.val());
                                // console.log($rootScope.currentUser);

                                }, function (errorObject) {
                                  console.log("The read failed: " + errorObject.code);
                                });


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