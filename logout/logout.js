'use strict';

angular.module('computingServices.logout', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/logout', {
        templateUrl: '',
        controller: 'LogoutCtrl'
    })
}])

.controller('LogoutCtrl', ['LoginService', function (LoginService) {
    console.log('Logging out...');
    LoginService.ClearCredentials();
}]);
