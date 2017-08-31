'use strict';

angular.module('computingServices.manageprofile', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/manageprofile', {
        templateUrl: 'templates/labassistant/manageprofile.html',
        controller: 'ManageProfileCtrl'
    })
}])

.factory('ManageProfileService', ['$http', '$q', function ($http, $q) {

    var UPDATE_LA_PROFILE_URI = constants.url + 'assistant/update-profile';

    //define all factory methods
    var factory = {
        updateProfile: updateProfile
    };

    return factory;

    //update LA profile
    function updateProfile(labassistant, resume, photo) {
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: UPDATE_LA_PROFILE_URI,
            headers: {
                'Content-Type': undefined
            },

            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("labassistant", angular.toJson(labassistant));
                formData.append("resume", resume);
                formData.append("photo", photo);
                return formData;
            }
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

.controller('ManageProfileCtrl', ['$scope', '$filter', 'ManageProfileService', 'SharedService', function ($scope, $filter, ManageProfileService, SharedService) {

    console.log('manage LA profile...');

    $scope.labAsst = {};
    //update form
    $scope.updateProfile = function (labAsst) {

        $scope.laProfileForm.$setSubmitted();

        console.log('resume ', $scope.files_resume);
        console.log('photo ', $scope.files_photo);

        console.log('profile to be saved is ', labAsst, $scope.files, $scope.files_photo);

        //Testing Only
        labAsst._id = "590138b3218de207b7ed018f";
        labAsst.firstName = "Allan";
        labAsst.lastName = "Donald";

        //make service call
        var promise = ManageProfileService.updateProfile(labAsst, $scope.files_resume, $scope.files_photo);
        promise.then(function (result) {
                if (result.statusCode === 200) {
                    SharedService.showSuccess(result.message);
                    console.log('Profile Updated');
                    //clear fields
                    $scope.clearValue();
                } else {
                    SharedService.showError(result.message);
                }
            })
            .catch(function (resError) {
                console.log('UPDATED CALL FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Update Failed');
            });
    }

    //clear form
    $scope.clearValue = function () {
        $scope.labAsst = undefined;
        $scope.files_resume = undefined;
        $scope.files_photo = undefined;
        $scope.laProfileForm.$setPristine();
        $scope.laProfileForm.$setUntouched();
    };

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
