
var myApp = angular.module('myApp',
  ['ngRoute', 'firebase', 'ngAnimate', 'smart-table', 'ui.bootstrap','ui.sortable', 'inform'])
  .constant('FIREBASE_URL', 'https://nsf-class-selector.firebaseio.com/');



angular.module('myApp').controller('CourseListCtrl', ['$scope', '$rootScope', '$firebaseArray','inform',
    function($scope, $rootScope, $firebaseArray, inform) {
          // List Courses
            var coursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/courses/');
            var courses = $firebaseArray(coursesRef);
            courses.$loaded().then(function(){
              $scope.courses = courses;
             
              // add courses from list to login user
              
              var userCoursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/' +$rootScope.currentUser.$id);
              var userCourses = $firebaseArray(userCoursesRef);
              userCourses.$loaded().then(function(data){
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
                              "priority": userCourses.length +1
                            });
                           
                              var addUserCourses = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses')
                              .child(course.$id).child($rootScope.currentUser.$id).update({
                               "firstname": $rootScope.currentUser.firstname,
                               "lastname": $rootScope.currentUser.lastname,
                                "priority": userCourses.length +1
                              });
                                  inform.add('Course Added', {
                                    ttl: 3200, type: 'success'
                                  });
                          };
                              

                            // if success then update priority with $index
               });
          });
    }]);

angular.module('myApp').controller('MyCourseList', ['$scope','$rootScope', '$firebaseArray', 'inform',
     function($scope, $rootScope, $firebaseArray, inform) {
              //get courses that the unser has selected in firebase
              var firstRef = new Firebase('https://nsf-class-selector.firebaseio.com/');
                  // not sure why, but I had to wait on the rootscope so I added this
                    firstRef.on("value", function(snapshot) {
                        var userCoursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/' +$rootScope.currentUser.$id);
                        var userCourses = $firebaseArray(userCoursesRef);
                        userCourses.$loaded().then(function(data){
                            var couresesLength = userCourses.length;
                            


                            $scope.upPriority = function (course){
                               var ref = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/' +$rootScope.currentUser.$id);
                               var oldPri = course.priority;
                                  if (oldPri > 1) {
                                    var newPri = course.priority -1;
                                  }
                                  else {
                                    var newPri = 1;
                                  }
                                
                                // ref.orderByChild("priority").equalTo(oldPri).on("value", function(snapshot) {
                                //   snapshot.forEach(function(data){
                                //     var refNew = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/' +$rootScope.currentUser.$id +'/'+data.key());
                                //     refNew.update({ priority: newPri });
                                //   });
                                // });
                                var onComplete = function(error) {
                                  if (error) {
                                    console.log('Synchronization failed');
                                  } else {
                                    ref.orderByChild("priority").equalTo(oldPri).on("value", function(snapshot) {
                                      snapshot.forEach(function(data){
                                        var refNew = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/' +$rootScope.currentUser.$id +'/'+data.key());
                                        refNew.update({ priority: newPri });
                                      });
                                    });


                                    console.log('Synchronization succeeded');
                                  }
                                };
                                ref.orderByChild("priority").equalTo(newPri).on("value", function(snapshot) {
                                  snapshot.forEach(function(data){
                                    var refOld = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/' +$rootScope.currentUser.$id +'/'+data.key());
                                    refOld.update({ priority: oldPri },onComplete);

                                  });
                                });

                                 // console.log("old is:" + oldPri + " and new is:" + newPri);




                               // var newPri = course.priority -1;
                               // console.log("old is:" + oldPri + " and new is:" + newPri);
                             };

                          // console.log(userCourses.length);
                        });
                  

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
                      var coursesUserRef = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses/' +course.$id +'/'+$rootScope.currentUser.$id);
                      var userCoursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/' +$rootScope.currentUser.$id +'/'+ course.$id).remove();
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

