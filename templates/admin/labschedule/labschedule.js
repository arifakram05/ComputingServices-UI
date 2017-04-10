angular.module('computingServices.managelabschedule', ['ngRoute', 'ui.calendar', 'daterangepicker'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/managelabschedule', {
        templateUrl: 'templates/admin/labschedule/labschedule.html',
        controller: 'managelabschedulectrl'
    });
}])

.controller('managelabschedulectrl', ['$scope', '$http', 'uiCalendarConfig', function ($scope, $http, uiCalendarConfig) {

    $scope.SelectedEvent = {};
    var isFirstTime = true;

    //required for datetimepicker
    $scope.event = {
        startDate: '',
        endDate: ''
    };

    $scope.opts = {
        timePicker: true,
        timePickerIncrement: 15,
        locale: {
            format: 'MMM D, YYYY HH:mm'
        }
    };

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
        }, {
        title: "Data Processing",
        professor: "Chandler Bing",
        start: new Date('2017-03-16T16:00:30Z'),
        end: new Date('2017-03-26T23:30:30Z'),
        allDay: false,
        backgroundColor: 'Red'
        }];
    $scope.eventSources = [$scope.events];

    //configure calendar
    $scope.uiConfig = {
        calendar: {
            height: 800,
            editable: true,
            // display event's start time
            displayEventTime: true,
            //calendar header
            header: {
                left: 'month agendaWeek agendaDay list',
                center: 'title',
                right: 'today prev,next'
            },
            //can select a cell
            selectable: true,
            //highlight cell when selected
            selectHelper: true,
            //enables editing a cell
            editable: true,
            //does not make a cell too tall in case of many event; displays +more link
            //eventLimit: true,
            //event to trigger on selection of a date
            select: function (start, end) {
                //reset
                $scope.SelectedEvent = {};
                $scope.event = null;
                //set new data
                $scope.event = {
                    startDate: moment(start).format('MMM D, YYYY HH:mm'),
                    endDate: moment(end).subtract(1, "days").format('MMM D, YYYY HH:mm')
                };
                //show modal
                $('#las_modal').modal('show');
            },
            //event to trigger when an event on calendar is clicked
            eventClick: function (event) {
                console.log('event selected : ',event);

                $scope.event = {
                    startDate: moment(event.start).format('MMM D, YYYY HH:mm'),
                    endDate: moment(event.end).format('MMM D, YYYY HH:mm')
                };

                $scope.SelectedEvent.title = event.title;
                $scope.SelectedEvent.color = event.backgroundColor;

                //show modal
                $('#las_modal').modal('show');
            },
            eventColor: '#378006'
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

    //create
    $scope.create = function() {
        console.log($scope.SelectedEvent, ' ', $scope.event);
    }

}]);
