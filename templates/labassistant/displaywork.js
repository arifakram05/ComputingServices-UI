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
            processHoursWorked();
            console.log('Shift schedule details: ', $scope.loggedWorkDetails);
            if ($scope.loggedWorkDetails.length > 0) {
                $scope.isDataFetched = true;
            } else {
                $scope.isDataFetched = false;
            }
        });
    }

    // given date as Date object and time as string, construct date object with time
    function constructDateTime(date, time) {
        var timeTokens = time.split(':');
        date.setHours(timeTokens[0]);
        date.setMinutes(timeTokens[1]);
        return date;
    }

    // given a start and end date and time object, calculate the difference in terms of hours:minutes
    function calculateHours(start, end) {
        var timeStart = start.getTime();
        var timeEnd = end.getTime();
        var msDiff = timeEnd - timeStart; //in milliseconds
        var secDiff = msDiff / 1000; //in seconds
        var minDiff = msDiff / 60 / 1000; //in minutes
        var hDiff = msDiff / 3600 / 1000; //in hours
        var humanReadable = {};
        humanReadable.hours = Math.floor(hDiff);
        humanReadable.minutes = minDiff - 60 * humanReadable.hours;
        if (humanReadable.minutes == 0) {
            return humanReadable.hours + ':' + humanReadable.minutes + '0';
        } else {
            return humanReadable.hours + ':' + humanReadable.minutes;
        }
    }

    // process hours worked
    function processHoursWorked() {
        angular.forEach($scope.loggedWorkDetails, function (value, key) {
            // calculate hours assigned to work
            if (value.start != null && value.end != null && value.date != null) {
                var shiftStartDateTime = constructDateTime(new Date(value.date), value.start);
                console.log('shiftStartDateTime: ', shiftStartDateTime);
                var shiftEndDateTime = constructDateTime(new Date(value.date), value.end);
                console.log('shiftEndDateTime: ', shiftEndDateTime);
                value.hoursAssigned = calculateHours(shiftStartDateTime, shiftEndDateTime);
            }
            // calculate time worked
            var t1;
            var t2;
            if (value.timesheet.clockedInDateTime != null) {
                t1 = moment(value.timesheet.clockedInDateTime).format('MMM DD, YYYY HH:mm')
                console.log('time 1 ', t1);
            }
            if (value.timesheet.clockedOutDateTime != null) {
                t2 = moment(value.timesheet.clockedOutDateTime).format('MMM DD, YYYY HH:mm')
                console.log('time 2 ', t2);
            }
            if (t1 != null && t2 != null) {
                /*var timeStart = new Date(t1).getTime();
                var timeEnd = new Date(t2).getTime();
                var msDiff = timeEnd - timeStart; //in milliseconds
                var secDiff = msDiff / 1000; //in seconds
                var minDiff = msDiff / 60 / 1000; //in minutes
                var hDiff = msDiff / 3600 / 1000; //in hours
                var humanReadable = {};
                humanReadable.hours = Math.floor(hDiff);
                humanReadable.minutes = minDiff - 60 * humanReadable.hours;
                value.hoursWorked = humanReadable.hours + ':' + humanReadable.minutes;*/
                value.hoursWorked = calculateHours(new Date(t1), new Date(t2));
                console.log(value.hoursWorked);
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
