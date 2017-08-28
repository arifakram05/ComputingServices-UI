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

    .controller('RecordWorkCtrl', ['$scope', '$filter', '$mdDialog', 'RecordWorkService', 'SharedService', function ($scope, $filter, $mdDialog, RecordWorkService, SharedService) {

    console.log('record work page for lab assistant');

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
