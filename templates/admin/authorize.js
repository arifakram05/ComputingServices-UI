'use strict';

angular.module('computingServices.authorize', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/authorize', {
        templateUrl: 'templates/admin/authorize.html',
        controller: 'AuthorizeCtrl'
    })
}])

.factory('AuthorizeService', ['$http', '$q', function ($http, $q) {

    var AUTHORIZE_USER_URI = constants.url + 'admin/authorize';

    var factory = {
        authorize: authorize
    };

    return factory;

    // AUTHORIZE A USER FOR REGISTRATION
    function authorize(user) {
        var deferred = $q.defer();

        $http({
                method: 'POST',
                url: AUTHORIZE_USER_URI,
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("user", angular.toJson(user));
                    return formData;
                }
            })
            .success(function (data, status, headers, config) {
                console.log('Authorize a user operation success');
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.log('Authorizing a user failed ', status);
                deferred.reject(data);
            });
        return deferred.promise;
    }
}])

.controller('AuthorizeCtrl', ['$scope', 'AuthorizeService', 'SharedService', function ($scope, AuthorizeService, SharedService) {

    $scope.authorize = function (user) {
        if (user.userId !== undefined) {
            user.firstName = "Arif";
            user.lastName = "Akram";
            user.role = "Admin";
            console.log('authorizing user ', user);
            //call service method to authorize a user for registration to this system
            var promise = AuthorizeService.authorize(user);
            promise.then(function (result) {
                    if (result.statusCode === 200) {
                        SharedService.showSuccess(result.message);
                        $scope.clearForm();
                    } else {
                        SharedService.showError(result.message);
                    }
                })
                .catch(function (resError) {
                    if (resError.statusCode === 404) {
                        SharedService.showInfo(resError.message);
                        $scope.clearForm();
                    } else {
                        console.log('AUTHORIZE FAILURE :: ', resError);
                        //show failure message to the user
                        SharedService.showError('Failed to authorize the user for registration');
                    }
                });
        }
    }

    //Clear form fields
    $scope.clearForm = function () {
        $scope.user = undefined;
        $scope.authorizeAUserForm.$setPristine();
        $scope.authorizeAUserForm.$setUntouched();
    }

}]);
