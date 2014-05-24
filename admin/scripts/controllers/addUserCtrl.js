'use strict';

YoniGo.controller( 'addUserCtrl', function($scope, $state, localize, serverConnection, $modal) {
    $scope.init = function() {
        $scope.user = {};
    };

    $scope.addUser = function() {
        var modalConfig = {
            title: "Add New User",
            items: ['Added User Successfully']
        };

        serverConnection.addUser($scope.user).then( function(response) {
            modalConfig.buttons = [{label:'Ok',cls:'btn-primary', func: function() {}},{label:'Go To Login',cls:'btn-primary', func: function() {$state.go('login');}}]
            $scope.openModel(modalConfig);
        }, function(error) {
            modalConfig.title="Error"
            modalConfig.items = [JSON.stringify(error)];
            modalConfig.buttons = [{label:'Ok',cls:'btn-primary', func: function() {}}]
            $scope.openModel(modalConfig);
        });
    };

});