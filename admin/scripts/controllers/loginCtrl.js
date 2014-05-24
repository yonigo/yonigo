'use strict';

YoniGo.controller( 'loginCtrl', function($scope, $state, localize, serverConnection, $modal) {

    $scope.init = function() {

        if ($scope.user)
            $scope.$parent.login($scope.user, 'projects');
        else if ($scope.user = JSON.parse(localStorage.getItem($scope.appName + '.user'))){
            $scope.$parent.login($scope.user, 'projects');
        }

    };


});