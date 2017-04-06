'use strict';

angular.module('computingServices.manageRoles', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/manageRoles', {
        templateUrl: 'templates/admin/manageRoles.html',
        controller: 'ManageRolesCtrl'
    })
}])

.factory('ManageRolesService', ['$http', '$q', function ($http, $q) {

    var GET_ROLES_URI = constants.url + 'admin/roles';
    var UPDATE_ROLES_URI = constants.url + 'admin/updateRole';
    var DELETE_ROLE_URI = constants.url + 'admin/deleteRole';

    //define all factory methods
    var factory = {
        getRoles: getRoles,
        updateRole: updateRole,
        deleteRole: deleteRole
    };

    return factory;

    function getRoles() {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: GET_ROLES_URI
        }).then(
            function success(response) {
                console.log('data from web service: ', response.data);
                deferred.resolve(response.data);
            },
            function error(errResponse) {
                console.error('Error while making service call to fetch roles ', errResponse);
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }

    function updateRole(role) {
        console.log('role details to update : ', role);
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: UPDATE_ROLES_URI,
            headers: {
                'Content-Type': undefined
            },

            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("role", angular.toJson(role));
                return formData;
            }
        }).success(function (data, status, headers, config) {
            console.log('Updated role: ', data);
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            console.log('Failed to update the role: ', status);
            deferred.reject(data);
        });

        return deferred.promise;
    }

    function deleteRole(roleName) {
        var deferred = $q.defer();

        $http({
                method: 'DELETE',
                url: DELETE_ROLE_URI,
                params: {
                    roleName: roleName
                }
            })
            .then(
                function success(response) {
                    console.log('record deleted: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while deleting ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

}])

.controller('ManageRolesCtrl', ['$scope', 'ManageRolesService', '$filter', 'SharedService', function ($scope, ManageRolesService, $filter, SharedService) {
    console.log('clicked on manage roles');

    /*$scope.expandRoleItem(role) {
        console.log('detailing role: ',role);
    }*/

    $scope.editingRole = false;

    getRoles();

    function getRoles() {
        console.log('making a server call to get all roles and privs');
        var promise = ManageRolesService.getRoles();
        promise.then(function (result) {
            $scope.roles = result.response;
            console.log('all roles fetched :', $scope.roles);
            loadPrivsForAdminRole();
            backupOriginalRoles();
        });
        //For testing
        /*$scope.roles = [
            {
                roleName: 'Admin',
                availablePrivs: [{
                    name: '/getA',
                    description: ''
                }, {
                    name: '/getB',
                    description: ''
                }, {
                    name: '/getC',
                    description: ''
                }],
                assignedPrivs: [{
                    name: '/getD',
                    description: ''
                }, {
                    name: '/getE',
                    description: ''
                }]
            }, {
                roleName: 'Lab Assistant',
                availablePrivs: [{
                    name: '/getD',
                    description: ''
                }, {
                    name: '/getB',
                    description: ''
                }, {
                    name: '/getC',
                    description: ''
                }],
                assignedPrivs: [{
                    name: '/getD',
                    description: ''
                }, {
                    name: '/getA',
                    description: ''
                }]
            }, {
                roleName: 'Professor',
                availablePrivs: [{
                    name: '/getD',
                    description: ''
                }, {
                    name: '/getE',
                    description: ''
                }, {
                    name: '/getC',
                    description: ''
                }],
                assignedPrivs: [{
                    name: '/getA',
                    description: ''
                }, {
                    name: '/getB',
                    description: ''
                }]
            }, {
                roleName: 'Student',
                availablePrivs: [{
                    name: '/getA',
                    description: ''
                }, {
                    name: '/getB',
                    description: ''
                }],
                assignedPrivs: [{
                    name: '/getD',
                    description: ''
                }, {
                    name: '/getE',
                    description: ''
                }, {
                    name: '/getC',
                    description: ''
                }]
            }
        ];*/
    }

    function loadPrivsForAdminRole() {
        $scope.selRoleToShow = $scope.roles[0];
        console.log('seleted role to show is ', $scope.selRoleToShow);
        $scope.canShowPrivs = true;
    }

    function backupOriginalRoles() {
        $scope.backupRoles = [];
        angular.copy($scope.roles, $scope.backupRoles);
        console.log('After adding backups ', $scope.backupRoles);
    }

    // when selected a role
    $scope.selectRole = function (role) {
        $scope.selRoleToShow = role;
        $scope.canShowPrivs = true;
    }

    $scope.moveItem = function (item, from, to) {
        console.log('Move item   Item: ', item, ' From:: ', from, ' To:: ', to);
        angular.forEach(item, function (item2) {
            var idx = from.indexOf(item2);
            if (idx != -1) {
                from.splice(idx, 1);
                to.push(item2);
            }
        });
        console.log('After moving ', $scope.roles);
        console.log('After moving ', $scope.backupRoles);
    };

    $scope.resetPrivs = function (selRole) {
        angular.copy($scope.backupRoles, $scope.roles);
        loadPrivsForAdminRole();
    }

    //Edit role name
    $scope.editRoleName = function (role) {
        console.log('clicked on edit role name', role);
        $scope.editingRole = true;
        createBackup(role);
    }

    //Cancel editing role name
    $scope.cancelRoleNameEdit = function (role) {
        console.log('Cancelling editing role name ', role);
        restore(role);
        deleteBackup(role);
        $scope.editingRole = false;
        console.log('After cancellation ', role);
    }

    //update role details
    $scope.updateRole = function (role) {
        deleteBackup(role);
        //role._id = "58e5cb737205d5669ea48a06";
        role._id = role._id.$oid;
        console.log('updating role details ', role);
        $scope.editingRole = false;

        //call service method to save roles and privs
        var promise = ManageRolesService.updateRole(role);
        promise.then(function (result) {
                if (result.statusCode === 200) {
                    SharedService.showSuccess(result.message);
                    // reload roles and privs
                    getRoles();
                    return;
                } else {
                    SharedService.showError(result.message);
                }
            })
            .catch(function (resError) {
                console.log('UPDATE ROLE CALL FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to update the role and privileges');
            });
    }

    //Delete a job applicant
    $scope.deleteRole = function (role) {
        console.log('Deleting role ', role);

        var promise = ManageRolesService.deleteRole(role.roleName);
        promise.then(function (result) {

                if (result.statusCode === 200) {
                    SharedService.showSuccess(result.message);
                    // reload roles and privs
                    getRoles();
                    return;
                } else {
                    SharedService.showError(result.message);
                }
            })
            .catch(function (resError) {
                console.log('DELETE ROLE CALL FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to delete the role');
            });
    }

    //Create backup
    function createBackup(role) {
        role.backupRoleName = angular.copy(role.roleName);
    }

    //Restore backup
    function restore(role) {
        role.roleName = angular.copy(role.backupRoleName);
    }

    //Delete backup
    function deleteBackup(role) {
        delete role.backupRoleName;
    }

}]);
