'use strict';

angular.module('computingServices.wiki', ['ngRoute', 'ngResource'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/wiki', {
        templateUrl: 'templates/general/wiki/wiki.html',
        controller: 'WikiCtrl'
    });
}])

.factory('WikiService', ['$http', '$q', '$resource', function ($http, $q, $resource) {

    var FETCH_URI = constants.url + 'general/wiki'; // Done
    var UPLOAD_URI = constants.url + 'admin/upload-wiki'; // Done
    var DELETE_URI = constants.url + 'general/delete-wiki';

    var factory = {
        fetchWiki: fetchWiki,
        uploadWiki: uploadWiki,
        deleteWiki: deleteWiki
    };

    return factory;

    // load all wikis
    function fetchWiki() {
        var deferred = $q.defer();

        $http({
                method: 'GET',
                url: FETCH_URI
            })
            .then(
                function (response) {
                    console.log('Fetched Wikis: ', response);
                    deferred.resolve(response.data);
                },
                function (errResponse) {
                    console.error('Error while fetching Wikis: ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

    // upload a wiki
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

    // delete a wiki
    function deleteWiki(fileId) {
        var deferred = $q.defer();
        var url = $resource(DELETE_URI + "/:id");
        url.delete({
            id: fileId
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
}])

.controller('WikiCtrl', ['$scope', 'WikiService', '$filter', '$mdDialog', 'SharedService', '$window', function ($scope, WikiService, $filter, $mdDialog, SharedService, $window) {

    $scope.wiki = {};
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.closeUploadForm = false;

    fetchAllWikis();

    // load wikis
    function fetchAllWikis() {
        var promise = WikiService.fetchWiki();
        promise.then(function (result) {
            $scope.wikis = result;
            console.log('Wikis :', $scope.wikis);
        }).catch(function (resError) {
            console.error('Error while fetching Wikis');
            SharedService.showError('Failed to load Wiki pages');
        });
    }

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
        $scope.wiki.uploadedOn = moment(new Date()).format('MMM DD, YYYY');
        $scope.wiki.description = description;

        console.log('Wiki data : ', $scope.wiki);

        var promise = WikiService.uploadWiki($scope.wiki, fileData);
        promise.then(function (result) {
                if (result.statusCode === 200) {
                    SharedService.showSuccess(result.message);
                    // reload page
                    fetchAllWikis();
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
                    var url = URL.createObjectURL(new Blob([response.data], {
                        type: 'application/pdf'
                    }));
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

    //Delete wiki
    $scope.deleteWiki = function (fileId) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete this file?')
            .textContent('You cannot retrieve the data once it is deleted. Continue?')
            .ok('Yes')
            .cancel('No');

        $mdDialog.show(confirm).then(function () {
            console.log('this shows up because user clicked YES');
            console.log('Data to delete: ', fileId);

            var promise = WikiService.deleteWiki(fileId.$oid);
            promise.then(function (result) {
                    SharedService.showSuccess("Deleted");
                    // reload wikis
                    fetchAllWikis();
                })
                .catch(function (resError) {
                    console.log('DELETE WIKI CALL FAILURE :: ', resError);
                    //show failure message to the user
                    SharedService.showError('Failed to delete the document');
                });
        });
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
