'use strict';

angular.module('computingServices.settings', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/settings', {
        templateUrl: 'templates/general/settings/settings.html',
        controller: 'SettingsCtrl'
    })
}])

.factory('SettingsService', ['$http', '$q', function ($http, $q) {

    var UPDATE_FROM_EMAIL_URI = constants.url + 'email';
    var RESET_PASSWORD_URI = constants.url + 'reset/password';

    //define all factory methods
    var factory = {
        fromEmail: fromEmail,
        resetPassword: resetPassword,
        changePassword: changePassword
    };

    return factory;

    // from email address
    function fromEmail(email) {
        var deferred = $q.defer();
        $http({
                method: 'PUT',
                url: UPDATE_FROM_EMAIL_URI + '/' + email
            })
            .then(
                function success(response) {
                    console.log('From Email Updated: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while updating from e-mail address: ', errResponse);
                    deferred.reject(errResponse);
                });
        return deferred.promise;
    }

    // reset user password
    function resetPassword(id) {
        var deferred = $q.defer();
        $http({
                method: 'PUT',
                url: RESET_PASSWORD_URI + '/' + id
            })
            .then(
                function success(response) {
                    console.log('Password Reset Success: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while resetting password: ', errResponse);
                    deferred.reject(errResponse);
                });
        return deferred.promise;
    }

    // change user password
    function changePassword(oldp, newp, confirmp) {
        /*var deferred = $q.defer();
        $http({
                method: 'PUT',
                url: RESET_PASSWORD_URI + '/' + id
            })
            .then(
                function success(response) {
                    console.log('Password Reset Success: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while resetting password: ', errResponse);
                    deferred.reject(errResponse);
                });
        return deferred.promise;*/
    }

}])

.controller('SettingsCtrl', ['$scope', 'SettingsService', '$filter', 'SharedService', '$mdDialog', function ($scope, SettingsService, $filter, SharedService, $mdDialog) {
    console.log('loading settings ...');

    $scope.options = ['Email', 'Password Reset', 'Subnet Range', 'Change Password'];

    // when selected an option
    $scope.selectOption = function (option) {
        $scope.selectedOptionToShow = option;
        $scope.canShowOptionDetails = true;
    }

    loadSettings();

    function loadSettings() {
        $scope.selectOption($scope.options[0]);
    }

    // submit from email
    $scope.emailSubmit = function (email) {
        console.log('From email address is - ', email);

        var promise = SettingsService.fromEmail(email);
        promise.then(function (result) {
                SharedService.showSuccess(result.message);
            })
            .catch(function (resError) {
                console.log('UPDATE FROM EMAIL ADDRESS FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to update from e-mail address');
            });
    }

    // reset password
    $scope.resetPassword = function (userId) {
        console.log('User whose password is to be reset is ', userId);

        var promise = SettingsService.resetPassword(userId);
        promise.then(function (result) {
                SharedService.showSuccess(result.message);
            })
            .catch(function (resError) {
                console.log('RESET PASSWORD FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to reset password');
            });
    }

    // change password
    $scope.changePassword = function (oldp, newp, confirmp) {
        if (newp !== confirmp) {
            notifyUser('Please check that New Password and Confirm Password fields match');
            return;
        }
        console.log('Changing password of ', SharedService.getUserId());

        var promise = SettingsService.changePassword(oldp, newp, confirmp);
        promise.then(function (result) {
                SharedService.showSuccess(result.message);
            })
            .catch(function (resError) {
                console.log('CHANGE PASSWORD FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to change password');
            });
    }

    // search users
    $scope.search = function (searchText) {
        var promise = SharedService.searchUsers(searchText);
        promise.then(function (result) {
                console.log('got the result from searching users :', result);
                if (result.statusCode === 200) {
                    $scope.users = result.response;
                } else {
                    SharedService.showError('Failed to retreive users');
                }

            })
            .catch(function (resError) {
                console.log('search for users failed :: ', resError);
                //show failure message to the user
                SharedService.showError('Error ocurred while searching for users');
            });
    }

    //related to filter
    $scope.searchTerm;
    $scope.clearSearchTerm = function () {
        $scope.searchTerm = '';
    };
    $scope.onSearchChange = function ($event) {
        $event.stopPropagation();
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
