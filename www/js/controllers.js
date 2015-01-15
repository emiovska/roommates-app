angular.module('starter.controllers', [])


    .controller('ChatsCtrl', function ($scope, Chats) {
//        $scope.chats = Chats.all();
//        $scope.remove = function (chat) {
//            Chats.remove(chat);
//        }
    })


    .controller('RoommatesCtrl', function($scope, fireBaseData, $firebase) {
        $scope.expenses = $firebase(fireBaseData.refRoomMates()).$asArray();

        $scope.addExpense = function(e) {
            $scope.expenses.$add({
                by: 'mail',
                label: $scope.label,
                cost: $scope.cost
            });
            $scope.label = "";
            $scope.cost = 0;
        };
        $scope.getTotal = function () {
            var i, rtnTotal = 0;
            for (i = 0; i < $scope.expenses.length; i = i + 1) {
                rtnTotal = rtnTotal + $scope.expenses[i].cost;
            }
            return rtnTotal;
        };
    })

    .controller('AccountCtrl', function ($scope) {
       $scope.settings = {
            enableFriends: true
        };
    });
