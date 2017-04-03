'use strict';

angular.module('computingServices.manageRoles', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/manageRoles', {
        templateUrl: 'templates/admin/manageRoles.html',
        controller: 'ManageRolesCtrl'
    })
}])

.factory('ManageRolesService', ['$http', function ($http) {

    var factory = {};

    return factory;

    function getRoles() {
        var deferred = $q.defer();

        $http({
                method: 'GET',
                url: GET_JOB_APPLICANTS_URI
            })
            .then(
                function success(response) {
                    console.log('data from web service: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while making service call to fetch roles ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }
}])

.controller('ManageRolesCtrl', ['$scope', 'ManageRolesService', function ($scope, ManageRolesService) {
    console.log('clicked on manage roles');

    /*$scope.expandRoleItem(role) {
        console.log('detailing role: ',role);
    }*/

    getRoles();

    function getRoles() {
        console.log('making a server call to get all roles and privs', $scope.roles);
        $scope.roles = [
            {
                roleName: 'Admin',
                availablePrivs: ["/getA", "/getB", "/getC"],
                assignedPrivs: ["/getD", "/getE"]
            }, {
                roleName: 'Lab Assistant',
                availablePrivs: ["/getD", "/getB", "/getC"],
                assignedPrivs: ["/getD", "/getA"]
            }, {
                roleName: 'Professor',
                availablePrivs: ["/getD", "/getE", "/getC"],
                assignedPrivs: ["/getA", "/getB"]
            }, {
                roleName: 'Student',
                availablePrivs: ["/getA", "/getB"],
                assignedPrivs: ["/getD", "/getE", "/getC"]
            }
        ];
        loadPrivsForAdminRole();
    }

    function loadPrivsForAdminRole() {
        $scope.selRoleToShow = $scope.roles[0];
        console.log('seleted role to show is ', $scope.selRoleToShow);
        $scope.canShowPrivs = true;
    }


    //Create backup
    function createBackup(role) {
        role.backupRoleName = angular.copy(role.roleName);
    }

    //Restore backup
    function restore(role) {
        role.roleName = angular.copy(role.backupRoleName);
    }

    //Delete backup fields
    function deleteBackup(role) {
        delete role.backupRoleName;
    }

    //Edit job applicant details
    $scope.editRole = function (role) {
        console.log('clicked on edit role', role);
        createBackup(role);
    }

    //Cancel edit operation
    $scope.cancelRole = function (role) {
        console.log('Cancelling edit operation for ', role);
        restore(role);
        deleteBackup(role);
    }

    //Save update job applicant details
    $scope.updateRole = function (role) {
        console.log('Updating details for role ', role);
        deleteBackup(role);

        //call service method to update edited details
        /*var promise = ManageJobApplicantsService.updateJobApplicant(jobApplicantToUpdate);
        promise.then(function (result) {
            console.log('Operation success, refershing job applicants table');
            //refresh table contents
            fetchAllJobApplicants();
        });*/
    }

    //Delete a job applicant
    $scope.deleteRole = function (role) {
        console.log('Deleting role ', role);

        /*var promise = ManageJobApplicantsService.deleteJobApplicant(studentId);
        promise.then(function (result) {
            console.log('Operation success, refershing job applicants table');
            //refresh table contents
            fetchAllJobApplicants();
        });*/
    }

    // when selected a role
    $scope.selectRole = function (role) {
        $scope.selRoleToShow = role;
        $scope.canShowPrivs = true;
    }

    //borrowed - START
    $scope.moveItem = function (item, from, to) {

        console.log('Move item   Item: ' + item + ' From:: ' + from + ' To:: ' + to);
        //Here from is returned as blank and to as undefined

        angular.forEach(item, function (item2) {
            var idx = from.indexOf(item2);
            if (idx != -1) {
                from.splice(idx, 1);
                to.push(item2);
            }
        });
    };
    $scope.moveAll = function (from, to) {

        console.log('Move all  From:: ' + from + ' To:: ' + to);
        //Here from is returned as blank and to as undefined

        angular.forEach(from, function (item) {
            to.push(item);
        });
        from.length = 0;
    };

    /*$scope.assignedPrivs = [];

    $scope.availablePrivs = [
        {
            id: 1,
            name: 'foo'
        },
        {
            id: 2,
            name: 'bar'
        },
        {
            id: 3,
            name: 'baz'
        }
    ];*/
    //borrowed - END

    /*var myDataPromise = ManageRolesService.getRoles();
    myDataPromise.then(function (result) {
        $scope.roles = result;
        console.log('Roles:' + $scope.roles);
    });*/

}]);
