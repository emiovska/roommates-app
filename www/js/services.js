angular.module('starter.services', [])

    .factory('fireBaseData', function ($firebase) {
        var ref = new Firebase("https://shining-fire-7395.firebaseio.com/");
        var refRoomMates = new Firebase("https://shining-fire-7395.firebaseio.com/roommatesExpenses");
        return {
            ref: function () {
                return ref;
            },
            refRoomMates: function () {
                return refRoomMates;
            },
            refChat: function () {
                return refChat;
            },
            getAuthUser: function () {
                return ref.getAuth();
            }
        }
    })

    .factory('Chat', function ($firebase, fireBaseData, $ionicScrollDelegate, $timeout, AuthService) {

        var chatRoom = "https://shining-fire-7395.firebaseio.com/chatRooms";
        var messages;

        return {

            allMessages: function () {
                var currentRoom = AuthService.getCurrentRoom();
                var refChatRoom = new Firebase(chatRoom + "/" + currentRoom + "/messages");
                messages = $firebase(refChatRoom).$asArray();
//            refChat.endAt().limit(1).on('child_added', function(dataSnapshot) {
//                $timeout( function(){
//                    $ionicScrollDelegate.scrollBottom(true);
//                    console.log("timeout");
//                },100);
//            });
                return messages;
            },
            createMessage: function (msg) {
                var currentUser = AuthService.getCurrentUser();
                // var currentRoom= AuthService.getCurrentRoom();
                // var refChatRoom=new Firebase(chatRoom+"/"+currentRoom+"/messages");
                // messages=$firebase(refChatRoom).$asArray();
                messages.$add({
                    userName: currentUser.name,
                    userUid: currentUser.uid,
                    message: msg
                });
            }
        }
    })

    .factory('Users', function ($firebase, fireBaseData) {
        var refUsers = new Firebase("https://shining-fire-7395.firebaseio.com/users");
        var users = $firebase(refUsers).$asArray();

        return {
            allUsers: function () {
                return users;
            },
            createUser: function (userName, uid) {
                refUsers.child(uid).set({
                    uid: uid,
                    name: userName
                });
            },
            createRoomInvitation: function (roomName, uid) {
                refUsers.child(uid).child("notification").child(roomName).push({
                    active: true
                });
            },
            getUserRoomInvitations: function (uid) {
                var userNotifications = new Firebase(refUsers + "/" + uid + "/notification");
                var notifications = $firebase(userNotifications).$asArray();
                return notifications;
            },
            getUserWithUid: function (uid) {
                var authUser = new Firebase(refUsers + "/" + uid);
                return $firebase(authUser).$asObject();
            }
        }
    })
    .factory('ChatRooms', function ($firebase, fireBaseData) {
        var refChatRooms = new Firebase("https://shining-fire-7395.firebaseio.com/chatRooms");

        return {
            createChatRoom: function (name) {
                refChatRooms.child(name).set({
                    active: "true"
                });
            }
        }

    })
    .factory('Expenses', function ($firebase, fireBaseData, AuthService) {
        var expensesUrl = "https://shining-fire-7395.firebaseio.com/chatRooms";
        var expenses;

        return {
            allExpenses: function () {
                var currentRoom = AuthService.getCurrentRoom();
                var refExpenses = new Firebase(expensesUrl + "/" + currentRoom + "/expenses");
                expenses = $firebase(refExpenses).$asArray();
                return expenses;
            },
            createExpense: function (expenseName, expensePrice) {
                var currentUser = AuthService.getCurrentUser();
                expenses.$add({
                    userName: currentUser.name,
                    userUid: currentUser.uid,
                    expenseName: expenseName,
                    expensePrice: expensePrice
                });
            }
        }
    })
    .factory("AuthService", function () {
        var currentUser;
        var currentRoom;
        return {
            loginIn: function (user) {
                currentUser = user;
            },
            enterRoom: function (roomName) {
                currentRoom = roomName;
            },
            logOut: function () {
                currentRoom = null;
            },
            getCurrentUser: function () {
                return currentUser;
            },
            getCurrentRoom: function () {
                return currentRoom;
            }
        }
    });
