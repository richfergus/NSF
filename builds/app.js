
var myApp = angular.module('myApp',
  ['ngRoute', 'firebase', 'ngAnimate', 'smart-table', 'ui.bootstrap', 'inform'])
  .constant('FIREBASE_URL', 'https://nsf-class-selector.firebaseio.com/');



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
              $scope.addCourse = function (course)
                    {
                      var addCoursesUser = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/' +$rootScope.currentUser.$id)
                      .child(course.$id).set({
                        "courseID" : course.$id,
                        "coursenumber": course.coursenumber,
                        "coursetitle": course.coursetitle,
                        "schedule": course.schedule,
                        "credits": course.credits,
                        "faculty": course.faculty,
                        "priority": 1
                      });
                        var addUserCourses = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses')
                        .child(course.$id).child($rootScope.currentUser.$id).update({
                         "firstname": $rootScope.currentUser.firstname,
                         "lastname": $rootScope.currentUser.lastname,
                          "priority": 1
                        });
                        // console.log(addUserCourses);
                        
                        
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
                       
                        var sortableEle;
                                    $scope.sortableArray = userCourses;

                                    $scope.dragStart = function(e, ui) {
                                            ui.item.data('start', ui.item.index());
                                        };
                                        $scope.dragEnd = function(e, ui) {
                                            var start = ui.item.data('start'),
                                                end = ui.item.index();
                                            
                                            $scope.sortableArray.splice(end, 0,
                                                $scope.sortableArray.splice(start, 1)[0]);
                                            
                                            $scope.$apply();
                                        };
                                            
                                        sortableEle = $("#myclassesTBL").sortable({
                                            start: $scope.dragStart,
                                            update: $scope.dragEnd
                                        });
                                        
                            console.log(userCourses);
                            


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
                      var userCoursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/' +thisUserID +'/'+ course.$id).remove();
                      coursesUserRef.remove();
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
                           schedule: coursesDetail.schedule,
                           coursename: coursesDetail.coursename,
                           faculty: coursesDetail.faculty,
                           credits: coursesDetail.credits,
                           coursenumber: coursesDetail.coursenumber

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

             });

          }]);
angular.module('myApp').controller('OthersInCourseCtrl', ['$scope','$rootScope', '$firebaseArray', '$routeParams',
     function($scope, $rootScope, $firebaseArray, $routeParams) {
      var coursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses/').child($routeParams.courseID);
      $scope.othersInCourse =  $firebaseArray(coursesRef);
      
      console.log($scope.othersInCourse);
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

