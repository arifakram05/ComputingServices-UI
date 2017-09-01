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

.controller('DisplayWorkCtrl', ['$scope', '$filter', '$mdDialog', 'DisplayWorkService', function ($scope, $filter, $mdDialog, DisplayWorkService) {

    console.log('displaying lab assistants worked hours');

    //remove this after attaching service call, just for dummy data
    $scope.labAsstDetails = {
        fullName: "Mohammed, Arif Akram",
        userId: "1643568",
        fromDate: "Jan 1, 2017",
        toDate: "Jan 20, 2017",
        work: [{
            clockedInDate: "Jan 1,2016",
            clockedOutDate: "Jan 1,2016",
            clockedInTime: "08:00 AM",
            clockedOutTime: "12:00 PM",
            total: 4
        }, {
            clockedInDate: "Jan 2,2016",
            clockedOutDate: "Jan 2,2016",
            clockedInTime: "08:00 AM",
            clockedOutTime: "12:00 PM",
            total: 4
        }, {
            clockedInDate: "Jan 3,2016",
            clockedOutDate: "Jan 2,2016",
            clockedInTime: "08:00 AM",
            clockedOutTime: "12:00 PM",
            total: 4
        }]
    };

    //monitor for form validity
    $scope.$watch('showLAWork.$valid', function (rawStartDate, rawEndDate) {
        //if form valid, then make a server call
        if ($scope.rawStartDate && $scope.rawEndDate) {
            displayWork();
            $scope.isDataFetched = true;
        }
    });

    // service call
    function displayWork() {
        var startDate = moment($scope.rawStartDate).format('MMM DD, YYYY');
        var endDate = moment($scope.rawEndDate).format('MMM DD, YYYY');
        var promise = DisplayWorkService.displayWork("468415", startDate, endDate);
        promise.then(function (result) {
            $scope.labAsstDetails = result.response;
            console.log('Shift schedule details: ', $scope.labAsstDetails);
        });
    }

    $scope.print = function (divName) {
        if ($scope.labAsstDetails) {
            console.log('printing....');
            var printContents = document.getElementById(divName).innerHTML;
            var popupWin = window.open('', '_blank', 'width=400,height=400');
            popupWin.document.open();
            popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="app.css"/></head><body onload="window.print()">' + printContents + '</body></html>');
            popupWin.document.close();
        } else {
            notifyUser('Please select the dates to print');
        }
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
