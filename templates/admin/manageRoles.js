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

    //Create backup
    function createBackup (role) {
        role.backupRoleName = angular.copy(role.roleName);
    }

    //Restore backup
    function restore (role) {
        role.roleName = angular.copy(role.backupRoleName);
    }

    //Delete backup fields
    function deleteBackup (role) {
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

    $scope.roles = [{
        roleId : '1',
        roleName: 'Admin'
    },{
        roleId : '2',
        roleName : 'Lab Assistant'
    },{
        roleId : '3',
        roleName : 'Professor'
    }, {
        roleId : '4',
        roleName : 'Student'
    }]

    /*var myDataPromise = ManageRolesService.getRoles();
    myDataPromise.then(function (result) {
        $scope.roles = result;
        console.log('Roles:' + $scope.roles);
    });*/

}]);
