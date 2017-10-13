'use strict';

angular.module('computingServices.manageLabAssistants', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/manageLabAssistants', {
        templateUrl: 'admin/manageLabAssistants.html',
        controller: 'ManageLabAssistantsCtrl'
    })
}])

.factory('ManageLabAssistantsService', ['$http', '$q', function ($http, $q) {

    var GET_LAB_ASSISTANTS_URI = constants.url + 'admin/viewLabAssistants';
    var DELETE_LAB_ASSISTANT_URI = constants.url + 'admin/deleteLabAssistant';
    var UPDATE_LAB_ASSISTANT_URI = constants.url + 'admin/updateLabAssistant';
    var DOWNLOAD_URI = constants.url + 'admin/download';
    var UPDATE_LAB_ASST_STATUS_URI = constants.url + 'admin/update-lab-assistant-status';

    var factory = {
        getAllLabAssistants: getAllLabAssistants,
        deleteLabAssistant: deleteLabAssistant,
        updateLabAssistant: updateLabAssistant,
        updateLabApplicantStatus: updateLabApplicantStatus
    };

    return factory;

    // get all lab assistants
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

    // delete a lab assistant
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

    // update a lab assistant
    function updateLabAssistant(la) {
        var deferred = $q.defer();

        $http({
                method: 'POST',
                url: UPDATE_LAB_ASSISTANT_URI,
                headers: {
                    'Content-Type': undefined
                },

                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("labAssistant", angular.toJson(la));
                    return formData;
                }
            })
            .success(function (data, status, headers, config) {
                console.log('Update operation success');
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.log('Update operation failed ', status);
                deferred.reject(data);
            });
        return deferred.promise;
    }

    // update lab assistant status
    function updateLabApplicantStatus(status, studentId) {
        var deferred = $q.defer();
        $http({
                method: 'PUT',
                url: UPDATE_LAB_ASST_STATUS_URI,
                params: {
                    status: status,
                    studentId: studentId
                }
            })
            .then(
                function success(response) {
                    console.log('Lab assistant status updated: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while updating lab assistant status: ', errResponse);
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

    //Check if user is logged in, only then continue
    if(!SharedService.isUserLoggedIn()) {
        return;
    }

    if(!SharedService.isPrivilegePresent(constants.LABASSISTANTS)) {
        SharedService.showWarning('You do not have privileges to "Lab Assistants" this page. Please contact Lab Manager');
        SharedService.showLoginPage();
        return;
    }

    $scope.user = {};
    $scope.las = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.deleteConfirm = false;

    fetchAllUsers();
    $scope.canChangeStatus = SharedService.isPrivilegePresent(constants.CHANGE_LA_STATUS);
    $scope.canDownloadResume = SharedService.isPrivilegePresent(constants.DOWNLOAD_LA_RESUME);
    $scope.canViewResume = SharedService.isPrivilegePresent(constants.VIEW_LA_RESUME);
    $scope.canDeleteLA = SharedService.isPrivilegePresent(constants.DELETE_LA);
    $scope.canEmailLA = SharedService.isPrivilegePresent(constants.EMAIL_LA);
    $scope.canCommentLA = SharedService.isPrivilegePresent(constants.COMMENT_LA);

    function fetchAllUsers() {
        var promise = ManageLabAssistantsService.getAllLabAssistants();
        promise.then(function (data) {
            $scope.las = data;
            $scope.backuplas = angular.copy(data);
        }).catch(function (resError) {
            console.error('Error while fetching Users');
            SharedService.showError('Failed to load lab assistants');
        });
    }

    //show LA details in a modal
    $scope.showDetails = function (la) {
        $scope.selectedLA = la;
        $('#ladModal').modal('show');
        console.log('preparing to show detail in modal ', $scope.selectedLA);
    }

    //Update lab assistant
    $scope.update = function (la) {
        console.log('Updating details for lab assistant ', la);
        deleteBackup(la);
        //call service method to update edited details
        var promise = ManageLabAssistantsService.updateLabAssistant(la);
        promise.then(function (result) {
                if (result.statusCode === 200) {
                    SharedService.showSuccess(result.message);
                    //refresh table contents
                    fetchAllUsers();
                    console.log('Operation success, refershing lab assistants table');
                    return;
                } else {
                    SharedService.showError(result.message);
                }
            })
            .catch(function (resError) {
                console.log('UPDATE FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to update lab assistant');
            });
    }

    //Delete a LA
    $scope.deleteLA = function (laId) {

        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete LA with ID ' + laId + '?')
            .textContent('You cannot retrieve the data once it is deleted. Continue?')
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

    //download LA resume
    $scope.download = function (laId) {

        console.log('downloading resume of ', laId);
        //call service to download
        var promise = SharedService.download(laId, 'labassistants');
        promise.then(function (response) {
                console.log('result : ', response);

                var fileLength = response.data.byteLength;

                if (fileLength !== 0) {
                    var url = URL.createObjectURL(new Blob([response.data]));
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = response.filename;
                    a.target = '_blank';
                    a.click();

                    //show success message
                    SharedService.showSuccess("Download Complete");
                } else {
                    //notify that file does not exist for requested user
                    SharedService.showWarning("File does not exist for this user");
                }

            })
            .catch(function (resError) {
                console.log('DOWNLOAD FAILURE :: ', resError);
                SharedService.showError('Error occurred while downloading requested file');
            });
    }

    // view a document
    $scope.viewResume = function (laId) {
        SharedService.viewFile(laId, 'labassistants');
    }

    // Update job applicant status
    $scope.updateLabApplicantStatus = function (status, studentId) {
        console.log('status ', status, ' studentId ', studentId);
        //call service method to update edited details
        var promise = ManageLabAssistantsService.updateLabApplicantStatus(status, studentId);
        promise.then(function (result) {
                console.log('Operation success, refershing lab applicants table');
                //refresh table contents
                fetchAllUsers();
                // show message
                SharedService.showSuccess("Status of Lab Assistant with Id " + studentId + " has been updated successfully");
            })
            .catch(function (resError) {
                console.log('UPDATE FAILURE :: ', resError);
                SharedService.showError('Error occurred while updating status');
                $scope.las = angular.copy($scope.backuplas);
            });
    }

    //Edit lab assistant
    $scope.edit = function edit(la) {
        console.log('id to be edited', la);
        createBackup(la);
    }

    //Cancel the edit operation
    $scope.cancel = function (la) {
        console.log('Cancelling edit operation for ', la);
        restore(la);
        deleteBackup(la);
    }

    //Create backup
    function createBackup(la) {
        la.backupComments = angular.copy(la.comments);
    }

    //Restore backup
    function restore(la) {
        la.comments = angular.copy(la.backupComments);
    }

    //Delete backup fields
    function deleteBackup(la) {
        delete la.backupComments;
    }

}]);
