'use strict';

angular.module('computingServices.settings', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/settings', {
        templateUrl: 'general/settings/settings.html',
        controller: 'SettingsCtrl'
    })
}])

.factory('SettingsService', ['$http', '$q', function ($http, $q) {

    var SETTINGS_URI = constants.url + 'settings';
    var UPDATE_FROM_EMAIL_URI = constants.url + 'settings/email';
    var CHANGE_PASSWORD_URI = constants.url + 'settings/password';
    var RESET_PASSWORD_URI = constants.url + 'settings/password/reset';
    var DEFINE_SUBNET_RANGE_URI = constants.url + 'settings/subnet-range';

    //define all factory methods
    var factory = {
        loadSettings: loadSettings,
        fromEmail: fromEmail,
        resetPassword: resetPassword,
        changePassword: changePassword,
        defineSubnetRange: defineSubnetRange
    };

    return factory;

    // load settings
    function loadSettings() {
        var deferred = $q.defer();

        $http({
                method: 'GET',
                url: SETTINGS_URI
            })
            .then(
                function (response) {
                    console.log('Fetched settings: ', response);
                    deferred.resolve(response.data);
                },
                function (errResponse) {
                    console.error('Error while fetching settings: ', errResponse);
                    deferred.reject(errResponse);
                });
        return deferred.promise;
    }

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
    function changePassword(passwordDetails) {
        var deferred = $q.defer();
        $http({
                method: 'PUT',
                url: CHANGE_PASSWORD_URI,
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("passwordDetails", angular.toJson(passwordDetails));
                    return formData;
                }
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

    // reset user password
    function defineSubnetRange(start, end) {
        var deferred = $q.defer();
        $http({
                method: 'PUT',
                url: DEFINE_SUBNET_RANGE_URI,
                params: {
                    start: start,
                    end: end
                }
            })
            .then(
                function success(response) {
                    console.log('Subnet Ranged Defined: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while defining subnet range: ', errResponse);
                    deferred.reject(errResponse);
                });
        return deferred.promise;
    }

}])

.controller('SettingsCtrl', ['$scope', 'SettingsService', '$filter', 'SharedService', '$mdDialog', function ($scope, SettingsService, $filter, SharedService, $mdDialog) {
    console.log('loading settings ...');

    //Check if user is logged in, only then continue
    if (!SharedService.isUserLoggedIn()) {
        return;
    }

    if (!SharedService.isPrivilegePresent(constants.SETTINGS)) {
        SharedService.showWarning('You do not have privileges to view "Settings" page. Please contact Lab Manager');
        SharedService.showLoginPage();
        return;
    }

    $scope.options = ['Email', 'Password Reset', 'Subnet Range', 'Change Password'];

    $scope.canUpdateFromAddress = SharedService.isPrivilegePresent(constants.UPDATE_FROM_EMAIL_ADDRESS);
    $scope.canResetPassword = SharedService.isPrivilegePresent(constants.RESET_PASSWORD);
    $scope.canSetSubnetRange = SharedService.isPrivilegePresent(constants.SUBNET_RANGE);
    $scope.canChangePassword = SharedService.isPrivilegePresent(constants.CHANGE_PASSWORD);

    // when selected an option
    $scope.selectOption = function (option) {
        $scope.selectedOptionToShow = option;
        $scope.canShowOptionDetails = true;
    }

    loadSettings();

    function loadSettings() {
        $scope.selectOption($scope.options[0]);
        var promise = SettingsService.loadSettings();
        promise.then(function (result) {
            $scope.email = result.email;
            let subnetRange = result.subnetRange.split('-');
            $scope.start = subnetRange[0];
            $scope.end = subnetRange[1];
            console.log('Settings :', result);
        }).catch(function (resError) {
            console.error('Error while fetching settings');
            SharedService.showError('Failed to load settings');
        });
    }

    // submit from email
    $scope.emailSubmit = function (email) {
        console.log('From email address is - ', email);

        var promise = SettingsService.fromEmail(email);
        promise.then(function (result) {
                SharedService.showSuccess(result.message);
                // refresh page
                loadSettings();
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

        var passwordDetails = {
            oldPassword: oldp,
            newPassword: newp,
            userId: SharedService.getUserId()
        };

        var promise = SettingsService.changePassword(passwordDetails);
        promise.then(function (result) {
                SharedService.showSuccess(result.message);
            })
            .catch(function (resError) {
                console.log('CHANGE PASSWORD FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to change password');
            });
    }

    // define subnet range
    $scope.setSubnetRange = function (start, end) {
        console.log('start ', start, ' end ', end);

        var promise = SettingsService.defineSubnetRange(start, end);
        promise.then(function (result) {
                SharedService.showSuccess(result.message);
                // refresh page
                loadSettings();
            })
            .catch(function (resError) {
                console.log('FAILURE WHILE DEFINING SUBNET RANGE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to set subnet range');
            });
    }

    // search users
    $scope.search = function (searchText) {
        var promise = SharedService.searchUsers(searchText);
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
