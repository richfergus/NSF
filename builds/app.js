
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
                                  
                                  newPri =0;
                                    var ref = new Firebase("https://nsf-class-selector.firebaseio.com/coursesuser/" +$rootScope.currentUser.$id);
                                    ref.orderByChild("priority").limitToLast(1).once("child_added", function(snapshot) {
                                    myObj=snapshot.val();
                                      var pri = myObj.priority+1;
                                      var leng = userCourses.length;
                                       newPri = leng;
                                        if (pri == leng) {
                                         newPri = pri;
                                       }
                                        if (pri > leng){
                                          newPri = pri;
                                       }

                                    });
                                    var addCoursesUser = new Firebase('https://nsf-class-selector.firebaseio.com/coursesuser/' +$rootScope.currentUser.$id)
                                    .child(course.$id).set({
                                      "courseID" : course.$id,
                                      "coursenumber": course.coursenumber,
                                      "coursetitle": course.coursetitle,
                                      "schedule": course.schedule,
                                      "credits": course.credits,
                                      "faculty": course.faculty,
                                      "school": course.school,
                                      "priority": newPri
                                    });
                                    var addUserCourses = new Firebase('https://nsf-class-selector.firebaseio.com/usercourses')
                                    .child(course.$id).child($rootScope.currentUser.$id).update({
                                     "firstname": $rootScope.currentUser.firstname,
                                     "lastname": $rootScope.currentUser.lastname,
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

angular.module('myApp').controller('addCoursetoFB', ['$scope','$firebaseObject',
     function($scope, $firebaseObject) {
      $scope.addClass=false;
                
      var url = "https://nsf-class-selector.firebaseio.com/courses/";
      var firebaseRef = new Firebase(url);

                $scope.myForm = {};
                $scope.myForm.school = $('input[name=school]:checked').val();
                $scope.myForm.coursenumber  = $('#coursenumber').text();
                $scope.myForm.coursetitle  = $('#coursetitle').text();
                $scope.myForm.schedule  = $('#schedule').text();
                $scope.myForm.credits  = $('#credits').text();
                $scope.myForm.faculty  = $('#faculty').text();

// console.log($scope.myForm);
              }
      
            ]);


      
      // {
      //   var school = $('input[name=school]:checked').val();
      //   var coursenumber = $('#coursenumber').text();
      //   var coursetitle = $('#coursetitle').text();
      //   var schedule = $('#schedule').text();
      //   var credits = $('#credits').text();
      //   var faculty = $('#faculty').text();


      //   // firebaseRef.set({Title: title, Content: post, Date: date});
      //   // evt.preventDefault();
      //   console.log(evt);
      // }

      // var submit = document.getElementsByTagName('button')[0];

      // submit.onclick = funct1;






angular.module('myApp').controller('coursesByUserCrtl', ['$scope','$rootScope', '$firebaseObject',
     
     function($scope, $rootScope, $firebaseObject) {
           //get course detail
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


 
 

