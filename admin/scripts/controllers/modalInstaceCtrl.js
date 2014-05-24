var ModalInstanceCtrl = function ($scope, $modalInstance, config) {

    $scope.config = config;

    $scope.ok = function () {
        $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.runFunction = function (func) {
        func();
        $modalInstance.close();
    };
};