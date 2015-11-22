
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
                  // add courses form list to login user
              $scope.addCourse  = function (course) {
                  $rootScope.message = 'this user '+ $scope.currentUser.$id +'| this course ' + course.Number;
                  var addCourse = new Firebase('https://nsf-class-selector.firebaseio.com/' + 'usercourses')
                  .child($rootScope.currentUser.$id).push({
                    "coursenumber": course.Number,
                    "Course Title": course['Course Title'],
                    "days": course.Days,
                    "credits": course.Credits,
                    "faculty": course.Faculty
                  });
              };
    }]);


angular.module('myApp').controller('MyCourseList', ['$scope','$rootScope', '$firebaseArray',
     function($scope, $rootScope, $firebaseArray) {
              //get courses that the unser has selected in firebase
              var firstRef = new Firebase('https://nsf-class-selector.firebaseio.com/');
                  // not sure why, but I had to wait on the rootscope so I added this
                    firstRef.on("value", function(snapshot) {
                        var thisUserID =  $rootScope.currentUser.$id;
                        var userCoursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses/' + thisUserID);
                        var userCourses = $firebaseArray(userCoursesRef);
                       
                        userCourses.$loaded()
                              .then(function(){
                                $scope.userCourses = userCourses;
                                 if ($scope.userCourses.length == 0) {
                                    $scope.showClass  = true;
                                } else {
                                    $scope.showClass = false;
                                }
                              });
                      }, function (errorObject) {
                        console.log("The read failed: " + errorObject.code);
                      });
                  $scope.removeCourse  = function (course) {
                      var thisUserID =  $rootScope.currentUser.$id;
                      var userCoursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses/' +thisUserID +'/'+ course.$id);
                      userCoursesRef.remove();
              };
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