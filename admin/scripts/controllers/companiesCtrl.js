'use strict';

YoniGo.controller( 'companiesCtrl', function($scope, $state, $location, localize, serverConnection, $modal) {

    $scope.currentUrl = $location.path();
    $scope.newCompany = {file: {}};

    $scope.init = function() {

        $scope.appData.companies = $scope.appData.companies || [];
        if ($scope.appData.user)
        {}
        else if ($scope.appData.user = JSON.parse(localStorage.getItem($scope.appName + '.user'))){
            $scope.$parent.login($scope.appData.user);
        }
        else
            $state.go('login');
    };

    $scope.addCompany = function() {
        serverConnection.addCompany({name: $scope.newCompany.name, description: $scope.newCompany.description, logo: {src: $scope.newCompany.file.src, name: $scope.newCompany.file.name}}).then( function(company) {
            $scope.appData.companies.push(company);
        }, function(error) {
            $scope.openErrorModel(error);
        });
    };

    $scope.deleteCompany = function(company) {
        serverConnection.deleteCompany({id: company.id}).then( function() {
            $scope.appData.companies.splice($scope.appData.companies.indexOf(company), 1);
        }, function(error) {
            $scope.openErrorModel(error);
        });
    };

    $scope.updateCompany = function(company) {
        serverConnection.updateCompany({id: company.id, body: {name: company.name, description: company.description}}).then( function() {
            alertify.success("Company Saved");
        }, function(error) {
            $scope.openErrorModel(error);
        });
    };

    $scope.onImageFileChanged = function(file, name, event) {
        $scope.newCompany.file.src = file;
        $scope.newCompany.file.name = name;
        $scope.$apply();
    };
});