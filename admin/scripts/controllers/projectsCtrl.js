'use strict';

YoniGo.controller( 'projectsCtrl', function($scope, $state, $location, localize, serverConnection, $modal) {

    $scope.currentUrl = $location.path();
    $scope.newImage = {};

    $scope.init = function() {

        $scope.appData.projects = $scope.appData.projects || [];
        if ($scope.appData.user)
            $scope.getProjects();
        else if ($scope.appData.user = JSON.parse(localStorage.getItem($scope.appName + '.user'))){
            $scope.$parent.login($scope.appData.user).then( function(user) {
                $scope.getProjects();
            })
        }
        else
            $state.go('login');
    };

    $scope.getProjects = function() {
        serverConnection.getProjects({user: $scope.appData.user.id}).then( function(projects) {
            $scope.appData.projects = projects;
            $scope.appData.projects.forEach( function(p) {
                p.newTestimony= {client:{}};
            })
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

    $scope.updateProject = function(project) {
        serverConnection.updateProject({id: project.id, body: {name: project.name, shortDescription: project.shortDescription, longDescription: project.longDescription, company: project.company, tags: project.tags}}).then( function() {
            alertify.success("Project Saved");
        }, function(error) {
            $scope.openErrorModel(error);
        });
    };

    $scope.onImageFileChanged = function(file, name, event) {
        $scope.newImage.src = file;
        $scope.newImage.name = name;
        $scope.$apply();
    };

    $scope.uploadProjectImg = function(project){
        $scope.newImage.index = project.images.length + 1;
        $scope.newImage.type = 'normal';
        serverConnection.uploadProjectImg(project, $scope.newImage).then( function(newImg) {
            var img = {type: newImg.body.$push.images.type, index: newImg.body.$push.images.index, url: newImg.body.$push.images.url };
            project.images.push(img);
            alertify.success("Image Added");
        }, function(error) {
            $scope.openErrorModel(error);
        });
    };

    $scope.removeImage = function(img, project, index) {
        serverConnection.removeProjectImage(img, project).then(function(result) {
            $scope.appData.projects[index].images.splice(project.images.indexOf(img), 1);
            alertify.success("Image Removed");
        }, function(error) {
            $scope.openErrorModel(error);
        })
    };

    $scope.onTestimonyFileChanged = function(file, name, event) {
        this.p.newTestimony = $scope.newTestimony || {client:{}};
        this.p.newTestimony.client.src = file;
        this.p.newTestimony.client.fileName = name;
        $scope.$apply();
    };

    $scope.addTestimony = function(project) {
        var newTestimony = {text: project.newTestimony.text, client: project.newTestimony.client, projectId: project.id};
        serverConnection.addTestimony(newTestimony).then( function(t) {
            project.testimonies.push(t);
            alertify.success("Testimony Added")
        }, function(error) {
            $scope.openErrorModel(error);
        });
    };

    $scope.updateTestimony = function(testimony) {
        serverConnection.updateTestimony({id: testimony.id, body: {text: testimony.text, client: testimony.client}}).then( function() {
            alertify.success("Testimony Saved");
        }, function(error) {
            $scope.openErrorModel(error);
        });
    };

    $scope.deleteTestimony = function(project, testimony) {
        var obj = JSON.parse(JSON.stringify(testimony));
        obj.projectId = project.id;
        serverConnection.deleteTestimony(obj).then( function() {
            alertify.success("Testimony Removed");
            project.testimonies.splice(project.testimonies.indexOf(testimony), 1);
        }, function(error) {
            $scope.openErrorModel(error);
        });
    };
});