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
    var EMAIL_JOB_APPLICANT_URI = constants.url + 'services/emailJobApplicant';

    //define all factory methods
    var factory = {
        getAllJobApplicants: getAllJobApplicants,
        deleteJobApplicant: deleteJobApplicant,
        updateJobApplicant: updateJobApplicant,
        hireJobApplicant: hireJobApplicant,
        emailJobApplicant: emailJobApplicant
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

    function hireJobApplicant(jobApplicant) {
        var deferred = $q.defer();

        $http.post(HIRE_JOB_APPLICANT_URI, JSON.stringify(jobApplicant))
            .success(
                function (data, status, headers, config) {
                    console.log('Hire operation success', data);
                    deferred.resolve(data.resposne);
                })
            .error(
                function (data, status, header, config) {
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

}])

.controller('ManageJobApplicantsCtrl', ['$scope', 'ManageJobApplicantsService', 'SharedService', function ($scope, ManageJobApplicantsService, SharedService) {
    console.log('clicked on manage job applicants');

    $scope.jobApplicants = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10

    fetchAllJobApplicants();

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

    //Delete a job applicant
    $scope.delete = function (studentId) {
        console.log('Deleting job applicant with id: ', studentId);

        var promise = ManageJobApplicantsService.deleteJobApplicant(studentId);
        promise.then(function (result) {

                if (result.statusCode === 200) {
                    SharedService.showSuccess('Successfully deleted job applicant - ' + studentId);
                    //refresh table contents
                    fetchAllJobApplicants();
                    console.log('Delete Operation success, refershing job applicants table');
                    return;
                } else {
                    SharedService.showError('Could not delete job applicant - ' + studentId);
                }
            })
            .catch(function (resError) {
                console.log('DELETE FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to delete job applicant');
            });
    }

    //Hire the job applicant
    $scope.hire = function (jobApplicant) {
        console.log('Hiring applicant', jobApplicant);

        var promise = ManageJobApplicantsService.hireJobApplicant(jobApplicant);
        promise.then(function (result) {
                if (result.statusCode === 200) {
                    SharedService.showSuccess('Successfully hired job applicant - ' + studentId + '. You can find this candidate in lab assistants list');
                    //refresh table contents
                    fetchAllJobApplicants();
                    console.log('Hiring operation success, refershing job applicants table');
                    return;
                } else {
                    SharedService.showError('Could not hire job applicant - ' + studentId);
                }
            })
            .catch(function (resError) {
                console.log('HIRING CALL FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to hire job applicant');
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
