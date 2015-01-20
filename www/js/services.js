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

   var refChat=new Firebase("https://shining-fire-7395.firebaseio.com/chat/"+ fireBaseData.getAuthUser().uid);
   var messages=$firebase(refChat).$asArray();

        refChat.endAt().limit(1).on('child_added', function(dataSnapshot) {
            $timeout( function(){
                $ionicScrollDelegate.scrollBottom(true);
                console.log("timeout");
            },100);
        });
    return {
        allMessages: function() {
            return messages;
        },
        createMessage: function(user,msg) {
            messages.$add({
                by: user,
                message: msg
            });
        }
    }
//  return {
//            all: function() {
//                return chats;
//            },
//            remove: function(chat) {
//                chats.splice(chats.indexOf(chat), 1);
//            },
//            get: function(chatId) {
//                for (var i = 0; i < chats.length; i++) {
//                    if (chats[i].id === parseInt(chatId)) {
//                        return chats[i];
//                    }
//                }
//                return null;
//            }
//        }
})

/**
 * A simple example service that returns some data.
 */
.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  // Some fake testing data
  var friends = [{
    id: 0,
    name: 'Ben Sparrow',
    notes: 'Enjoys drawing things',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    notes: 'Odd obsession with everything',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Andrew Jostlen',
    notes: 'Wears a sweet leather Jacket. I\'m a bit jealous',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    notes: 'I think he needs to buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    notes: 'Just the nicest guy',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];


  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    }
  }
});
