
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
                // console.log('the root', $rootScope.currentUser);
              });
                  // add courses form list to login user
              $scope.addCourse  = function (course) {
                  $rootScope.message = 'this user '+ $scope.currentUser.$id +'| this course ' + course.Number;
                  var addCourse = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses')
                  .child(course.Number).child($rootScope.currentUser.$id).set({
                    "firstname": $rootScope.currentUser.firstname,
                    "lastname": $rootScope.currentUser.lastname,
                    "coursenumber": course.Number,
                    "Course Title": course['Course Title'],
                    "days": course.Days,
                    "credits": course.Credits,
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
                        var userCoursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses/' + thisUserID);
                        var userCourses = $firebaseArray(userCoursesRef);
                       // console.log(thisUserID);
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
                      
                      var userCoursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses/' +thisUserID +'/'+ course.$id);
                      userCoursesRef.remove();
                      inform.add('Course Removed', {
                        ttl: 3200, type: 'warning'
                      });
                   

              };
          }]);
angular.module('myApp').controller('CourseDetailCrtl', ['$scope','$rootScope', '$firebaseArray', '$routeParams',
     function($scope, $rootScope, $firebaseArray, $routeParams) {
           //get course detail
              var refClass = new Firebase("https://nsf-class-selector.firebaseio.com/courses/" +$routeParams.courseID);
              var refClassDetail = $firebaseArray(refClass);
                
                refClassDetail.$loaded().then(function(){
                      $scope.classDetail = refClassDetail;
                      console.log($scope.classDetail);
                  });

              $scope.model= {
                message: ": "+$routeParams.courseID + " and userID: "+$routeParams.userID,
                classDetail: $scope.classDetail
              };
              // $scope.courseDetail = refClass;
              console.log($scope.model);

              var courseDetailRef = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses' +$routeParams.userID +"/" +$routeParams.courseID);
              var courseDetail = $firebaseArray(courseDetailRef);

               
                
              var ref = new Firebase("https://nsf-class-selector.firebaseio.com/usercourses/DPI-802M-B");
                  ref.orderByChild("coursenumber").equalTo('DPI-802M-B').on("child_added", function(snapshot) {
                    // console.log(snapshot.key());
                  });

                  // not sure why, but I had to wait on the rootscope so I added this
                    courseDetailRef.on("value", function(snapshot) {
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
    when('/coursedetail/:userID/:courseID', {
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