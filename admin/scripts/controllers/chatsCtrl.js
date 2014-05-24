'use strict';

YoniGo.controller( 'chatsCtrl', function($scope, $state, $location, localize, serverConnection, $modal) {

    $scope.currentUrl = $location.path();

    $scope.init = function() {

        $scope.appData.chats = $scope.appData.chats || [];
        $scope.appData.onlineUsers = $scope.appData.onlineUsers || [];
        if ($scope.user)
            $scope.getOnlineUsers();
        else if ($scope.user = JSON.parse(localStorage.getItem($scope.appName + '.user'))){
            $scope.$parent.login($scope.user).then( function(user) {
                $scope.getConversations();
            });
        }
        else
            $state.go('login');
    };

    $scope.getOnlineUsers = function() {
        serverConnection.getOnlineUsers();
    };

    $scope.startNewConversation = function(selectedUser) {
        serverConnection.startNewConversation({users:[$scope.appData.user.id, selectedUser.id]}).then( function(conversation) {
            $scope.appData.conversations.push(conversation);
        }, function(error) {
            $scope.openErrorModel(error);
        });
    };

    $scope.getConversations = function() {
        serverConnection.getConversations($scope.appData.user.id).then( function(conversations) {
            $scope.appData.conversations = conversations;
        }, function(error) {
            $scope.openErrorModel(error);
        });
    };

    $scope.sendMsg = function(msg, conv) {
        return serverConnection.sendMsg(conv, $scope.appData.user, msg);
    };

    $scope.$on('onlineUsers', function(event, users) {
        $scope.appData.onlineUsers = users;
        var myIndex = -1;
        for (var i = 0; i < users.length; i++) {
            if (users[i].id == $scope.appData.user.id) {
                myIndex = i;
                break;
            }
        }
        if (myIndex > -1)
            $scope.appData.onlineUsers.splice(myIndex,1);
        $scope.$apply();
    })
});