YoniGo = angular.module('YoniGo', ['ngAnimate', 'ngTouch', 'duScroll', 'angular-parallax', 'ui.bootstrap', 'ui.router', 'directives', 'serverConnection', 'localization', 'snap', 'utils'])
YoniGo
.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/login');
        $stateProvider
            .state('login', {
                url: "/login",
                templateUrl: "views/login.html",
                controller: "loginCtrl"
            })
            .state('addUser', {
                url: "/addUser",
                templateUrl: "views/addUser.html",
                controller: "addUserCtrl"
            })
            .state('projects', {
                url: "/projects",
                templateUrl: "views/projects.html",
                controller: "projectsCtrl"
            })
            .state('companies', {
                url: "/companies",
                templateUrl: "views/companies.html",
                controller: "companiesCtrl"
            })
            .state('chats', {
                url: "/chats",
                templateUrl: "views/chats.html",
                controller: "chatsCtrl"
            });

})
.factory("AppData",function(){
    return {};
})
.controller('AppController', function($scope, $rootScope, $location, $window, $timeout, AppData, localize, serverConnection, utils, $state, $modal, $q) {

    $scope.$location =  $location;
    $scope.$state = $state;
    $scope.appData = AppData;
    utils.setLocalizationService(localize);
    $scope.connectedToSocket = false;
    $scope.conversations = {};
    $scope.appName = 'yonigo';
        //$scope.background = parallaxHelper.createAnimator(-0.8,100,-100,-300);


    $scope.init = function() {
    };

    $scope.login = function(user, next) {
        var deferred = $q.defer();
        serverConnection.login(user).then( function(userModel) {
            if (user.rememberMe) {
                localStorage.setItem($scope.appName + '.user', JSON.stringify(user));
            }
            if(next)
                $state.go(next);
            $scope.appData.user = userModel;
            return $scope.connect();

        })
        .then( function(response) {
            $scope.getCompanies();
            deferred.resolve(response);
        }, function(error) {
            $scope.openErrorModel(error);
            deferred.reject(error)
        });
        return deferred.promise;
    };

    $scope.logout = function() {
        localStorage.setItem($scope.appName + '.user', null);
        $state.go('login');
    };

    $scope.connect = function() {
        var deferred = $q.defer();
        serverConnection.connectToSocket($scope.appData.user).then( function(response) {
            $scope.connectedToSocket = true;
            $scope.$broadcast('ConnectedTOSocket');
            alertify.success("Connected To Web Socket");
            deferred.resolve(response);
        }, function(error) {
            $scope.openErrorModel(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    $scope.getCompanies = function() {
        serverConnection.getCompanies().then( function(companies) {
            $scope.appData.companies = companies;
        }, function(error) {
            $scope.openErrorModel(error);
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
        debugger;
        switch (data.event) {
            case 'newMsg':
                for (var i = 0; i < $scope.appData.conversations.length; i++) {
                    if ($scope.appData.conversations[i].id == JSON.parse(data.data).conversationId ) {
                        if (JSON.parse(data.data).msg.user != $scope.appData.user.id) {
                            $scope.appData.conversations[i].messages.push(JSON.parse(data.data).msg);
                        }// new msg from some user
                    }
                }
                //$scope.conversations[data.data.conversationId].messages.push(data.data.msg);
                break;
            default:
                break;
        }
        $scope.$apply();
    });

    $scope.openErrorModel = function(error) {
        $scope.openModel({title: "Error", items: [JSON.stringify(error)], buttons:[{label:'Ok',cls:'btn-primary', func: function() {}}]});
    };

    $scope.openModel = function (modalConfig) {
        var modalInstance = $modal.open({
            templateUrl: 'views/templates/model.html',
            controller: ModalInstanceCtrl,
            size: '',
            resolve: {
                config: function () {
                    return modalConfig;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            //$log.info('Modal dismissed at: ' + new Date());
        });
    };

});