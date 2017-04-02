'use strict';

angular.module('computingServices.labSchedule', ['ngRoute', 'material.components.eventCalendar'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/labSchedule', {
        templateUrl: 'templates/general/labschedule/labschedule.html',
        controller: 'labScheduleCtrl'
    })
}])

    .controller('labScheduleCtrl', ['$scope', '$filter', '$timeout', 'SharedService', '$injector', function ($scope, $filter, $timeout, SharedService, $injector) {
    /*$http.get('json/templates.json').success(function(data){
        $scope.templates = data;
    });*/

    // This is necessary in order to properly fit the events of a day inside a cell
    $timeout(function () {
        angular.element(window).triggerHandler('resize');
    });

    console.log('lab schedule ' + $scope);

    $scope.events = [{
        title: 'Event Title',
        start: new Date('2017-03-26T10:20:30Z'),
        end: new Date('2017-03-26T15:20:30Z'),
        allDay: false
    }, {
        title: "Computer Architecture",
        professor: "Linda Cook",
        start: new Date('2017-03-26T12:00:30Z'),
        end: new Date('2017-03-26T13:30:30Z'),
        allDay: false
    }, {
        title: "Operating Systems",
        professor: "Betty Moore",
        start: new Date('2017-03-26T14:00:30Z'),
        end: new Date('2017-03-26T16:30:30Z'),
        allDay: false
    }, {
        title: "Database Systems",
        professor: "Shawn Reynolds",
        start: new Date('2017-03-26T15:00:30Z'),
        end: new Date('2017-03-26T16:30:30Z'),
        allDay: false
    }, {
        title: 'Economics',
        start: new Date('2017-03-16T10:20:30Z'),
        end: new Date('2017-03-16T15:20:30Z'),
        allDay: false
    }, {
        title: "Computer Architecture 2",
        professor: "Linda Cook",
        start: new Date('2017-03-16T12:00:30Z'),
        end: new Date('2017-03-16T13:30:30Z'),
        allDay: false
    }, {
        title: "Adv Operating Systems",
        professor: "Betty Moore",
        start: new Date('2017-03-16T14:00:30Z'),
        end: new Date('2017-03-16T16:30:30Z'),
        allDay: false
    }, {
        title: "Adv Database Systems",
        professor: "Shawn Reynolds",
        start: new Date('2017-03-16T15:00:30Z'),
        end: new Date('2017-03-16T16:30:30Z'),
        allDay: false
    }]

    $scope.eventClicked = function ($selectedEvent) {
        console.log('selected: ', $selectedEvent);
    }

    $scope.createEvent = function (date) {
        console.log('creating event on ', date);
    }

}]);
