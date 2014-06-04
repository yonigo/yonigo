YoniGo = angular.module('YoniGo', ['ngAnimate', 'ngTouch', 'duScroll', 'angular-parallax', 'ui.bootstrap', 'ui.router', 'directives', 'serverConnection', 'localization', 'utils'])
YoniGo
.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
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

        $scope.appData.path = "../../";

        $scope.userId = localStorage.getItem('userId');
        if (!$scope.userId) {
            $scope.userId = utils.createGUID();
            localStorage.setItem('userId',$scope.userId);
        }
        //$scope.connect({id: $scope.userId});

        $scope.appData.projects = [
            {imgUrl: 'images/portfolio/thumbs/1-767x479.jpg', title: 'My Title', subTitle:'subTitle', tags: 'tag1'},
            {imgUrl: 'images/portfolio/thumbs/1-767x479.jpg', title: 'My Title', subTitle:'subTitle', tags: 'tag2'}
        ];

        $scope.appData.testimonies = [
            {
                text: 'the best',
                client: { name: 'yoni1', title: 'manager', imageUrl: 'images/clients/1-90x90.jpg'}
            },
            {
                text: 'the best',
                client: { name: 'yoni2', title: 'manager', imageUrl: 'images/clients/1-90x90.jpg'}
            },
            {
                text: 'the best',
                client: { name: 'yoni3', title: 'manager', imageUrl: 'images/clients/1-90x90.jpg'}
            },
            {
                text: 'the best',
                client: { name: 'yoni4', title: 'manager', imageUrl: 'images/clients/1-90x90.jpg'}
            }
        ];

        serverConnection.getProjects({}).then( function(projects) {
            $scope.appData.projects = projects;
            $scope.appData.testimonies = [];
            projects.forEach( function(p) {
                if (p.testimonies[0])
                    $scope.appData.testimonies.push(p.testimonies[0]);
            });
        }, function(error) {
            $scope.openErrorModel(error);
        });

        serverConnection.getCompanies().then( function(companies) {
            $scope.appData.companies = companies;
        }, function(error) {
            $scope.openErrorModel(error);
        });

        $scope.projectsFilter = '*';
    };

    $scope.getScrollspy = function(index) {
        var delay = index*200 + 500;
        var cls = 'uk-animation-slide-' + ((index%2 == 0)?'left':'right');
        return "{cls:'" + cls + "', delay:" + delay + "}";
    };

    $scope.hideBorder = function(index) {
        var arr = [1,2,4,5,7,8,10,11];
        return (arr.indexOf(index) > -1);
    }

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