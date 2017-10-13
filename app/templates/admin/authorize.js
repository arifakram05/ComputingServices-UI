'use strict';

angular.module('computingServices.authorize', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/authorize', {
        templateUrl: 'admin/authorize.html',
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

    //Check if user is logged in, only then continue
    if(!SharedService.isUserLoggedIn()) {
        return;
    }

    if(!SharedService.isPrivilegePresent(constants.AUTHORIZE)) {
        SharedService.showWarning('You do not have privileges to view "Authorize" page. Please contact Lab Manager');
        SharedService.showLoginPage();
        return;
    }

    // get all roles
    searchForRoles();

    $scope.authorize = function (user) {
        console.log('authorizing ', user);
        if (user.userId !== undefined && $scope.role !== undefined) {
            user.firstName = user.firstName;
            user.lastName = user.lastName;
            user.role = $scope.role;
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

    // This data has to be obtained from service call
    /*$scope.users = [{
        userId: 1,
        firstName: 'Arif Akram',
        lastName: 'Mohammed'
    }, {
        userId: 2,
        firstName: 'Julia',
        lastName: 'Roberts'
    }, {
        userId: 3,
        firstName: 'Michael',
        lastName: 'Faraday'
    }, {
        userId: 4,
        firstName: 'Taylor',
        lastName: 'Swift'
    }, {
        userId: 5,
        firstName: 'Spider Man'
    }];*/

    /*$scope.roles = [{
        id: 1,
        roleName: 'Teaneck/Hackensack'
    }, {
        id: 2,
        roleName: 'Madison'
    }, {
        id: 3,
        roleName: 'Canada'
    }];*/

    $scope.search = function (searchText) {
        var promise = SharedService.searchLabAssistants(searchText);
        promise.then(function (result) {
                console.log('got the result from searching users :', result);
                $scope.users = result;
            })
            .catch(function (resError) {
                console.log('search for users failed :: ', resError);
                //show failure message to the user
                SharedService.showError('Error ocurred while searching for users');
            });
    }

    function searchForRoles() {
        var promise = SharedService.getRoles();
        promise.then(function (result) {
                console.log('got the result from searching users :', result);
                if (result.statusCode === 200) {
                    $scope.roles = result.response;
                } else {
                    SharedService.showError('Failed to retreive roles');
                }

            })
            .catch(function (resError) {
                console.log('fetching roles failed :: ', resError);
                //show failure message to the user
                SharedService.showError('Error ocurred while retreiving roles');
            });
    }

    //check if button can be enabled
    $scope.canContinue = function () {
        if ($scope.user != null && $scope.role != null) {
            return false;
        } else {
            return true;
        }
    }

    //related to filter
    $scope.searchTerm;
    $scope.clearSearchTerm = function () {
        $scope.searchTerm = '';
    };
    $scope.onSearchChange = function ($event) {
        $event.stopPropagation();
    }

    //Clear form fields
    $scope.clearForm = function () {
        $scope.user = undefined;
        $scope.authorizeAUserForm.$setPristine();
        $scope.authorizeAUserForm.$setUntouched();
    }

}]);
