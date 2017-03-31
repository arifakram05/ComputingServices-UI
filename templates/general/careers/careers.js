'use strict';

angular.module('computingServices.careers', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/careers', {
        templateUrl: 'templates/general/careers/careers.html',
        controller: 'CareersCtrl'
    });
}])

.service('CareersService', ['$http', function ($http) {
    this.post = function (uploadUrl, submittedData, submittedFile) {

        console.log('Data to be sent to the server (Raw): ', submittedData);
        console.log('Just the file data: ', submittedFile);

        $http({
            method: 'POST',
            url: uploadUrl,
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
            alert("success!");
        }).
        error(function (data, status, headers, config) {
            alert("failed!");
        });

    }
}])

.controller('CareersCtrl', ['$scope', 'CareersService', '$filter', function ($scope, CareersService, $filter) {

    $scope.user = {};

    $scope.files = [];
    //listen for the file selected event which is raised from directive
    $scope.$on("seletedFile", function (event, args) {
        $scope.$apply(function () {
            //add the file object to the scope's files collection
            console.log('pushing files: ', args);
            $scope.files.push(args.file);
        });
    });

    $scope.save = function () {
        $scope.$broadcast('show-errors-check-validity');

        if ($scope.userForm.$valid) {
            console.log($scope.user);
            $scope.user.dateApplied = $filter('date')(new Date(), 'd MMM, yyyy');
            /*http://127.0.0.1:8080/ComputingServicesApp/home/careers2*/
            CareersService.post(constants.url + 'general/careers', $scope.user, $scope.files);
            //reset form after receiving response
            $scope.reset();
        }
    };

    $scope.change = function (fileName) {
        console.log('file being uploaded is ', fileName);
        angular.element('#uploadFile').val(fileName);
    };

    $scope.reset = function () {
        $scope.$broadcast('show-errors-reset');
        $scope.user = {};
        angular.element('#uploadBtn').val('');
        angular.element('#uploadFile').val('');
    };

}]);
