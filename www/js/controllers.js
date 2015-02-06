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
                console.log(message.userName);
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



//        $scope.remove = function (chat) {
//            Chats.remove(chat);
//        }
    })


    .controller('RoommatesCtrl', function ($scope, fireBaseData, $firebase) {
        // console.log(fireBaseData.getAuthUser().uid);
        $scope.expenses = $firebase(fireBaseData.refRoomMates()).$asArray();
        //console.log($scope.expenses);
        $scope.user = fireBaseData.ref().getAuth();
        $scope.addExpense = function (e) {
            $scope.expenses.$add({
                by: $scope.user.password.email,
                label: $scope.label,
                cost: $scope.cost
            });
            $scope.label = "";
            $scope.cost = 0;
        };

        $scope.getTotal = function () {
            var i, rtnTotal = 0;
            for (i = 0; i < $scope.expenses.length; i = i + 1) {
                if ($scope.expenses[i].by == $scope.user.password.email)
                    rtnTotal = rtnTotal + $scope.expenses[i].cost;
            }
            return rtnTotal;
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