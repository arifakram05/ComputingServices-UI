'use strict';

angular.module('computingServices.manageprofile', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/manageprofile', {
        templateUrl: 'labassistant/manageprofile.html',
        controller: 'ManageProfileCtrl'
    })
}])

.factory('ManageProfileService', ['$http', '$q', function ($http, $q) {

    var UPDATE_LA_PROFILE = 'http://127.0.0.1:8080/ComputingServicesApp/laservices/updateProfile';

    //define all factory methods
    var factory = {
        updateProfile: updateProfile
    };

    return factory;

    //update LA profile
    function updateProfile(submittedData, submittedResume, submittedPhoto) {
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: UPDATE_LA_PROFILE,
            headers: {
                'Content-Type': undefined
            },

            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("model", angular.toJson(data.model));
                formData.append("resume", data.submittedResume);
                formData.append("photo", data.submittedPhoto);
                return formData;
            },
            data: {
                model: submittedData,
                resume: submittedResume,
                photo: submittedPhoto
            },
        }).
        success(function (data, status, headers, config) {
            console.log('LA profile update success ', data);
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log('LA profile update failure ', data);
            deferred.reject(data);
        });

        return deferred.promise;
    }

}])

.controller('ManageProfileCtrl', ['$scope', '$filter', '$mdDialog', 'ManageProfileService', function ($scope, $filter, $mdDialog, ManageProfileService) {

    console.log('manage LA profile...');

    //$scope.files = [];
    //listen for the file selected event which is raised from directive
    /*$scope.$on("seletedFile", function (event, args) {
        $scope.$apply(function () {
            //add the file object to the scope's files collection
            console.log('pushing files: ', args);
            $scope.files.push(args.file);
        });
    });*/

    $scope.change = function(fileName) {
        console.log('file being uploaded is ',fileName);
    };

    //update form
    $scope.updateProfile = function (labAsst) {

        $scope.laProfileForm.$setSubmitted();

        console.log('resume ',$scope.files_resume);
        console.log('photo ',$scope.files_photo);

        console.log('profile to be saved is ', labAsst, $scope.files_resume, $scope.files_photo);

        //make service call
        var promise = ManageProfileService.updateProfile(labAsst, $scope.files_resume, $scope.files_photo);
        promise.then(function (result) {
            console.log('Profile Updated.', result);
        });

        //clear fields
        $scope.clearValue();

    }

    //clear form
    $scope.clearValue = function () {
        /*$scope.rawStartDate = undefined;
        $scope.rawEndDate = undefined;
        $scope.rawStartTime = undefined;
        $scope.rawEndTime = undefined;
        $scope.labSchedule = undefined;
        $scope.selectedCampusName = undefined;
        $scope.selectedLabName = undefined;*/
        $scope.laProfileForm.$setPristine();
        $scope.laProfileForm.$setUntouched();
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

}]);
