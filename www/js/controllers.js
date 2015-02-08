angular.module('starter.controllers', [])


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
        }
    })


    .controller('RoommatesCtrl', function ($scope, fireBaseData,$ionicScrollDelegate, $firebase,Expenses,AuthService,$ionicPopup,ChatRooms) {

        $scope.expenses = Expenses.allExpenses();
        $scope.chatRoom=AuthService.getCurrentRoom();
        $scope.addExpense = function (e) {
            Expenses.createExpense($scope.expenseName,$scope.expensePrice);
            $scope.expenseName = "";
            $scope.expensePrice = 0;
        };

       var getTotal = function () {
            var i, expenseTotal = 0;
            for (i = 0; i < $scope.expenses.length; i = i + 1) {
                    expenseTotal = expenseTotal + parseInt($scope.expenses[i].expensePrice);
            }
            return expenseTotal;
        };

        //show total cost alert
        $scope.showTotalCost = function() {
            var alertPopup = $ionicPopup.alert({
                title: 'Total cost',
                template: '<p style="text-align: center; font-size: 17px; font-weight: bold">'+getTotal()+'\$</p>'
            });
            alertPopup.then(function(res) {

            });
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

    .controller('AccountCtrl', function ($scope, fireBaseData, Users, AuthService,$ionicActionSheet,$location) {
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
             //var currentRoom="FF1010";
//            AuthService.enterRoom(currentRoom);
           var roomName= $scope.availableRooms[index].$id;
            AuthService.enterRoom(roomName);

        };

        // Logout method
        $scope.logout = function () {
            fireBaseData.ref().unauth();
            AuthService.logout();
            $scope.showLoginForm = true;
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
    .controller('NotificationsCtrl', function ($scope, Users, fireBaseData) {

        var authUserUid = fireBaseData.getAuthUser().uid;
        var notifications = Users.getUserRoomInvitations(authUserUid);
        $scope.notifications = notifications;

        $scope.joinRoom= function(index) {
            var roomName=notifications[index].$id;
            Users.joinRoom(roomName, authUserUid);
        };

        $scope.discardRoom=function(index) {
            var roomName=notifications[index].$id;
            Users.discardRoom(roomName, authUserUid);
        };


    });