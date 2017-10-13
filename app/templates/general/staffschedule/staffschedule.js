'use strict';

angular.module('computingServices.staffSchedule', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/staffSchedule', {
        templateUrl: 'general/staffschedule/staffschedule.html',
        controller: 'staffScheduleCtrl'
    })
}])

.controller('staffScheduleCtrl', ['$scope', function ($scope) {
    /*$http.get('json/templates.json').success(function(data){
        $scope.templates = data;
    });*/
    console.log('staff schedule ' + $scope);
}]);
