
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
                            var refExists = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/' +$rootScope.currentUser.$id);
                            refExists.once("value", function(snapshot) {
                            // console.log(course);
                              var b = snapshot.child(course.$id).exists();
                              if (b){ //does the course already exist
                                inform.add('Course Is Already Listed', {
                                  ttl: 3200, type: 'danger'
                                });
                               }
                               if(!b){//add course if it dosent alreay exist
                                  
                                  newPri = 1;
                                    var ref = new Firebase("https://nsf-class-selector.firebaseio.com/coursesuser/" +$rootScope.currentUser.$id);
                                    ref.orderByChild("priority").limitToLast(1).once("child_added", function(snapshot) {
                                    myObj=snapshot.val();
                                      // newPri = leng;
                                      var pri = myObj.priority+1;
                                      var leng = userCourses.length;
                                        if (pri == leng) {
                                         newPri = pri;
                                       }
                                        if (pri > leng){
                                          newPri = pri;
                                       }

                                    });
                                    var addUserCourses = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses')
                                    .child(course.$id).child($rootScope.currentUser.$id).set({
                                     "firstname": $rootScope.currentUser.firstname,
                                     "lastname": $rootScope.currentUser.lastname,
                                      "priority": newPri
                                    });
                                    var addCoursesUser = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/')
                                    .child($rootScope.currentUser.$id).child(course.$id).set({
                                      "courseID" : course.$id,
                                      "coursenumber": course.coursenumber,
                                      "coursetitle": course.coursetitle,
                                      "schedule": course.schedule,
                                      "credits": course.credits,
                                      "faculty": course.faculty,
                                      "school": course.school,
                                      "priority": newPri
                                    });
                                          inform.add('Course Added', {
                                            ttl: 3200, type: 'success'
                                          });
                                }
                             }
                            );
                      };
               });//userCourses.$loaded
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
                            userCourses.$loaded()
                                  .then(function(){
                                    
                                 $scope.syncOrder = function (elemPositions) {
                                       $scope.userCourses.forEach(function (course, index) {
                                           var id = (parseInt(course.$id) + 1);
                                           if (course.priority === id) {
                                             course.sortOrder = index;
                                           }
                                       });
                                     };
                                  });
                                  $scope.userCourses = userCourses;
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
                      // $scope.userCourses.splice( $scope.userCourses.indexOf(course.courseID), 1 );
                      var coursesUserRef = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses/' +course.$id +'/'+$rootScope.currentUser.$id);
                      var userCoursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/' +$rootScope.currentUser.$id +'/'+ course.$id).remove();
                      // $scope.course.splice($scope.course.indexOf(course.courseID),1);
                      $scope.userCourses.$remove(course.courseID);
                      coursesUserRef.remove();
                      // $scope.userCourses.splice(course.$index, 1); 
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
                           school: coursesDetail.school,
                           credits: coursesDetail.credits,
                           coursenumber: coursesDetail.coursenumber
                           };
             });
          }]);

angular.module('myApp').controller('addCoursetoFB', ['$scope','$rootScope','$firebaseObject', 'inform',
     function($scope,$rootScope, $firebaseObject, inform) {
      $scope.addClass=false;
       // console.log($scope.myForm); 
      // var url = "https://nsf-class-selector.firebaseio.com/courses/";
      // var firebaseRef = new Firebase(url);

      $scope.addClassManually = function() {

            var coursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/courses/');
            var courses = $firebaseObject(coursesRef);

            if ($scope.myform.$valid){
                    var coursenumber = $scope.myform.coursenumber.$modelValue;
                    var coursename = $scope.myform.coursename.$modelValue;
                    var credits = $scope.myform.credits.$modelValue;
                    var faculty = $scope.myform.faculty.$modelValue;
                    var schedule = $scope.myform.schedule.$modelValue;
                    var school = $scope.myform.school.$modelValue;
                    var courseAdd = coursesRef.push({
                      'coursenumber': coursenumber,
                      'coursetitle': coursename,
                      'credits': credits,
                      'faculty': faculty,
                      'schedule': schedule,
                      'school': school,
                      'term': 'Spring'
                      });
                     
                  $scope.data = angular.copy($scope.originalUser);
                  $scope.myform.$setUntouched();
                  $scope.myform.$setPristine();


                  var postID = courseAdd.key();
                  console.log(postID);
                  
                  newPri = 1;
                    var ref = new Firebase("https://nsf-class-selector.firebaseio.com/coursesuser/" +$rootScope.currentUser.$id);
                    ref.orderByChild("priority").limitToLast(1).once("child_added", function(snapshot) {
                    myObj=snapshot.val();
                      // newPri = leng;
                      var pri = myObj.priority+1;
                      var leng = ref.length;
                        if (pri == leng) {
                         newPri = pri;
                       }
                        if (pri > leng){
                          newPri = pri;
                       }

                    });
                    var addUserCourses = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses')
                    .child(postID).child($rootScope.currentUser.$id).set({
                     "firstname": $rootScope.currentUser.firstname,
                     "lastname": $rootScope.currentUser.lastname,
                      "priority": newPri
                    });
                    var addCoursesUser = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/')
                    .child($rootScope.currentUser.$id).child(postID).set({
                      "courseID" : postID,
                      "coursenumber": $scope.myform.coursenumber.$modelValue,
                      "coursetitle": $scope.myform.coursename.$modelValue,
                      "schedule": $scope.myform.schedule.$modelValue,
                      "credits": $scope.myform.credits.$modelValue,
                      "faculty": $scope.myform.faculty.$modelValue,
                      "school": $scope.myform.school.$modelValue,
                      "priority": newPri
                    });
                    inform.add('Course added', {
                       ttl: 3200, type: 'success'
                     });
              }
        };
     }
      
  ]);

angular.module('myApp').controller('coursesByUserCrtl', ['$scope','$rootScope', '$firebaseArray', '$routeParams',
     function($scope, $rootScope, $firebaseArray, $routeParams) {
       // var fb = new Firebase("https://nsf-class-selector.firebaseio.com/");


        var fb = new Firebase("https://nsf-class-selector.firebaseio.com");
       var ref = new Firebase.util.NormalizedCollection(
          fb.child("/usercourses"),
          fb.child("/courses")
        ).select(
          "usercourses.name",
          "usercourses.style",
          {"key":"courses.$value","alias":"courses"}
        ).ref();

        // $scope.lastRegisteredStudents = $firebaseObject( normRegisteredStudens );
        $scope.coursesWithFellows = $firebaseArray(ref);
            console.log($scope.coursesWithFellows);



   }]);

angular.module('myApp').controller('OthersInCourseCtrl', ['$scope','$rootScope', '$firebaseArray', '$routeParams',
     function($scope, $rootScope, $firebaseArray, $routeParams) {
      var coursesRef = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses/').child($routeParams.courseID);
      $scope.othersInCourse =  $firebaseArray(coursesRef);

}]);
angular.module('myApp').controller('userCoursesCtrl', ['$scope','$rootScope', '$firebaseObject', '$routeParams',
     function($scope, $rootScope, $firebaseObject, $routeParams) {
      var personsRef = new Firebase('https://nsf-class-selector.firebaseio.com/users/');
      $scope.fellows =  $firebaseObject(personsRef);

}]);
angular.module('myApp').controller('UsersCourseList', ['$scope','$rootScope','$firebaseArray', '$firebaseObject', 'inform','$routeParams',
     function($scope, $rootScope, $firebaseObject, $firebaseArray, inform, $routeParams) {
              //get courses that the unser has selected in firebase
              var personRef = new Firebase('https://nsf-class-selector.firebaseio.com/users/').child($routeParams.regUser);
              var person = $firebaseArray(personRef);
              
              $scope.person = person;
            
              var ref = new Firebase("https://nsf-class-selector.firebaseio.com/coursesuser/").child($routeParams.regUser);
              ref.orderByChild("priority").on("child_added", function(snapshot) {
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


 
 

