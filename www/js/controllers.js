angular.module('starter.controllers', [])

    .controller('TabsCtrl', function($scope, $rootScope, $state, AuthService,$ionicPopup,$location) {
        $rootScope.$on('$ionicView.beforeEnter', function() {

            $rootScope.hideTabs = false;

            if ($state.current.name === 'tab.account') {
                    var authUser=AuthService.getCurrentUser();
                    if(authUser==null)
                         $rootScope.hideTabs = true;
           }

           if($state.current.name==='tab.chat' || $state.current.name==='tab.roommates'){
               if(AuthService.getCurrentRoom()==null) {
                   var alertPopup = $ionicPopup.alert({
                       title: 'Warning',
                       template: '<p style="text-align: center">Please choose a room</p>'
                   });
                   alertPopup.then(function(res) {
                       $location.path('/account');
                   });
               }

           }
        });

    })

    .controller('ChatsCtrl', function ($scope, Chat, AuthService, $ionicScrollDelegate, $timeout) {

//        $timeout( function(){
//            $ionicScrollDelegate.scrollBottom();
//            console.log("contoller timeout");
//        },100);
        console.log("chat contoller");
       // var currentRoom=  AuthService.getCurrentRoom();
        $scope.messages = Chat.allMessages();
//        $scope.messages.$loaded(function(){
//            $ionicScrollDelegate.scrollBottom(true);
//        });
        $scope.sendNewMessage = function (e) {
            Chat.createMessage($scope.message);
            $scope.message = '';

        };

        $scope.set_align = function (message) {
            var authUserUid=AuthService.getCurrentUser().uid;
            if (message.userUid===authUserUid) {
                return {'text-align': "right"};
            }
        };

        $scope.chooseTamplete = function(message) {
            var authUserUid=AuthService.getCurrentUser().uid;
            if (message.userUid===authUserUid) {
                return true
            } else {
                return false;
            }
        };
    })


    .controller('RoommatesCtrl', function ($scope, fireBaseData,$ionicScrollDelegate, $firebase,Expenses,AuthService,$ionicPopup,ChatRooms) {
        var currentUserCost=0;
        $scope.expenses = Expenses.allExpenses();
        $scope.chatRoom=AuthService.getCurrentRoom();
        $scope.addExpense = function (e) {
            Expenses.createExpense($scope.expenseName,$scope.expensePrice);
            $scope.expenseName = "";
            $scope.expensePrice = 0;
        };

        $scope.expenses.$loaded(function(){
          makeCalculation();
        });

       var getTotal = function () {
            var i, expenseTotal = 0;
            for (i = 0; i < $scope.expenses.length; i = i + 1) {
                    expenseTotal = expenseTotal + parseInt($scope.expenses[i].expensePrice);
            }
            return expenseTotal;
        };

        //d3 chart
        var makeCalculation= function(){
            var data=[];
            var tmpExpenses=$scope.expenses;
            for(var i=0;i<tmpExpenses.length;i++) {
                if(data[tmpExpenses[i].userName]==null)
                        data[tmpExpenses[i].userName]=parseInt(tmpExpenses[i].expensePrice);
                else {
                    var price=data[tmpExpenses[i].userName];
                    data[tmpExpenses[i].userName]=price + parseInt(tmpExpenses[i].expensePrice);
                }
            }

           currentUserCost=data[AuthService.getCurrentUser().name];

            var formatedData=new Array();
            for (var userName in data) {
                var item=new Object();
                item.userName=userName;
                item.cost=data[userName];
                formatedData.push(item);
            }

            $scope.expensesData=formatedData;
        }

        $scope.xFunction = function() {
            return function(d) {
                return d.userName;
            };
        }
        $scope.yFunction = function() {
            return function(d) {
                return d.cost;
            };
        }
        $scope.descriptionFunction = function(){
            return function(d){
                return d.userName;
            }
        }

        //show total cost alert
        $scope.showTotalCost = function() {
            makeCalculation();
            var countMembers=$scope.expensesData.length;
            var amount=parseInt(currentUserCost - getTotal()/countMembers);
            var alertPopup = $ionicPopup.alert({
                title: 'Total cost',
                template: '<div style="text-align: center">Current amount </div>'
                         +'<div  ng-controller="RoommatesCtrl" style="text-align: center; font-weight: bold" ng-style="setColor()">'
                         + (amount>0 ? '+' : '') + amount+'\$</div>'
                         +'<div ng-controller="RoommatesCtrl" class="row">'
                             +'<nvd3-pie-chart '
                             +'data="expensesData" '
                             +'id="exampleId" '
                             +'width="1050" '
                             +'height="950" '
                             +'tooltips="true"'
                             +'description="descriptionFunction()"'
                             +'x="xFunction()" '
                             +'y="yFunction()" >'
                             +'<svg height="50"></svg>'
                            +'</nvd3-pie-chart>'
                         +'</div>'
            });
            alertPopup.then(function(res) {
            });
        };

        $scope.setColor=function() {
            var countMembers=$scope.expensesData.length;
            var amount=parseInt(currentUserCost - getTotal()/countMembers);
            if(amount<0)
              return {'color':'red'};
            else
               return {'color': 'black' };
        };
        // clear all expenses
        $scope.clearExpenses = function() {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Delete expenses',
                template: 'Are you sure you want to clear all expenses?'
            });
            confirmPopup.then(function(res) {
                if(res) {
                   ChatRooms.clearExpenses();
                }
            });
        }


    })

    .controller('AccountCtrl', function ($scope, fireBaseData, Users, AuthService,$ionicActionSheet,$location,$rootScope) {
        $scope.loginForm = true;
        $scope.showLoginForm = false; //Checking if user is logged in
        $scope.errorShow=false;
        var user = fireBaseData.ref().getAuth();
        if (!user) {
            $scope.showLoginForm = true;
        }  else {
            var authUser=Users.getUserWithUid(user.uid);
            AuthService.loginIn(authUser);
            $scope.user=authUser;
        }

        //get available rooms
        if(AuthService.getCurrentUser()){
            $scope.availableRooms= Users.getUserJoinedRooms(AuthService.getCurrentUser().$id);
        }

        //Login method
        $scope.login = function (mail, password) {
            fireBaseData.ref().authWithPassword({
                email: mail,
                password: password
            }, function (error, authData) {
                if (error === null) {
                    var authUser=Users.getUserWithUid(authData.uid);
                    AuthService.loginIn(authUser);
                    $scope.user=authUser;
                    $scope.showLoginForm = false;
                    $scope.availableRooms= Users.getUserJoinedRooms(authData.uid);
                    $rootScope.$broadcast("$ionicView.beforeEnter");
                    $rootScope.$broadcast("updateNotifications");
                    $scope.$apply();
                } else {
                    $scope.errorShow=true;
                    $scope.errorMessage=error.message;
                    $scope.$apply();
                    console.log("Error authenticating user:", error);
                }
            });
        };

        //Sign up methods
         $scope.chooseSignUp = function() {
             var actionSheet = $ionicActionSheet.show({
                 buttons: [
                     { text: '<h4 class="assertive">Create user</h4>' },
                     { text: '<h4 class="assertive">Create room</h4>' }
                 ],
                 titleText: 'Choose sign up method',
                 cancelText: 'Cancel',
                 buttonClicked: function(index) {
                    var nextPath= index==0 ? '/signUp' : '/createRoom';
                     console.log(nextPath);
                     $location.path(nextPath);

                     return true;
                 }
             });

         };
        $scope.signUp = function (name, mail, password) {
            var ref = fireBaseData.ref();
            ref.createUser({
                email: mail,
                password: password
            }, function (error) {
                if (error === null) {
                    //first sign in to get UID
                    fireBaseData.ref().authWithPassword({
                        email: mail,
                        password: password
                    }, function (error, authData) {
                        if (error === null) {
                            Users.createUser(name, authData.uid);
                            fireBaseData.ref().unauth();
                        }
                    });

                    $scope.infoMessage = "User created successfully";
                } else {
                    $scope.infoMessage = error.message;
                }
                $scope.$apply();
            });
        };

       //enter room
        $scope.enterRoom=function(index) {
           var roomName= $scope.availableRooms[index].$id;
            AuthService.enterRoom(roomName);
        };

        // Logout method
        $scope.logout = function () {
            fireBaseData.ref().unauth();
            AuthService.logout();
            $scope.showLoginForm = true;
            $rootScope.$broadcast("$ionicView.beforeEnter");

        };
    })
    .controller('CreateRoomCtrl', function ($scope, Users, ChatRooms) {
        $scope.registerUsers = [];
        $scope.users = Users.allUsers();

        $scope.addItem = function (registerUser) {
            $scope.registerUsers.push(registerUser);
        }

        $scope.delete = function (index) {
            $scope.registerUsers.splice(index, 1);
        }

        $scope.createRoom = function (roomName) {
            ChatRooms.createChatRoom(roomName);
            for (var i = 0; i < $scope.registerUsers.length; i++) {
                var user = $scope.registerUsers[i];
                Users.createRoomInvitation(roomName, user.uid);
            }

            $scope.registerUsers = null;
            $scope.infoMessage = "The room " + roomName + " was successfully created";
            $scope.roomName = "";
            $scope.$apply();
        }

    })
    .controller('NotificationsCtrl', function ($scope, Users, fireBaseData,AuthService) {

       var authUser=fireBaseData.getAuthUser();
        var notifications=[];
       if(authUser){
            var authUserUid = fireBaseData.getAuthUser().uid;
            notifications = Users.getUserRoomInvitations(authUserUid);
       }

        $scope.notifications = notifications;

        $scope.$on("updateNotifications", function(){
            var authUserUid = fireBaseData.getAuthUser().uid;
            notifications = Users.getUserRoomInvitations(authUserUid);
            $scope.notificationCount();
        })

        $scope.notificationCount = function() {
           return notifications.length;
        }

        $scope.joinRoom= function(index) {
            var roomName=notifications[index].$id;
            Users.joinRoom(roomName, authUserUid);
        };

        $scope.discardRoom=function(index) {
            var roomName=notifications[index].$id;
            Users.discardRoom(roomName, authUserUid);
        };

    });
 