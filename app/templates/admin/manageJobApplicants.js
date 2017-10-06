'use strict';

angular.module('computingServices.manageJobApplicants', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/manageJobApplicants', {
        templateUrl: 'templates/admin/manageJobApplicants.html',
        controller: 'ManageJobApplicantsCtrl'
    });
}])

.factory('ManageJobApplicantsService', ['$http', '$q', function ($http, $q) {

    var GET_JOB_APPLICANTS_URI = constants.url + 'admin/viewJobApplicants';
    var DELETE_JOB_APPLICANT_URI = constants.url + 'admin/deleteJobApplicant';
    var UPDATE_JOB_APPLICANT_URI = constants.url + 'admin/updateJobApplicant';
    var HIRE_JOB_APPLICANT_URI = constants.url + 'admin/hireJobApplicant';
    var UPDATE_JOB_APPLICANT_STATUS_URI = constants.url + 'admin/update-job-applicant-status';
    var EMAIL_JOB_APPLICANT_URI = constants.url + 'services/emailJobApplicant';

    //define all factory methods
    var factory = {
        getAllJobApplicants: getAllJobApplicants,
        deleteJobApplicant: deleteJobApplicant,
        updateJobApplicant: updateJobApplicant,
        hireJobApplicant: hireJobApplicant,
        emailJobApplicant: emailJobApplicant,
        updateJobApplicantStatus: updateJobApplicantStatus
    };

    return factory;

    function getAllJobApplicants() {
        var deferred = $q.defer();
        $http({
                method: 'GET',
                url: GET_JOB_APPLICANTS_URI
            })
            .then(
                function success(response) {
                    console.log('data from web service: ', response);
                    deferred.resolve(response.data.response);
                },
                function error(errResponse) {
                    console.error('Error while making service call to fetch Users ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

    function deleteJobApplicant(studentId) {
        var deferred = $q.defer();

        $http({
                method: 'DELETE',
                url: DELETE_JOB_APPLICANT_URI,
                params: {
                    studentId: studentId
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

    function updateJobApplicant(jobApplicant) {
        var deferred = $q.defer();

        $http({
                method: 'POST',
                url: UPDATE_JOB_APPLICANT_URI,
                headers: {
                    'Content-Type': undefined
                },

                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("model", angular.toJson(data.model));
                    return formData;
                },
                data: {
                    model: jobApplicant
                },
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

    function hireJobApplicant(labAssistant) {
        console.log('lab assistant details : ', labAssistant);
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: HIRE_JOB_APPLICANT_URI,
            headers: {
                'Content-Type': undefined
            },

            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("labAssistant", angular.toJson(labAssistant));
                return formData;
            }
        }).
        success(function (data, status, headers, config) {
            console.log('Hire operation success', data);
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log('Hire operation failed ', status);
            deferred.reject(data);
        });

        return deferred.promise;
    }

    function emailJobApplicant(jobApplicant) {
        var deferred = $q.defer();

        $http.post(EMAIL_JOB_APPLICANT_URI, JSON.stringify(jobApplicant))
            .success(
                function (data, status, headers, config) {
                    console.log('Email operation success', data);
                    deferred.resolve(data);
                })
            .error(
                function (data, status, header, config) {
                    console.log('Email operation failed ', status);
                    deferred.reject(data);
                });
        return deferred.promise;
    }

    // update job applicant status
    function updateJobApplicantStatus(status, studentId) {
        var deferred = $q.defer();
        $http({
                method: 'PUT',
                url: UPDATE_JOB_APPLICANT_STATUS_URI,
                params: {
                    status: status,
                    studentId: studentId
                }
            })
            .then(
                function success(response) {
                    console.log('Job applicant status updated: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while updating job applicant status: ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

}])

.controller('ManageJobApplicantsCtrl', ['$scope', 'ManageJobApplicantsService', 'SharedService', '$filter', '$mdDialog', function ($scope, ManageJobApplicantsService, SharedService, $filter, $mdDialog) {
    console.log('clicked on manage job applicants');

    //Check if user is logged in, only then continue
    if (!SharedService.isUserAuthenticated()) {
        console.log("Is user authenticated : ", SharedService.isUserAuthenticated());
        SharedService.logout();
        SharedService.showLoginPage();
        SharedService.showError('Please login to continue');
        return;
    }

    if(!SharedService.isPrivilegePresent(constants.jobApplicants)) {
        SharedService.showWarning('You do not have privileges to view this page. Please contact Lab Manager');
        return;
    }

    $scope.jobApplicants = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10

    fetchAllJobApplicants();
    $scope.canDownloadResume = SharedService.isPrivilegePresent(constants.downloadApplicantResume);
    $scope.canDeleteApplicant = SharedService.isPrivilegePresent(constants.deleteApplicant);
    $scope.canHireApplicant = SharedService.isPrivilegePresent(constants.hireApplicant);
    $scope.canChangeApplicantStatus = SharedService.isPrivilegePresent(constants.changeApplicantStatus);
    $scope.canEmailApplicant = SharedService.isPrivilegePresent(constants.emailApplicant);
    $scope.canViewApplicantDetails = SharedService.isPrivilegePresent(constants.viewApplicantDetails);
    $scope.canViewResume = SharedService.isPrivilegePresent(constants.viewApplicantResume);

    function fetchAllJobApplicants() {
        var promise = ManageJobApplicantsService.getAllJobApplicants();
        promise.then(function (result) {
            $scope.jobApplicants = result;
            console.log('Job Applicants :', $scope.jobApplicants);
        });
    }

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname; //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.pageChangeHandler = function (num) {
        $scope.currentPage = num;
        console.log('going to page ' + num);
    };

    //show applicant details in a modal
    $scope.showDetails = function (applicant) {
        $scope.selectedApplicant = applicant;
        $('#jadModal').modal('show');
        console.log('preparing to show detail in modal ', $scope.selectedApplicant);
    }

    //Create backup
    function createBackup(jobApplicant) {
        jobApplicant.backupFirstName = angular.copy(jobApplicant.firstName);
        jobApplicant.backupLastName = angular.copy(jobApplicant.lastName);
        jobApplicant.backupPhone = angular.copy(jobApplicant.phone);
        jobApplicant.backupEmail = angular.copy(jobApplicant.email);
        jobApplicant.backupEducation = angular.copy(jobApplicant.education);
    }

    //Restore backup
    function restore(jobApplicant) {
        jobApplicant.firstName = angular.copy(jobApplicant.backupFirstName);
        jobApplicant.lastName = angular.copy(jobApplicant.backupLastName);
        jobApplicant.phone = angular.copy(jobApplicant.backupPhone);
        jobApplicant.email = angular.copy(jobApplicant.backupEmail);
        jobApplicant.education = angular.copy(jobApplicant.backupEducation);
    }

    //Delete backup fields
    function deleteBackup(jobApplicant) {
        delete jobApplicant.backupFirstName;
        delete jobApplicant.backupLastName;
        delete jobApplicant.backupPhone;
        delete jobApplicant.backupEmail;
        delete jobApplicant.backupEducation;
    }

    //Edit job applicant details
    $scope.edit = function (jobApplicantToUpdate) {
        console.log('clicked on edit ', jobApplicantToUpdate);
        createBackup(jobApplicantToUpdate);
    }

    //Cancel edit operation
    $scope.cancel = function (jobApplicant) {
        console.log('Cancelling edit operation for ', jobApplicant);
        restore(jobApplicant);
        deleteBackup(jobApplicant);
    }

    //Save update job applicant details
    $scope.update = function (jobApplicantToUpdate) {
        console.log('Updating details for job applicant ', jobApplicantToUpdate);
        deleteBackup(jobApplicantToUpdate);
        //call service method to update edited details
        var promise = ManageJobApplicantsService.updateJobApplicant(jobApplicantToUpdate);
        promise.then(function (result) {
            console.log('Operation success, refershing job applicants table');
            //refresh table contents
            fetchAllJobApplicants();
        });
    }

    // Update job applicant status
    $scope.updateJobApplicantStatus = function (status, studentId) {
        console.log('status ', status, ' studentId ', studentId);
        //call service method to update edited details
        var promise = ManageJobApplicantsService.updateJobApplicantStatus(status, studentId);
        promise.then(function (result) {
            console.log('Operation success, refershing job applicants table');
            //refresh table contents
            fetchAllJobApplicants();
            // show message
            SharedService.showSuccess("Status of applicant with Id " + studentId + " has been updated successfully");
        }).catch(function (resError) {
            console.log('UPDATE FAILURE :: ', resError);
            SharedService.showError('Error occurred while updating status');
        });
    }

    //Delete a job applicant
    $scope.delete = function (studentId) {
        console.log('Deleting job applicant with id: ', studentId);

        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete job applicant with ID ' + studentId + '?')
            .textContent('You cannot retrieve the data once it is deleted. Continue?')
            .ok('Yes')
            .cancel('No');

        $mdDialog.show(confirm).then(function () {
            var promise = ManageJobApplicantsService.deleteJobApplicant(studentId);
            promise.then(function (result) {

                    if (result.statusCode === 200) {
                        SharedService.showSuccess(result.message);
                        //refresh table contents
                        fetchAllJobApplicants();
                        console.log('Delete Operation success, refershing job applicants table');
                        return;
                    } else {
                        SharedService.showError(result.message);
                    }
                })
                .catch(function (resError) {
                    console.log('DELETE FAILURE :: ', resError);
                    //show failure message to the user
                    SharedService.showError('Failed to delete job applicant');
                });
        });
    }

    //Hire the job applicant
    $scope.hire = function (labAssistant) {
        console.log('Hiring applicant', labAssistant);

        var confirm = $mdDialog.confirm()
            .title('Hiring job applicant with ID ' + labAssistant.studentId)
            .textContent('Do you want to proceed with hiring this candidate?')
            .ok('Yes')
            .cancel('No');

        $mdDialog.show(confirm).then(function () {
            labAssistant.dateHired = $filter('date')(new Date(), 'mediumDate');

            var promise = ManageJobApplicantsService.hireJobApplicant(labAssistant);
            promise.then(function (result) {
                    if (result.statusCode === 200) {
                        SharedService.showSuccess(result.message);
                        //refresh table contents
                        fetchAllJobApplicants();
                        console.log('Hiring operation success, refershing job applicants table');
                        return;
                    } else {
                        SharedService.showError(result.message);
                    }
                })
                .catch(function (resError) {
                    console.log('HIRING CALL FAILURE :: ', resError);
                    //show failure message to the user
                    SharedService.showError('Failed to hire job applicant');
                });
        });
    }

    // download applicant resume
    $scope.download = function (applicantId) {

        console.log('downloading resume of ', applicantId);
        //call service to download
        var promise = SharedService.download(applicantId, 'jobapplicants');
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

    $scope.email = function (jobApplicant) {
        console.log('Sending email to the candidate ', jobApplicant);

        var promise = ManageJobApplicantsService.emailJobApplicant(jobApplicant);
        promise.then(function (result) {
            console.log('Emailing candidate successful, refershing job applicants table');
            //refresh table contents
            fetchAllJobApplicants();
        });
    }

}])
