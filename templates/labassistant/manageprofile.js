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

    var UPDATE_LA_PROFILE_URI = constants.url + 'assistant/updateProfile';

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

.controller('ManageProfileCtrl', ['$scope', '$filter', '$mdDialog', 'ManageProfileService', 'SharedService', function ($scope, $filter, $mdDialog, ManageProfileService, SharedService) {

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

    $scope.change = function (fileName) {
        console.log('file being uploaded is ', fileName);
    };

    //update form
    $scope.updateProfile = function (labAsst) {

        $scope.laProfileForm.$setSubmitted();

        console.log('resume ', $scope.files_resume);
        console.log('photo ', $scope.files_photo);

        console.log('profile to be saved is ', labAsst, $scope.files_resume, $scope.files_photo);

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
