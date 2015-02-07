angular.module('starter.controllers', [])


    .controller('ChatsCtrl', function ($scope, Chat, AuthService, $ionicScrollDelegate, $timeout) {

//        $timeout( function(){
//            $ionicScrollDelegate.scrollBottom();
//            console.log("contoller timeout");
//        },100);
        console.log("chat contoller");
       // var currentRoom=  AuthService.getCurrentRoom();
        $scope.messages = Chat.allMessages();
       // $scope.userUid=AuthService.getCurrentUser().uid;
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


    .controller('RoommatesCtrl', function ($scope, fireBaseData, $firebase,Expenses,AuthService) {

        $scope.expenses = Expenses.allExpenses();
        $scope.chatRoom=AuthService.getCurrentRoom();
        $scope.addExpense = function (e) {
            Expenses.createExpense($scope.expenseName,$scope.expensePrice);
            $scope.expenseName = "";
            $scope.expensePrice = 0;
        };

        $scope.getTotal = function () {
            var i, expenseTotal = 0;
            for (i = 0; i < $scope.expenses.length; i = i + 1) {
                    expenseTotal = expenseTotal + $scope.expenses[i].expensePrice;
            }
            return expenseTotal;
        };
    })

    .controller('AccountCtrl', function ($scope, fireBaseData, Users, AuthService) {
        $scope.loginForm = true;
        $scope.showLoginForm = false; //Checking if user is logged in

        var user = fireBaseData.ref().getAuth();
        if (!user) {
            $scope.showLoginForm = true;
        }  else {
            var authUser=Users.getUserWithUid(user.uid);
            AuthService.loginIn(authUser);
            $scope.user=authUser;
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
                    $scope.$apply();
                } else {
                    console.log("Error authenticating user:", error);
                }
            });
        };

        //Sign up methods
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

        $scope.enterRoom=function() {
             var currentRoom="FF1010";
            AuthService.enterRoom(currentRoom);
        };

        // Logout method
        $scope.logout = function () {
            fireBaseData.ref().unauth();
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
       console.log("notificationsCTRl");
        var authUserUid = fireBaseData.getAuthUser().uid;
        var notifications = Users.getUserRoomInvitations(authUserUid);
        console.log(notifications);
        $scope.notifications = notifications;
    });