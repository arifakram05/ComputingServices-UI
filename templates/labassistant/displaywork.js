'use strict';

angular.module('computingServices.displaywork', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/displaywork', {
        templateUrl: 'templates/labassistant/displaywork.html',
        controller: 'DisplayWorkCtrl'
    })
}])

.factory('DisplayWorkCtrlService', ['$http', function ($http) {

    var GET_LA_WORK_HOURS = constants.url + 'admin/saveLabSchedule';

    //define all factory methods
    var factory = {
        displayWork: displayWork
    };

    return factory;

    //fetch the LAs work hours between two given dates
    function displayWork(labasst) {
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

.controller('DisplayWorkCtrl', ['$scope', '$filter', '$mdDialog', function ($scope, $filter, $mdDialog) {

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
        },{
            clockedInDate: "Jan 2,2016",
            clockedOutDate: "Jan 2,2016",
            clockedInTime: "08:00 AM",
            clockedOutTime: "12:00 PM",
            total: 4
        },{
            clockedInDate: "Jan 3,2016",
            clockedOutDate: "Jan 2,2016",
            clockedInTime: "08:00 AM",
            clockedOutTime: "12:00 PM",
            total: 4
        }]
    };

    //monitor for form validity
    $scope.$watch('showLAWork.$valid', function(rawStartDate, rawEndDate) {
        //if form valid, then make a server call
        if($scope.rawStartDate && $scope.rawEndDate) {
            console.log('calling server to fetch details for ',$scope.labAsst);
            //displayWork($scope.labAsst);
            $scope.isDataFetched = true;
        }
    });

    function displayWork(labAsst) {

        console.log('making service call: ', labasst);

        /*
        //make service call
        var promise = ManageLabScheduleService.saveLabSchedule(labSchedule);
        promise.then(function (result) {
            console.log('Operation Done.', result);
        });
        notifyUser('You have '+operation+' successfully at '+timeTonotify);
        */
    }

    $scope.print = function(divName) {
        if($scope.labAsstDetails) {
            console.log('printing....');
            var printContents = document.getElementById(divName).innerHTML;
            var popupWin = window.open('','_blank','width=400,height=400');
            popupWin.document.open();
            popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="app.css"/></head><body onload="window.print()">'+ printContents + '</body></html>');
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
