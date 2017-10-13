'use strict';

angular.module('computingServices.recordwork', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/recordwork', {
        templateUrl: 'labassistant/recordwork.html',
        controller: 'RecordWorkCtrl'
    })
}])

.factory('RecordWorkService', ['$http', '$q', function ($http, $q) {

    var CLOCK_IN_CLOCK_OUT = constants.url + 'assistant/record-work';
    var GET_SHIFT_DETAILS_FOR_CLOCKING = constants.url + 'assistant/single-schedule';

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

    // save clock-in or clock-out time
    function recordWork(work) {
        console.log('work to save : ', work);
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: CLOCK_IN_CLOCK_OUT,
            headers: {
                'Content-Type': undefined
            },
            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("operation", work.operation);
                formData.append("studentId", work.studentId);
                formData.append("datetime", work.datetime);
                formData.append("id", work.id);
                return formData;
            }
        }).success(function (data, status, headers, config) {
            console.log('clock-in or clock-out operation success ', data);
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            console.log('clock-in or clock-out operation failure ', status);
            deferred.reject(data);
        });

        return deferred.promise;
    }

}])

.controller('RecordWorkCtrl', ['$scope', '$filter', '$mdDialog', 'RecordWorkService', 'SharedService', function ($scope, $filter, $mdDialog, RecordWorkService, SharedService) {

    console.log('record work page for lab assistant');

    //Check if user is logged in, only then continue
    if(!SharedService.isUserLoggedIn()) {
        return;
    }

    if(!SharedService.isPrivilegePresent(constants.CLOCK_IN_OUT)) {
        SharedService.showWarning('You do not have privileges to view "Clock-In/Clock-Out" page. Please contact Lab Manager');
        SharedService.showLoginPage();
        return;
    }

    $scope.shifts = [];

    // get shift details for today, if any
    getShiftDetailsForClocking();

    function getShiftDetailsForClocking() {
        var date = moment(new Date()).format('MMM DD, YYYY');
        var promise = RecordWorkService.getShiftDetailsForClocking(SharedService.getUserId(), date);
        promise.then(function (result) {
            $scope.shifts = result.response;
            console.log('Shift timings: ', $scope.shifts);
            if ($scope.shifts.length > 0) {
                $scope.isDataFetched = true;
            } else {
                $scope.isDataFetched = false;
            }
        });
    }

    // check if clock-in button can be enabled
    $scope.isClockInDisabled = function (isClockedIn, isClockedOut, givenStartTime, givenEndTime, id) {
        // if already clocked in, do not let user clock-in again
        if (isClockedIn) {
            notifyUser("You cannot clock-in as you are already clocked-in.");
            //return true;
            return;
        }
        console.log('time to split ', givenStartTime);
        var timeArr = givenStartTime.split(':');
        var startDate = new Date().setHours(timeArr[0], timeArr[1]);
        var startTime = moment(startDate).subtract(6, 'minutes').format('MMM DD, YYYY HH:mm');
        console.log('checking if clock-in button can be enabled ', startTime);
        var rightNow = moment(new Date()).format('MMM DD, YYYY HH:mm');

        timeArr = givenEndTime.split(':');
        var endDate = new Date().setHours(timeArr[0], timeArr[1]);
        var endTime = moment(endDate).format('MMM DD, YYYY HH:mm');
        console.log('clock-out time ', endTime);

        console.log('Right now ', rightNow);
        // if shift has not begin yet; startTime refers to future time
        if (startTime > rightNow) {
            console.log("shiftstarttime > rightnow i.e. shift has not begun yet; cannot clock-in");
            notifyUser("You can only clock-in before 5 minutes of shift start time.");
            //return true;
            return;
        } else if (endTime > rightNow) { // endTime refers to future time
            // if shift has already began; startTime refers to past time
            // also, user can only clock-in within the shift end time
            if (!isClockedOut) {
                console.log("shiftstarttime < rightnow i.e. shift has already begun; can clock-in");
                // call a function to save clock-in time
                $scope.recordWork('clock-in', SharedService.getUserId(), id);
                //return false;
                return;
            } else {
                console.log("You have already clocked-out, now you cannot clock-in");
                notifyUser("You cannot continue with this operation as you have clocked-out already. Please see Lab Manager.");
            }
        } else {
            // user if not clocked-in and startTime refers to past time, but endTime is also past time, then user can't clock-in
            console.log("User was not able to clock-in in time, and user cannot clock-in anymore");
            notifyUser("You cannot clock-in as you missed the window. Please contact Lab Manager");
            //return true;
            return;
        }
    }

    // check if clock-out button can be enabled
    $scope.isClockOutDisabled = function (isClockedOut, isClockedIn, givenStartTime, givenEndTime, id) {
        // if already clocked out, do not let user clock-out again
        if (isClockedOut) {
            notifyUser("You cannot clock-out as you have already clocked-out.");
            //return true;
            return;
        }
        console.log('time to split ', givenStartTime);
        var timeArr = givenStartTime.split(':');
        var startDate = new Date().setHours(timeArr[0], timeArr[1]);
        var startTime = moment(startDate).add(14, 'minutes').format('MMM DD, YYYY HH:mm');
        console.log('checking if clock-out button can be enabled ', startTime);
        var rightNow = moment(new Date()).format('MMM DD, YYYY HH:mm');

        timeArr = givenEndTime.split(':');
        var endDate = new Date().setHours(timeArr[0], timeArr[1]);
        var endTime = moment(endDate).add(16, 'minutes').format('MMM DD, YYYY HH:mm');
        console.log('clock-out time ', endTime);

        console.log('Right now ', rightNow);
        // if shift has not begin yet; startTime refers to future time
        if (startTime > rightNow) {
            console.log("shiftstarttime > rightnow i.e. shift has not begun yet; cannot clock-out. Can only clock-out after 15 mins into shift start");
            notifyUser("You can only clock-out after 15 minutes of shift start time.");
            //return true;
            return;
        } else if (endTime > rightNow) { // endTime refers to future time
            // if shift has already began; startTime refers to past time
            // also, user can only clock-out within the shift end time + 15 mins
            console.log("shiftstarttime < rightnow i.e. shift has already begun and its been more than 15 mins; can clock-out");
            // call a function to save clock-out time
            $scope.recordWork('clock-out', SharedService.getUserId(), id);
            //return false;
        } else {
            // user if not clocked-out and startTime refers to past time, but endTime is also past time, then user can't clock-out
            console.log("User was not able to clock-out in time, and user cannot clock-out anymore");
            notifyUser("You cannot clock-out as you missed the window. Please contact Lab Manager");
            //return true;
            return;
        }
    }

    // save clock-in and clock-out time
    $scope.recordWork = function (operation, studentId, id) {
        var confirm = $mdDialog.confirm()
            .title('Timesheet')
            .textContent('Are you sure you want to continue with this operation?')
            .ok('Yes')
            .cancel('No');

        $mdDialog.show(confirm).then(function () {
            var datetime = moment(new Date()).format('MMM DD, YYYY HH:mm');
            var work = {
                operation: operation,
                studentId: studentId,
                datetime: datetime,
                id: id
            };
            console.log('details to record : ', work);
            var promise = RecordWorkService.recordWork(work);
            promise.then(function (result) {
                    if (result.statusCode === 200) {
                        SharedService.showSuccess(result.message);
                        // reload table content
                        getShiftDetailsForClocking();
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
