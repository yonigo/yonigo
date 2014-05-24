'use strict';

YoniGo.controller( 'projectsCtrl', function($scope, $state, $location, localize, serverConnection, $modal) {

    $scope.currentUrl = $location.path();

    $scope.init = function() {

        $scope.appData.projects = $scope.appData.projects || [];
        if ($scope.user)
            $scope.getProjects();
        else if ($scope.user = JSON.parse(localStorage.getItem($scope.appName + '.user'))){
            $scope.$parent.login($scope.user).then( function(user) {
                $scope.getProjects();
            })
        }
        else
            $state.go('login');
    };

    $scope.getProjects = function() {
        serverConnection.getProjects({user: $scope.user.id}).then( function(projects) {
            $scope.appData.projects = projects;
        }, function(error) {
            $scope.openErrorModel(error);
        });
    };

    $scope.addProject = function() {
        serverConnection.addProject({name:$scope.newProjectName, user: $scope.appData.user.id}).then( function(project) {
            $scope.appData.projects.push(project);
        }, function(error) {
            $scope.openErrorModel(error);
        });
    };

    $scope.deleteProject = function(project) {
        serverConnection.deleteProject({id: project.id}).then( function() {
            $scope.appData.projects.splice($scope.appData.projects.indexOf(project), 1);
        }, function(error) {
            $scope.openErrorModel(error);
        });
    };
});