'use strict';

angular.module('computingServices.manageUsers', ['ngRoute', 'ngResource'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/manageUsers', {
        templateUrl: 'admin/users/manageUsers.html',
        controller: 'ManageUsersCtrl'
    });
}])

.factory('ManageUsersService', ['$http', '$q', '$resource', function ($http, $q, $resource) {

    var FETCH_URI = constants.url + 'users';
    var DELETE_URI = constants.url + 'delete';
    var BLOCK_URI = constants.url + 'block';
    var UNBLOCK_URI = constants.url + 'unblock';
    var ADD_URI = constants.url + 'users';

    var factory = {
        fetchUsers: fetchUsers,
        blockUser: blockUser,
        unblockUser: unblockUser,
        deleteUser: deleteUser,
        addUser: addUser
    };

    return factory;

    // load all users
    function fetchUsers() {
        var deferred = $q.defer();

        $http({
                method: 'GET',
                url: FETCH_URI
            })
            .then(
                function (response) {
                    console.log('Fetched users: ', response);
                    deferred.resolve(response.data.response);
                },
                function (errResponse) {
                    console.error('Error while fetching users: ', errResponse);
                    deferred.reject(errResponse);
                });
        return deferred.promise;
    }

    // block a user
    function blockUser(id) {
        console.log('blocking user with id ', id);
        var deferred = $q.defer();
        $http({
                method: 'PUT',
                url: BLOCK_URI + '/' + id
            })
            .then(
                function success(response) {
                    console.log('Blocked user: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while blocking user: ', errResponse);
                    deferred.reject(errResponse);
                });
        return deferred.promise;
    }

    // unblock a user
    function unblockUser(id) {
        console.log('unblocking user with id ', id);
        var deferred = $q.defer();
        $http({
                method: 'PUT',
                url: UNBLOCK_URI + '/' + id
            })
            .then(function success(response) {
                    console.log('UnBlock success: ', response);
                    deferred.resolve(response);
                },
                function error(errResponse) {
                    console.error('Error while unblocking: ', errResponse);
                    deferred.reject(errResponse);
                });
        return deferred.promise;
    }

    // delete a user
    function deleteUser(id) {
        console.log('deleting user with id ', id);
        var deferred = $q.defer();
        var url = $resource(DELETE_URI + "/:id");
        url.delete({
            id: id
        }).$promise.then(function success(response) {
                console.log('Delete success: ', response);
                deferred.resolve(response);
            },
            function error(errResponse) {
                console.error('Error while deleting: ', errResponse);
                deferred.reject(errResponse);
            });
        return deferred.promise;
    }

    // add a user
    function addUser(user) {
        var deferred = $q.defer();

        $http({
                method: 'POST',
                url: ADD_URI,
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
                console.log('Add a user operation success');
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.log('Add a user operation failed ', status);
                deferred.reject(data);
            });
        return deferred.promise;
    }
}])

.controller('ManageUsersCtrl', ['$scope', 'ManageUsersService', '$filter', '$mdDialog', 'SharedService', function ($scope, ManageUsersService, $filter, $mdDialog, SharedService) {

    //Check if user is logged in, only then continue
    if(!SharedService.isUserLoggedIn()) {
        return;
    }

    if(!SharedService.isPrivilegePresent(constants.USERS)) {
        SharedService.showWarning('You do not have privileges to view "Manage Users" page. Please contact Lab Manager');
        SharedService.showLoginPage();
        return;
    }

    $scope.user = {};
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.closeAddUserForm = false;

    fetchAllUsers();
    $scope.canAddUser = SharedService.isPrivilegePresent(constants.ADD_USER);
    $scope.canDeleteUser = SharedService.isPrivilegePresent(constants.DELETE_USER);
    $scope.canBlockUser = SharedService.isPrivilegePresent(constants.BLOCK_USER);
    $scope.canUnBlockUser = SharedService.isPrivilegePresent(constants.UNBLOCK_USER);

    // load users
    function fetchAllUsers() {
        /*$scope.users = [{
            "_id": "790yjdads9pa7o3hn",
            "userId": "5",
            "firstName": "michael",
            "lastName": "bevan",
            "role": "Lab Assistant",
            "password": "password",
            "blocked": true
        }, {
            "_id": "790yjdads9pa7o3hn",
            "userId": "1643568",
            "firstName": "Arif",
            "lastName": "Akram",
            "role": "Lab Manager",
            "password": "p",
            "blocked": false
         }, {
            "_id": "790yjdads9pa7o3hn",
            "userId": "7",
            "firstName": "Taylor",
            "lastName": "Swift",
            "role": "Lab Assistant",
            "password": "taylor",
            "blocked": false
         }, {
            "_id": "790yjdads9pa7o3hn",
            "userId": "9999",
            "firstName": "Lauren",
            "lastName": "Elgin",
            "role": "Lab Manager",
            "password": "lauren",
            "blocked": false
         }, {
            "_id": "790yjdads9pa7o3hn",
            "userId": "175886",
            "firstName": "Abhishek",
            "lastName": "Guggilla",
            "role": "Lab Assistant",
            "password": "1",
            "blocked": true
        }];*/
        var promise = ManageUsersService.fetchUsers();
        promise.then(function (result) {
            $scope.users = result;
            console.log('Users :', $scope.users);
        }).catch(function (resError) {
            console.error('Error while fetching users');
            SharedService.showError('Failed to load user');
        });
    }

    //Block user
    $scope.blockUser = function (id, userId) {
        console.log('blocking ', id);
        var promise = ManageUsersService.blockUser(id.$oid);
        promise.then(function (result) {
                SharedService.showSuccess("Blocked user " + userId);
                // reload user
                fetchAllUsers();
            })
            .catch(function (resError) {
                console.log('BLOCK USER CALL FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to block the user ' + userId);
            });
    };

    //UnBlock user
    $scope.unblockUser = function (id, userId) {
        var promise = ManageUsersService.unblockUser(id.$oid);
        promise.then(function (result) {
                SharedService.showSuccess("UnBlocked user " + userId);
                // reload user
                fetchAllUsers();
            })
            .catch(function (resError) {
                console.log('UNBLOCK USER CALL FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to unblock the user ' + userId);
            });
    };

    //Delete user
    $scope.deleteUser = function (id, userId) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete this user?')
            .textContent('You cannot retrieve the data once it is deleted. Continue?')
            .ok('Yes')
            .cancel('No');

        $mdDialog.show(confirm).then(function () {
            console.log('this shows up because user clicked YES');
            console.log('Data to delete: ', userId);

            var promise = ManageUsersService.deleteUser(id.$oid);
            promise.then(function (result) {
                    SharedService.showSuccess("Deleted " + userId);
                    // reload user
                    fetchAllUsers();
                })
                .catch(function (resError) {
                    console.log('DELETE USER CALL FAILURE :: ', resError);
                    //show failure message to the user
                    SharedService.showError('Failed to delete the user ' + userId);
                });
        });
    };

    //Search Roles
    $scope.getRoles = function () {
        var promise = SharedService.getRoles();
        promise.then(function (result) {
                console.log('got the result from searching :', result);
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

    // show add user form
    $scope.showAddUserForm = function () {
        $scope.openAddDialog = true;
        $scope.getRoles();
    }

    // close add user form
    $scope.closeAddUserForm = function (addUserForm) {
        $scope.openAddDialog = false;
        $scope.user = undefined;
        addUserForm.$setPristine();
        addUserForm.$setUntouched();
    }

    // add user
    $scope.addUser = function (user, addUserForm) {
        console.log('call received to add user: ', user);
        if (user !== undefined && Object.keys(user).length == 4) {
            console.log('adding user ', user);
            //call service method such that user can start accessing this system
            var promise = ManageUsersService.addUser(user);
            promise.then(function (result) {
                    SharedService.showSuccess(result.message);
                    $scope.closeAddUserForm(addUserForm);
                    fetchAllUsers();
                })
                .catch(function (resError) {
                    if (resError.statusCode === 403) {
                        SharedService.showError(resError.message);
                        $scope.closeAddUserForm(addUserForm);
                    } else {
                        console.log('ADD USER FAILURE :: ', resError);
                        //show failure message to the user
                        SharedService.showError('Failed to add the user');
                    }
                });
        }
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
