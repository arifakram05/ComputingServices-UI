'use strict';

angular.module('computingServices.displaywork', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/displaywork', {
        templateUrl: 'templates/labassistant/displaywork.html',
        controller: 'DisplayWorkCtrl'
    })
}])

.factory('DisplayWorkService', ['$http', '$q', function ($http, $q) {

    var GET_LA_SCHEDULE = constants.url + 'assistant/many-schedules';

    //define all factory methods
    var factory = {
        displayWork: displayWork
    };

    return factory;

    //fetch the LAs work hours between two given dates
    function displayWork(studentId, startDate, endDate) {
        var deferred = $q.defer();
        $http({
                method: 'GET',
                url: GET_LA_SCHEDULE,
                params: {
                    studentId: studentId,
                    startDate: startDate,
                    endDate: endDate
                }
            })
            .then(
                function success(response) {
                    console.log('Retrieved shift schedule: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while retrieving shift schedule ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

}])

.controller('DisplayWorkCtrl', ['$scope', '$filter', '$mdDialog', 'SharedService', 'DisplayWorkService', function ($scope, $filter, $mdDialog, SharedService, DisplayWorkService) {

    setup();

    function setup() {
        $scope.labAsst = {};
        $scope.isSubmitClicked = false;
        console.log("user role is ", SharedService.getUserRole());
        if (SharedService.getUserRole() === 'Admin') {
            $scope.isUserAdmin = true;
        } else {
            $scope.labAsst.id = SharedService.getUserId();
            $scope.isUserAdmin = false;
        }
    }

    // print
    $scope.print = function (divName) {
        if ($scope.loggedWorkDetails) {
            console.log('printing....');
            var printContents = document.getElementById(divName).innerHTML;
            var popupWin = window.open('', '_blank', 'width=400,height=400');
            popupWin.document.open();
            popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../css/app.css"/></head><body onload="window.print()">' + printContents + '</body></html>');
            popupWin.document.close();
        } else {
            notifyUser('Please select the dates to print');
        }
    }

    // clear form
    $scope.clear = function () {
        $scope.labAsst = undefined;
        $scope.showLAWork.$setPristine();
        $scope.showLAWork.$setUntouched();
    };

    // retrieve recorded work
    $scope.fetch = function (labAsst) {
        $scope.isSubmitClicked = true;
        var id = labAsst.id;
        var startDate = moment(labAsst.startDate).format('MMM DD, YYYY');
        var endDate = moment(labAsst.endDate).format('MMM DD, YYYY');
        console.log('request params: ', id, ' ', startDate, ' ', endDate);
        var promise = DisplayWorkService.displayWork(id, startDate, endDate);
        promise.then(function (result) {
            $scope.loggedWorkDetails = result.response;
            console.log('Shift schedule details: ', $scope.loggedWorkDetails);
            if ($scope.loggedWorkDetails.length > 0) {
                $scope.isDataFetched = true;
            } else {
                $scope.isDataFetched = false;
            }
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

}]);
