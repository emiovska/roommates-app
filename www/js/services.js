angular.module('starter.services', [])

    .factory('fireBaseData', function($firebase) {
        var ref = new Firebase("https://shining-fire-7395.firebaseio.com/");
        var refRoomMates = new Firebase("https://shining-fire-7395.firebaseio.com/roommatesExpenses");
        return {
            ref: function() {
                return ref;
            },
            refRoomMates: function() {
                return refRoomMates;
            },
            refChat: function() {
                return refChat;
            },
            getAuthUser: function() {
                return ref.getAuth();
            }
        }
    })

.factory('Chat', function($firebase,fireBaseData,$ionicScrollDelegate,$timeout) {

   var authUser=fireBaseData.getAuthUser();
   var refChat=new Firebase("https://shining-fire-7395.firebaseio.com/chat/"+ (authUser===null?'': authUser.uid));
   var messages=$firebase(refChat).$asArray();


    return {

        allMessages: function() {
            authUser=fireBaseData.getAuthUser();
            refChat=new Firebase("https://shining-fire-7395.firebaseio.com/chat/"+ (authUser===null?'': authUser.uid));
            messages=$firebase(refChat).$asArray();
            refChat.endAt().limit(1).on('child_added', function(dataSnapshot) {
                $timeout( function(){
                    $ionicScrollDelegate.scrollBottom(true);
                    console.log("timeout");
                },100);
            });
            return messages;
        },
        createMessage: function(user,msg) {
            messages.$add({
                by: user,
                message: msg
            });
        }
    }
})

.factory('Users',function($firebase,fireBaseData){
     var refUsers=new Firebase("https://shining-fire-7395.firebaseio.com/users");
     var users=$firebase(refUsers).$asArray();

     return {
         allUsers: function(){
             return users;
         },
         createUser: function(userName, uid){
             refUsers.child(uid).set({
                 uid: uid,
                 name: userName
             });
         },
         createRoomInvitation: function(roomName,uid) {
            refUsers.child(uid).child("notification").child(roomName).push({
                active: true
            });
         },
         getUserRoomInvitations: function(uid) {
            var userNotifications=new Firebase(refUsers+"/"+uid+"/notification");
             //console.log(userNotifications);
            var notifications=$firebase(userNotifications).$asArray();
            return notifications;
         }
     }
})
.factory('ChatRooms', function($firebase,fireBaseData){
    var refChatRooms=new Firebase("https://shining-fire-7395.firebaseio.com/chatRooms");

    return {
        createChatRoom: function(name) {
            refChatRooms.child(name).set({
               active: "true"
            });
        }
    }

});
