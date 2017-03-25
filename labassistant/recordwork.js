'use strict';

angular.module('computingServices.recordwork', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/recordwork', {
        templateUrl: 'labassistant/recordwork.html',
        controller: 'RecordWorkCtrl'
    })
    }])

.factory('RecordWorkService', ['$http', function ($http) {

    var CLOCK_IN_CLOCK_OUT = constants.url + 'admin/saveLabSchedule';

    //define all factory methods
    var factory = {
        recordWork: recordWork
    };

    return factory;

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

.controller('RecordWorkCtrl', ['$scope', '$filter', '$mdDialog', function ($scope, $filter, $mdDialog) {

    console.log('record work page for lab assistant');

    $scope.recordWork = function (operation) {

        var datetime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm');
        var timeTonotify = $filter('date')(new Date(), 'HH:mm');

        var labasst = {
            operation: operation,
            labAssistantId: 123456,
            datetimeClocked: datetime
        };

        console.log('details to record : ',labasst);

        /*if(operation === 'clockedin' || operation === 'clockedout') {
            //make service call
            var promise = ManageLabScheduleService.saveLabSchedule(labSchedule);
            promise.then(function (result) {
                console.log('Operation Done.', result);
            });
            notifyUser('You have '+operation+' successfully at '+timeTonotify);
        }*/
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
