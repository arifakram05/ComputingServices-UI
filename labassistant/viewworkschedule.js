'use strict';

angular.module('computingServices.viewworkschedule', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/viewworkschedule', {
        templateUrl: 'labassistant/viewworkschedule.html',
        controller: 'VWSCtrl'
    })
}])

.factory('VWSService', ['$http', function ($http) {

    var GET_LA_SHIFT_DETAILS = 'http://127.0.0.1:8080/ComputingServicesApp/admin/saveLabSchedule';

    //define all factory methods
    var factory = {
        getShiftDetails: getShiftDetails
    };

    return factory;

    //fetch the LAs shift details
    function getShiftDetails() {
        var deferred = $q.defer();
        $http({
                method: 'GET_LA_SHIFT_DETAILS',
                url: GET_JOB_APPLICANTS_URI
            })
            .then(
                function success(response) {
                    console.log('LA shift details: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while fetching LA shift details: ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

}])

.controller('VWSCtrl', ['$scope', '$filter', '$mdDialog', 'VWSService', function ($scope, $filter, $mdDialog, VWSService) {

    console.log('fetching LAs work schedule/shift details');

    //remove this after attaching service call, just for dummy data
    $scope.shiftDetails = {
        fullName: "Mohammed, Arif Akram",
        userId: "1643568",
        workSchedule: [{
            shiftDate: "Jan 1, 2016",
            shiftDay: "Monday",
            shiftStartTime: "08:00 AM",
            shiftEndTime: "12:00 PM",
            labName: "Becton Hall",
            campus: "Teneck"
            }, {
            shiftDate: "Jan 2, 2016",
            shiftDay: "Wednesday",
            shiftStartTime: "10:00 AM",
            shiftEndTime: "14:00 PM",
            labName: "Becton Hall",
            campus: "Teneck"
            }, {
            shiftDate: "Jan 5, 2016",
            shiftDay: "Saturday",
            shiftStartTime: "08:00 PM",
            shiftEndTime: "11:00 PM",
            labName: "University Hall",
            campus: "Hackensack"
        }]
    };

    //make server call as soon as page loads with today's date
    var today = $filter('date')(new Date(), 'MMM d, y');
    $scope.shiftDetails.startDate = today;
    displayShiftDetails($scope.shiftDetails);

    function displayShiftDetails(shiftDetails) {
        console.log('making service call: ', shiftDetails);
        /*
        //make service call
        var promise = ManageLabScheduleService.saveLabSchedule(labSchedule);
        promise.then(function (result) {
            console.log('Operation Done.', result);
        });
        notifyUser('You have '+operation+' successfully at '+timeTonotify);
        */
    }

    //monitor date selected and fetch shift details for a custom date
    $scope.$watch('customShiftDetailsForm.$valid', function(rawCustomStartDate) {
        console.log('watching....value received', rawCustomStartDate);
        //if form valid, then make a server call
        if($scope.rawCustomStartDate) {
            console.log('calling server to fetch customer shift details for ', $scope.shiftDetails);
            $scope.isCustomDetailsFetched = true;
        }
    });

}]);
