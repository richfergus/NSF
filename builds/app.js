
     $(function() {
        $( "#sortable" ).sortable();
        $( "#sortable" ).disableSelection();
      });

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
             
              // add courses from list to login user
              
              var userCoursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/' +$rootScope.currentUser.$id);
              var userCourses = $firebaseArray(userCoursesRef);
              
              userCourses.$loaded().then(function(data){
                
                    $scope.addCourse = function (course)
                          {
                              userCoursesRef.orderByChild("priority").limitToLast(1).on("child_added", function(snapshot) {
                                // console.log(snapshot.key());
                                $scope.pri = snapshot.key();
                              });

                             var array = [$scope.pri, userCourses.length];
                             var largest = Math.max.apply(Math, array); // 306
                              // console.log("pri is:" +$scope.pri+ " length is:" +userCourses.length + " the largest is:"+ largest);

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
                                "priority": userCourses.length+1
                              });
                           

                                  inform.add('Course Added', {
                                    ttl: 3200, type: 'success'
                                  });
                          };
                              

                            // if success then update priority with $index
               });
          });
    }]);

myApp.directive('sortable', function ($timeout) {
        return function (scope, element, attributes) {
          element.sortable({
              stop : function(event, ui){
                  scope.$apply(function () {
                    scope.syncOrder(element.sortable('toArray'));
                    // console.log("old location ID:" + scope.userCourses.$id + " old pri:" +scope.userCourses.priority);

                  });
              }
          });
        };
      });

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
                            userCourses.$loaded()
                                  .then(function(){
                                    $scope.userCourses = userCourses;
                                    
                             
                                 $scope.syncOrder = function (elemPositions) {
                                       $scope.userCourses.forEach(function (course, index) {
                                           var id = (parseInt(course.$id) + 1);
                                           if (course.priority === id) {
                                             course.sortOrder = index;
                                              console.log($scope.userCourses);

                                            console.log("my course pri is:" +course.priority + "|" + id + " my sort order is:" +course.sortOrder );

                                           }
                                       });
                                     };
                                  });
                        });
                       $scope.change = function(o) {
                                var arr = [];
                                angular.forEach($scope.userCourses, function(item) {
                                  arr.push(item[o]);
                                });
                                $scope.result = arr.sort()[0];
                              };
                              
                      }, function (errorObject) {
                        console.log("The read failed: " + errorObject.code);
                      });
                  $scope.removeCourse  = function (course) {
                      // userCourses.$remove(course);
                      // $scope.userCourses.splice( $scope.userCourses.indexOf(course), 1 );
                      var coursesUserRef = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses/' +course.$id +'/'+$rootScope.currentUser.$id);
                      var userCoursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/' +$rootScope.currentUser.$id +'/'+ course.$id).remove();
                      coursesUserRef.remove();
                      console.log(course.courseID);
                      $scope.userCourses.$remove(course.courseID);

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
                           term: coursesDetail.term,
                           credits: coursesDetail.credits,
                           coursenumber: coursesDetail.coursenumber
                           };
             });
          }]);

angular.module('myApp').controller('coursesByUserCrtl', ['$scope','$rootScope', '$firebaseObject',
     
     function($scope, $rootScope, $firebaseObject) {
           //get course detail
            }]);

angular.module('myApp').controller('OthersInCourseCtrl', ['$scope','$rootScope', '$firebaseArray', '$routeParams',
     function($scope, $rootScope, $firebaseArray, $routeParams) {
      var coursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses/').child($routeParams.courseID);
      $scope.othersInCourse =  $firebaseArray(coursesRef);
      
      console.log($scope.othersInCourse);
}]);
angular.module('myApp').controller('userCoursesCtrl', ['$scope','$rootScope', '$firebaseObject', '$routeParams',
     function($scope, $rootScope, $firebaseObject, $routeParams) {
      var personsRef = new Firebase('https://nsf-class-selector.firebaseio.com/users/');
      $scope.fellows =  $firebaseObject(personsRef);

      console.log($scope.fellows);
}]);
angular.module('myApp').controller('UsersCourseList', ['$scope','$rootScope','$firebaseArray', '$firebaseObject', 'inform','$routeParams',
     function($scope, $rootScope, $firebaseObject, $firebaseArray, inform, $routeParams) {
              //get courses that the unser has selected in firebase
              var personRef = new Firebase('https://nsf-class-selector.firebaseio.com/users/').child($routeParams.regUser);
              var person = $firebaseArray(personRef);
              $scope.person = person;
              // console.log($scope.person);
              // $scope.userCourses = '';
              var ref = new Firebase("https://nsf-class-selector.firebaseio.com/coursesuser/").child($routeParams.regUser);
              ref.orderByChild("priority").on("child_added", function(snapshot) {
                // console.log(snapshot.key() + " was " + snapshot.val().priority + " meters tall");
              });
              $scope.othersUserCourses = $firebaseObject(ref);
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
    when('/selectclasses', {
      templateUrl: 'views/selectclasses.html',
      controller: 'RegistrationController'
    }).
    when('/allclasses', {
      templateUrl: 'views/allclasses.html',
      controller: 'RegistrationController'
    }).
    when('/courseusers', {
      templateUrl: 'views/courseusers.html',
      controller: 'RegistrationController'
    }).
    when('/users', {
      templateUrl: 'views/users.html',
      controller: 'RegistrationController'
    }).
      when('/courses/:regUser', {
      templateUrl: 'views/courses.html',
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


 
 

