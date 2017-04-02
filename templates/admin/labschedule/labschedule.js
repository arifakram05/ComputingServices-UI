angular.module('computingServices.managelabschedule', ['ngRoute', 'ui.calendar'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/managelabschedule', {
        templateUrl: 'templates/admin/labschedule/labschedule.html',
        controller: 'managelabschedulectrl'
    });
}])

    .controller('managelabschedulectrl', ['$scope', '$http', 'uiCalendarConfig', function ($scope, $http, uiCalendarConfig) {

    $scope.SelectedEvent = null;
    var isFirstTime = true;

    $scope.events = [{
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
        }, {
        title: "Operating Systems",
        professor: "Betty Moore",
        start: new Date('2017-03-16T16:00:30Z'),
        end: new Date('2017-03-16T23:30:30Z'),
        allDay: false
        }];
    $scope.eventSources = [$scope.events];

    //configure calendar
    $scope.uiConfig = {
        calendar: {
            height: 800,
            editable: true,
            header: {
                left: 'month agendaWeek agendaDay',
                center: 'title',
                right: 'today prev,next'
            },
            eventClick: function (event) {
                    $scope.SelectedEvent = event;
                }
                /*,
                            eventAfterAllRender: function () {
                                if ($scope.events.length > 0 && isFirstTime) {
                                    //Focus first event
                                    uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', $scope.events[0].start);
                                    isFirstTime = false;
                                }
                            }*/
        }
    };

            }]);
