angular.module('starter.controllers', [])


    .controller('ChatsCtrl', function ($scope, Chats) {
//        $scope.chats = Chats.all();
//        $scope.remove = function (chat) {
//            Chats.remove(chat);
//        }
    })


    .controller('RoommatesCtrl', function($scope, fireBaseData, $firebase) {
        console.log("roommatesCtlr");
        $scope.expenses = $firebase(fireBaseData.refRoomMates()).$asArray();
        $scope.user = fireBaseData.ref().getAuth();

        $scope.addExpense = function(e) {
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
                if($scope.expenses[i].by==$scope.user.password.email)
                         rtnTotal = rtnTotal + $scope.expenses[i].cost;
            }
            return rtnTotal;
        };
    })

    .controller('AccountCtrl', function ($scope,fireBaseData) {
        $scope.showLoginForm = false; //Checking if user is logged in
        $scope.user = fireBaseData.ref().getAuth();
        if (!$scope.user) {
            $scope.showLoginForm = true;
        }
        //Login method
        $scope.login = function (mail, password) {
            fireBaseData.ref().authWithPassword({
                email    : mail,
                password : password
            },function(error, authData) {
                if (error === null) {
                    console.log("User ID: " + authData.uid +", Provider: " + authData.provider);
                    $scope.user = fireBaseData.ref().getAuth();
                    $scope.showLoginForm = false;
                    $scope.$apply();
                } else {
                    console.log("Error authenticating user:", error);
                }
            });
        };

        // Logout method
        $scope.logout = function () {
            fireBaseData.ref().unauth();
            $scope.showLoginForm = true;
        };
    });
