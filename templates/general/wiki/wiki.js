'use strict';

angular.module('computingServices.wiki', ['ngRoute', 'ngResource'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/wiki', {
        templateUrl: 'templates/general/wiki/wiki.html',
        controller: 'WikiCtrl'
    });
}])

.factory('WikiService', ['$http', '$q', '$resource', function ($http, $q, $resource) {

    var UPLOAD_URI = constants.url + 'admin/upload-wiki';
    var DELETE_URI = constants.url + 'general/delete-wiki';

    var factory = {
        uploadWiki: uploadWiki,
        deleteWiki: deleteWiki
    };

    return factory;

    function uploadWiki(submittedData, submittedFile) {

        console.log('Data to be sent to the server (Raw): ', submittedData);
        console.log('Just the file data: ', submittedFile);

        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: UPLOAD_URI,
            headers: {
                'Content-Type': undefined
            },

            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("wikipage", angular.toJson(data.model));
                formData.append("file", data.file);
                return formData;
            },
            data: {
                model: submittedData,
                file: submittedFile
            }
        }).
        success(function (data, status, headers, config) {
            console.log('Upload file Success ', status);
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log('Upload file Failure ', status);
            deferred.reject(data);
        });

        return deferred.promise;
    }

    function deleteWiki(fileId) {
        /*var deferred = $q.defer();
        var url = $resource(CHECK_STATUS + "/:id");
        url.delete({
            id: studentId
        }).$promise.then(function success(response) {
                console.log('Retrieved status: ', response);
                deferred.resolve(response);
            },
            function error(errResponse) {
                console.error('Error while retrieving status: ', errResponse);
                deferred.reject(errResponse);
            });
        return deferred.promise;*/
    }
}])

.controller('WikiCtrl', ['$scope', 'WikiService', '$filter', '$mdDialog', 'SharedService', '$window', function ($scope, WikiService, $filter, $mdDialog, SharedService, $window) {

    $scope.wikis = [{
        "fileName": "Important Instructions",
        "_id": "5609786",
        "description": "This file contains important instructions"
    }, {
        "fileName": "Forgot Password",
        "_id": "0779693",
        "description": "This file contains important instructions. Also, it contains very important instructions. Also, it contains very important instructions."
    }];
    $scope.wiki = {};
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.closeUploadForm = false;

    // upload a document
    $scope.uploadWiki = function (fileData, description) {
        console.log('file data: ', fileData);
        console.log('file name: ', fileData.name);
        // permitted file extensions
        var allowedExtns = ['pdf', 'doc', 'docx', 'odt'];
        var fileExtn = fileData.name.split('.');
        if (fileExtn.length === 1 || (fileExtn[0] === "" && a.length === 2) || fileExtn.length > 2 || allowedExtns.indexOf(fileExtn[1]) === -1) {
            notifyUser('Only the files with extensions .pdf .doc .docx .odt are permitted for upload. Please upload a valid file');
            return;
        }

        console.log('wiki extn ', fileExtn[1]);

        $scope.wiki.fileExtn = fileExtn[1];
        $scope.wiki.fileName = fileData.name;
        $scope.wiki.uploadedBy = SharedService.getUserId();
        $scope.wiki.uploadedDate = $filter('date')(new Date(), 'mediumDate');
        $scope.wiki.description = description;

        console.log('Wiki data : ', $scope.wiki);

        var promise = WikiService.uploadWiki($scope.wiki, fileData);
        promise.then(function (result) {
                if (result.statusCode === 200) {
                    SharedService.showSuccess(result.message);
                } else {
                    SharedService.showError(result.message);
                }
                //reset upload
                $scope.closeUploadForm();
            })
            .catch(function (resError) {
                console.log('FAILURE :: ', resError);
                SharedService.showError('Error Ocurred while uploading');
            });
    };

    // close upload form
    $scope.closeUploadForm = function () {
        $scope.openUploadDialog = false;
        return;
    }

    // download a document
    $scope.downloadWiki = function (fileId) {

        console.log('downloading wiki with ID: ', fileId);
        //call service to download
        var promise = SharedService.download(fileId, 'wikipages');
        promise.then(function (response) {
                console.log('result : ', response);

                var fileLength = response.data.byteLength;

                if (fileLength !== 0) {
                    var url = URL.createObjectURL(new Blob([response.data], {type: 'application/pdf'}));
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = response.filename;
                    a.target = '_blank';
                    a.click();
                    //show success message
                    SharedService.showSuccess("Download Complete");
                    // open in new tab
                    $window.open(url);
                } else {
                    //notify that file does not exist for requested user
                    SharedService.showWarning("File does not exist");
                }
            })
            .catch(function (resError) {
                console.log('DOWNLOAD FAILURE :: ', resError);
                SharedService.showError('Error occurred while downloading requested file');
            });
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
