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
        start: new Date('April 10, 2017 23:13:00'),
        end: new Date('April 11, 2017 08:00:00'),
        allDay: false
        }, {
        title: "Calculus",
        professor: "Gary Smith",
        start: new Date('April 11, 2017 1491138000000'),
        end: new Date('April 11, 2017 1491674400000'),
        allDay: false
        }, {
        title: "Data Processing",
        professor: "Chandler Bing",
        start: new Date('2017-03-16T16:00:30Z'),
        end: new Date('2017-03-26T23:30:30Z'),
        allDay: false,
        backgroundColor: 'Red'
        }, {
        allDay: false,
        backgroundColor: "Blue",
        end: new Date("Apr 2, 2017 14:00"),
        professor: "Mike Vance",
        start: new Date("Apr 2, 2017 11:00"),
        title: "Unix Systems"
        }, {
        allDay: false,
        backgroundColor: "Pink",
        end: new Date("Apr 16, 2017 20:30"),
        professor: "John Barry",
        start: new Date("Apr 16, 2017 17:15"),
        title: "Adv Algorithms"
        }, {
        allDay: false,
        backgroundColor: "Pink",
        end: new Date("Apr 18, 2017 20:30"),
        professor: "John Barry",
        start: new Date("Apr 18, 2017 17:15"),
        title: "Adv Algorithms",
        }, {
        allDay: false,
        backgroundColor: "Pink",
        end: new Date("Apr 21, 2017 20:30"),
        professor: "John Barry",
        start: new Date("Apr 21, 2017 17:15"),
        title: "Adv Algorithms"
        }, {
        allDay: false,
        backgroundColor: "Red",
        end: new Date("Apr 21, 2017 20:30"),
        professor: "Arif Akram",
        start: new Date("Apr 21, 2017 17:15"),
        title: "Mathematics"
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
                //console.log('day is ',$scope.startDate.getDay());
                //show modal
                $('#las_modal').modal('show');
            },
            //event to trigger when an event on calendar is clicked
            eventClick: function (event) {
                console.log('event selected : ', event);

                $scope.event = {
                    startDate: moment(event.start).format('MMM D, YYYY HH:mm'),
                    endDate: moment(event.end).format('MMM D, YYYY HH:mm')
                };

                $scope.SelectedEvent.title = event.title;
                $scope.SelectedEvent.color = event.backgroundColor;
                $scope.SelectedEvent.professor = event.professor;

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
    $scope.create = function () {
        var eventDates = [];
        //var event = {};

        console.log($scope.SelectedEvent, ' ', $scope.event);

        var selectedDays = [0, 2, 5];//days - eg: Sun - 0, Mon - 1, ...
        var startDate = new Date($scope.event.startDate);
        var endDate = new Date($scope.event.endDate);

        var startHour = startDate.getHours();
        var startMins = startDate.getMinutes();
        if (startMins === 0) {
            startMins = startMins + '0';
        }
        var startTime = startHour + ':' + startMins;

        var endHour = endDate.getHours();
        var endMins = endDate.getMinutes();
        if (endMins === 0) {
            endMins = endMins + '0';
        }
        var endTime = endHour + ':' + endMins;

        //console.log('start time: ',startTime, ' end time: ',endTime);

        for (var day = startDate; day <= endDate;) {
            if (selectedDays.includes(day.getDay())) {
                var event = {};

                //console.log('day is ',day);

                var stDate = moment(day).format('MMM D, YYYY');
                //console.log('stDate is ',stDate);
                event.start = stDate + ' ' + startTime;

                var edDate = moment(day).format('MMM D, YYYY');
                //console.log('edDate is ',edDate);
                event.end = edDate + ' ' + endTime;

                event.title = $scope.SelectedEvent.title;
                event.professor = $scope.SelectedEvent.professor;
                event.backgroundColor = $scope.SelectedEvent.color;
                event.allDay = false;
                //console.log('object to save : ',event);

                eventDates.push(event);
            }
            day.setTime(day.getTime() + 1000 * 60 * 60 * 24);
        }

        console.log('Recorded events: ', eventDates);
    }


}]);
