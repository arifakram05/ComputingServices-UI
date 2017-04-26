'use strict';

angular.module('computingServices.careers', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/careers', {
        templateUrl: 'templates/general/careers/careers.html',
        controller: 'CareersCtrl'
    });
}])

.factory('CareersService', ['$http', '$q', function ($http, $q) {

    var APPLY_JOB_URI = constants.url + 'general/careers';

    var factory = {
        applyJob: applyJob
    };

    return factory;

    function applyJob(submittedData, submittedFile) {

        console.log('Data to be sent to the server (Raw): ', submittedData);
        console.log('Just the file data: ', submittedFile);

        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: APPLY_JOB_URI,
            headers: {
                'Content-Type': undefined
            },

            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("application", angular.toJson(data.model));
                formData.append("resume", data.files);
                /*for (var i = 0; i < data.files.length; i++) {
                    formData.append("file" + i, data.files[i]);
                }*/ //for multiple files
                return formData;
            },
            data: {
                model: submittedData,
                files: submittedFile
            }
        }).
        success(function (data, status, headers, config) {
            console.log('Apply Job Success ', status);
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log('Apply Job Failure ', status);
            deferred.reject(data);
        });

        return deferred.promise;
    }
}])

.controller('CareersCtrl', ['$scope', 'CareersService', '$filter', '$mdDialog', 'SharedService', function ($scope, CareersService, $filter, $mdDialog, SharedService) {

    $scope.user = {};

    $scope.save = function () {

        console.log('applicant data : ', $scope.user);
        console.log('file data: ', $scope.files_resume);
        console.log('file name: ', $scope.files_resume.name);
        // permitted file extensions
        var allowedExtns = ['pdf', 'doc', 'docx', 'odt'];
        var fileExtn = $scope.files_resume.name.split('.');
        if (fileExtn.length === 1 || (fileExtn[0] === "" && a.length === 2) || fileExtn.length > 2 || allowedExtns.indexOf(fileExtn[1]) === -1) {
            notifyUser('Only the files with extensions .pdf .doc .docx .odt are permitted for upload. Please upload a valid file');
            return;
        }
        console.log('resume extn ', fileExtn[1]);
        $scope.user.resumeExtn = fileExtn[1];

        $scope.user.dateApplied = $filter('date')(new Date(), 'mediumDate');

        var promise = CareersService.applyJob($scope.user, $scope.files_resume);
        promise.then(function (result) {
                //CareersService.post(constants.url + 'general/careers', $scope.user, $scope.files_resume);

                if (result.statusCode === 200) {
                    SharedService.showSuccess(result.message);
                } else {
                    SharedService.showError(result.message);
                }
            })
            .catch(function (resError) {
                console.log('FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Error Ocurred while submitting your profile');
                notifyUser('Some error occurred while submitting your profile. Please try again, if you see the error again, please submit the paper based application');
            });

        //reset form after receiving response
        $scope.reset();
    };

    //can form be submitted
    $scope.canSubmitForm = function () {
        if ($scope.userForm.$invalid || $scope.files_resume === undefined) {
            return true;
        }
        return false;
    }

    //clear form
    $scope.reset = function () {
        $scope.user = {};
        $scope.files_resume = undefined;
        $scope.userForm.$setPristine();
        $scope.userForm.$setUntouched();
    };

    //alerts to user
    function notifyUser(message) {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .textContent(message)
            .ok('Got it!')
        );
    }

}])

.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };

}]);
