
var myApp = angular.module('myApp',
  ['ngRoute', 'firebase', 'ngAnimate', 'smart-table', 'ui.bootstrap', 'inform'])
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


angular.module('myApp').controller('CourseListCtrl', ['$scope', '$rootScope', '$firebaseArray','inform',
    function($scope, $rootScope, $firebaseArray, inform) {
          // List Courses
            var coursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/courses/');
            var courses = $firebaseArray(coursesRef);
            courses.$loaded().then(function(){
                $scope.courses = courses;
                // console.log('the root', $scope.courses);
              });
                  // add courses form list to login user
              $scope.addCourse = function (course) {
              // console.log(course);


                  var addUserCourses = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses')
                  .child(course.$id).child($rootScope.currentUser.$id).set({
                    "firstname": $rootScope.currentUser.firstname,
                    "lastname": $rootScope.currentUser.lastname,
                    "coursenumber": course.Number,
                    "Course Title": course['Course Title'],
                    "days": course.Days,
                    "credits": course.Credits,
                    "faculty": course.Faculty,
                  });
                     
                  var addCoursesUser = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser')
                  .child($rootScope.currentUser.$id).child(course.$id).set({
                    "firstname": $rootScope.currentUser.firstname,
                    "lastname": $rootScope.currentUser.lastname,
                    "coursenumber": course.Number,
                    "Course Title": course['Course Title'],
                    "days": course.Days,
                    "credits": course.Credits,
                    "courseID": course.$id,
                    "faculty": course.Faculty
                  });
                      inform.add('Course Added', {
                        ttl: 3200, type: 'success'
                      });
              };

             

    }]);


angular.module('myApp').controller('MyCourseList', ['$scope','$rootScope', '$firebaseArray', 'inform',
     function($scope, $rootScope, $firebaseArray, inform) {
              //get courses that the unser has selected in firebase
              var firstRef = new Firebase('https://nsf-class-selector.firebaseio.com/');
                  // not sure why, but I had to wait on the rootscope so I added this
                    firstRef.on("value", function(snapshot) {
                        var thisUserID =  $rootScope.currentUser.$id;
                        var userCoursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/' + thisUserID);
                        var userCourses = $firebaseArray(userCoursesRef);
                       // console.log(userCourses);
                        userCourses.$loaded()
                              .then(function(){
                                $scope.userCourses = userCourses;
                                 if ($scope.userCourses.length === 0) {
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
                      var coursesUserRef = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses/' +course.$id +'/'+thisUserID);
                      var userCoursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/' +thisUserID +'/'+ course.$id);
                      coursesUserRef.remove();
                      userCoursesRef.remove();
                      inform.add('Course Removed', {
                        ttl: 3200, type: 'warning'
                      });
                   

              };
          }]);
angular.module('myApp').controller('CourseDetailCrtl', ['$scope','$rootScope','$firebaseObject', '$routeParams',
     function($scope, $rootScope, $firebaseObject, $routeParams) {
           //get course detail
           var coursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/courses/').child($routeParams.courseID);
           var coursesDetail =  $firebaseObject(coursesRef);
           coursesDetail.$loaded().then(function(){
                    $scope.courseDetails = {
                           coureseID: $routeParams.courseID,
                           days: coursesDetail.Days,
                           courseName: coursesDetail['Course Title'],
                           faculty: coursesDetail.Faculty,
                           credits: coursesDetail.Credits,
                           number: coursesDetail.Number,

                           };
                  
               // console.log(coursesDetail);
             });
          }]);

angular.module('myApp').controller('coursesByUserCrtl', ['$scope','$rootScope', '$firebaseArray', '$routeParams',
     function($scope, $rootScope, $firebaseArray, $routeParams) {
           //get course detail
           var coursesByUserRef = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses/');
           var coursesByUserDetail = $firebaseArray(coursesByUserRef);
           coursesByUserDetail.$loaded().then(function(){
              $scope.courses = [];

                for (var i = 0; i < coursesByUserDetail.length; i++) {
                    $scope.courses.push(coursesByUserDetail[i]);
                }

              console.log($scope.courses);



              // $scope.courses = coursesByUserDetail;
              //   console.log($scope.courses);

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
    when('/coursedetail/:courseID', {
      templateUrl: 'views/coursedetail.html',
      $routeParams: 'test',
      controller: 'CourseDetailCrtl'
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

