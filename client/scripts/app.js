YoniGo = angular.module('YoniGo', ['ngAnimate', 'ngTouch', 'duScroll', 'angular-parallax', 'ui.bootstrap', 'ui.router', 'directives', 'serverConnection', 'localization', 'snap', 'utils'])
YoniGo
.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('login', {
                url: "/login",
                templateUrl: "views/login.html",
                controller: "loginCtrl"
            });

})
.factory("AppData",function(){
    return {};
})
.controller('AppController', function($scope, $rootScope, $location, $window, $timeout, AppData, localize, serverConnection, utils, $state) {

    $scope.$location =  $location;
    $scope.$state = $state;
    $scope.appData = AppData;
    utils.setLocalizationService(localize);
    $scope.connectedToSocket = false;
    $scope.conversations = {};
    //$scope.background = parallaxHelper.createAnimator(-0.8,100,-100,-300);


    $scope.init = function() {
        $scope.userId = localStorage.getItem('userId');
        if (!$scope.userId) {
            $scope.userId = utils.createGUID();
            localStorage.setItem('userId',$scope.userId);
        }
        $scope.connect({id: $scope.userId});
    };

    $scope.connect = function(user) {
        serverConnection.connectToSocket(user).then( function(response) {
            $scope.connectedToSocket = true;
            $scope.conversations = response.conversations;
        }, function(error) {

        });
    };

    $scope.sendMsg = function(msg, conversation) {
        var m = {};
        m.userId = $scope.userId;
        m.date = new Date();
        m.text = msg;
        conversation.messages.push(m);
        serverConnection.sendChatMsg(msg, conversation).then( function(response) {
            m.sent = true;
        }, function(error) {
            m.sent = false;
        });
    };

    $scope.joinConversation = function(conversation) {
        serverConnection.joinConversation(conversation).then( function(response) {
            $scope.conversations[response.conversationId] = response;
        }, function(error) {

        });
    };

    $scope.$on('socketBroadcast', function(event, data) {
        switch (data.event) {
            case 'newMsg':
                $scope.conversations[data.data.conversationId].messages.push(data.data.msg);
                break;
            default:
                break;
        }
        $scope.$apply();
    });

});