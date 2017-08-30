'use strict';

angular.module('computingServices.recordwork', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/recordwork', {
        templateUrl: 'templates/labassistant/recordwork.html',
        controller: 'RecordWorkCtrl'
    })
    }])

.factory('RecordWorkService', ['$http', '$q', function ($http, $q) {

    var CLOCK_IN_CLOCK_OUT = constants.url + 'assistant/record-work';
    var GET_SHIFT_DETAILS_FOR_CLOCKING = constants.url + 'assistant/shift-timings';

    //define all factory methods
    var factory = {
        recordWork: recordWork,
        getShiftDetailsForClocking: getShiftDetailsForClocking
    };

    return factory;

    // fetch shift timings
    function getShiftDetailsForClocking(studentId, date) {
        var deferred = $q.defer();
        $http({
                method: 'GET',
                url: GET_SHIFT_DETAILS_FOR_CLOCKING,
                params: {
                    studentId: studentId,
                    date: date
                }
            })
            .then(
                function success(response) {
                    console.log('Retrieved shift timing: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while retrieving shift timings ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

    //clock-in or clock-out
    function recordWork(labasst) {
        var deferred = $q.defer();

        $http.post(CLOCK_IN_CLOCK_OUT, JSON.stringify(labasst))
            .success(
                function (data, status, headers, config) {
                    console.log('clock-in or clock-out operation success ', data);
                    deferred.resolve(data);
                })
            .error(
                function (data, status, header, config) {
                    console.log('clock-in or clock-out operation failure ', data);
                    deferred.reject(data);
                });
        return deferred.promise;
    }

}])

.controller('RecordWorkCtrl', ['$scope', '$filter', '$mdDialog', 'RecordWorkService', 'SharedService', function ($scope, $filter, $mdDialog, RecordWorkService, SharedService) {

    console.log('record work page for lab assistant');
    $scope.shifts = [];

    // get shift details for today, if any
    getShiftDetailsForClocking();

    function getShiftDetailsForClocking() {
        var date = moment(new Date()).format('MMM D, YYYY');
        var promise = RecordWorkService.getShiftDetailsForClocking("468415", date);
        promise.then(function (result) {
            $scope.shifts = result.response;
            console.log('Shift timings: ', $scope.shifts);
        });
    }

    // check if clock-in button can be enabled
    $scope.isClockInDisabled = function (isClockedIn, givenStartTime, givenEndTime) {
        // if already clocked in, do not let user clock-in again
        if(isClockedIn) {
            return true;
        }
        console.log('time to split ',givenStartTime);
        var timeArr = givenStartTime.split(':');
        var startDate = new Date().setHours(timeArr[0], timeArr[1]);
        var startTime = moment(startDate).subtract('6', 'minutes').format('MMM D, YYYY HH:mm');
        console.log('checking if clock-in button can be enabled ',startTime);
        var rightNow = moment(new Date()).format('MMM D, YYYY HH:mm');

        timeArr = givenEndTime.split(':');
        var endDate = new Date().setHours(timeArr[0], timeArr[1]);
        var endTime = moment(endDate).format('MMM D, YYYY HH:mm');
        console.log('clock-out time ',endTime);

        console.log('Right now ',rightNow);
        // if shift has not begin yet; startTime refers to future time
        if (startTime > rightNow) {
            console.log("shiftstarttime > rightnow i.e. shift has not begun yet; cannot clock-in");
            return true;
        } else {
            // if shift has already began; startTime refers to past time
            // also, user can only clock-in within the shift end time
            if (endTime > rightNow) { // endTime refers to future time
                console.log("shiftstarttime < rightnow i.e. shift has already begun; can clock-in");
                return false;
            } else {
                // user if not clocked-in and startTime refers to past time, but endTime is also past time, then user can't clock-in
                console.log("User was not able to clock-in in time, and user cannot clock-in anymore");
                return true;
            }
        }
    }

    // clock-in
    $scope.recordWork = function (operation) {
        var confirm = $mdDialog.confirm()
            .title('Please make sure that you are scheduled to work at this time.')
            .textContent('Are you sure you want to proceed?')
            .ok('Yes')
            .cancel('No');

        $mdDialog.show(confirm).then(function () {

            var datetime = moment(new Date()).format('MMM D, YYYY HH:mm');

            var labasst = {
                operation: operation,
                labAssistantId: 123456,
                datetime: datetime
            };

            console.log('details to record : ', labasst);

            var promise = RecordWorkService.recordWork(labasst);
            promise.then(function (result) {
                    if (result.statusCode === 200) {
                        SharedService.showSuccess(result.message);
                        return;
                    } else {
                        SharedService.showError(result.message);
                    }
                })
                .catch(function (resError) {
                    console.log('FAILURE :: ', resError);
                    //show failure message to the user
                    SharedService.showError('Error occurred while Clocking-In');
                });
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
