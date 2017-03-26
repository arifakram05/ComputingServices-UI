'use strict';

angular.module('computingServices.authorize', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/authorize', {
        templateUrl: 'templates/admin/authorize.html',
        controller: 'AuthorizeCtrl'
    })
}])

.controller('AuthorizeCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {

    $scope.authorize = function (id) {
        if(id !== undefined) {
            console.log('authorizing user ',id);
            notifyUser('User with id '+id+' can now register.');
            $scope.clearForm();
        }
    }

    //Clear form fields
    $scope.clearForm = function () {
        $scope.idNumber = undefined;
        $scope.authorizeAUserForm.$setPristine();
        $scope.authorizeAUserForm.$setUntouched();
    }

    //alerts to user
    function notifyUser(message) {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .textContent(message)
            .ok('Got it!')
        );
    }
}]);
