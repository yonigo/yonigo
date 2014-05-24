'use strict';

YoniGo.controller( 'loginCtrl', function($scope,  $location, localize, AppData, serverConnection, utils, $timeout) {
    $scope.$location =  $location;
    $scope.appData = AppData;
    $scope.utils = utils;

    $scope.init = function() {
    };

    $scope.connect = function() {
        serverConnection.connectToSocket();
    };

    $scope.login = function() {
      serverConnection.login();
    };

    $scope.sendPush = function() {
        serverConnection.sendPush();
    };

    $scope.$on('socketBroadcast', function(evebt, data) {

        switch (data.event) {
            case 'response':
                $scope.push = data.data.msg;
                break;
            case 'connect':
                $scope.connected = true;
                break;
            case 'login':
                $scope.loggedIn = true;
                break;

        }
        $scope.$apply();
    })

});