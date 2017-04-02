'use strict';

angular.module('computingServices.manageLabAssistants', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/manageLabAssistants', {
        templateUrl: 'templates/admin/manageLabAssistants.html',
        controller: 'ManageLabAssistantsCtrl'
    })
}])

.factory('ManageLabAssistantsService', ['$http', '$q', function ($http, $q) {

    var GET_LAB_ASSISTANTS_URI = constants.url + 'admin/viewLabAssistants';
    var DELETE_LAB_ASSISTANT_URI = constants.url + 'admin/deleteLabAssistant';

    var factory = {
        getAllLabAssistants: getAllLabAssistants,
        deleteLabAssistant: deleteLabAssistant
    };

    return factory;

    function getAllLabAssistants() {
        var deferred = $q.defer();
        $http({
                method: 'GET',
                url: GET_LAB_ASSISTANTS_URI
            })
            .then(
                function (response) {
                    console.log('data from web service: ', response);
                    deferred.resolve(response.data.response);
                },
                function (errResponse) {
                    console.error('Error while making service call to fetch Users');
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

    function deleteLabAssistant(laId) {
        var deferred = $q.defer();

        $http({
                method: 'DELETE',
                url: DELETE_LAB_ASSISTANT_URI,
                params: {
                    studentId: laId
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

    /*function createUser(user) {
        var deferred = $q.defer();
        $http.post(REST_SERVICE_URI, user)
            .then(
            function (response) {
                deferred.resolve(response.data);
            },
            function(errResponse){
                console.error('Error while creating User');
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }


    function updateUser(user, id) {
        var deferred = $q.defer();
        $http.put(REST_SERVICE_URI+id, user)
            .then(
            function (response) {
                deferred.resolve(response.data);
            },
            function(errResponse){
                console.error('Error while updating User');
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }

    function deleteUser(id) {
        var deferred = $q.defer();
        $http.delete(REST_SERVICE_URI+id)
            .then(
            function (response) {
                deferred.resolve(response.data);
            },
            function(errResponse){
                console.error('Error while deleting User');
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }*/

}])

.controller('ManageLabAssistantsCtrl', ['$scope', 'ManageLabAssistantsService', 'SharedService', '$filter', '$mdDialog', function ($scope, ManageLabAssistantsService, SharedService, $filter, $mdDialog) {

    $scope.user = {};
    $scope.las = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.deleteConfirm = false;

    fetchAllUsers();

    function fetchAllUsers() {
        ManageLabAssistantsService.getAllLabAssistants()
            .then(
                function (data) {
                    $scope.las = data;
                },
                function (errResponse) {
                    console.error('Error while fetching Users');
                    SharedService.showError('Failed to load lab assistants');
                }
            );
    }

    $scope.edit = function edit(la) {
        console.log('id to be edited', la.studentId);
        /*for(var i = 0; i < $scope.users.length; i++){
            if($scope.users[i].id === id) {
                $scope.user = angular.copy($scope.users[i]);
                break;
            }
        }*/
    }

    //show LA details in a modal
    $scope.showDetails = function (la) {
        $scope.selectedLA = la;
        $('#ladModal').modal('show');
        console.log('preparing to show detail in modal ', $scope.selectedLA);
    }

    //Delete a LA
    $scope.deleteLA = function (laId) {

        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete?')
            .textContent('You cannot retrieve the data once it is delted. Continue?')
            .ok('Yes')
            .cancel('No');

        $mdDialog.show(confirm).then(function () {
            console.log('this shows up because user clicked YES');

            var promise = ManageLabAssistantsService.deleteLabAssistant(laId);
            promise.then(function (result) {

                    if (result.statusCode === 200) {
                        SharedService.showSuccess(result.message);
                        //refresh table contents
                        fetchAllUsers();
                        console.log('Delete Operation success, refershing lab assistants table');
                        return;
                    } else {
                        SharedService.showError(result.message);
                    }
                })
                .catch(function (resError) {
                    console.log('DELETE FAILURE :: ', resError);
                    //show failure message to the user
                    SharedService.showError('Failed to delete lab assistant');
                });

        });
    };

}]);
