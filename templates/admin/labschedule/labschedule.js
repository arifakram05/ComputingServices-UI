angular.module('computingServices.managelabschedule', ['ngRoute', 'ui.calendar', 'daterangepicker'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/managelabschedule', {
        templateUrl: 'templates/admin/labschedule/labschedule.html',
        controller: 'managelabschedulectrl'
    });
}])

.controller('managelabschedulectrl', ['$scope', '$http', 'uiCalendarConfig', '$mdDialog', 'SharedService', function ($scope, $http, uiCalendarConfig, $mdDialog, SharedService) {

    $scope.isNewEvent = false;

    $scope.selLab = undefined;

    $scope.items = [{
        name: 'Sun',
        value: 0
        }, {
        name: 'Mon',
        value: 1
    }, {
        name: 'Tue',
        value: 2
    }, {
        name: 'Wed',
        value: 3
    }, {
        name: 'Thu',
        value: 4
    }, {
        name: 'Fri',
        value: 5
    }, {
        name: 'Sat',
        value: 6
    }];
    $scope.selectedDays = [];
    $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
        } else {
            list.push(item);
        }
    };

    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };

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
        allDay: false,
        labName: 'Becton Hall'
        }, {
        title: "Operating Systems",
        professor: "Betty Moore",
        start: new Date('2017-03-26T14:00:30Z'),
        end: new Date('2017-03-26T16:30:30Z'),
        allDay: false,
        labName: 'Dickinson Hall'
        }, {
        title: "Database Systems",
        professor: "Shawn Reynolds",
        start: new Date('2017-03-26T15:00:30Z'),
        end: new Date('2017-03-26T16:30:30Z'),
        allDay: false,
        labName: 'University Hall'
        }, {
        title: 'Economics',
        start: new Date('2017-03-16T10:20:30Z'),
        end: new Date('2017-03-16T15:20:30Z'),
        allDay: false,
        labName: 'Becton Hall'
        }, {
        title: "Computer Architecture 2",
        professor: "Linda Cook",
        start: new Date('2017-03-16T12:00:30Z'),
        end: new Date('2017-03-16T13:30:30Z'),
        allDay: false,
        labName: 'University Hall'
        }, {
        title: "Adv Operating Systems",
        professor: "Betty Moore",
        start: new Date('2017-03-16T14:00:30Z'),
        end: new Date('2017-03-16T16:30:30Z'),
        allDay: false,
        labName: 'Becton Hall'
        }, {
        title: "Adv Database Systems",
        professor: "Shawn Reynolds",
        start: new Date('2017-03-16T15:00:30Z'),
        end: new Date('2017-03-16T16:30:30Z'),
        allDay: false,
        labName: 'Becton Hall'
        }, {
        title: "Operating Systems",
        professor: "Betty Moore",
        start: new Date('April 10, 2017 23:13:00'),
        end: new Date('April 11, 2017 08:00:00'),
        allDay: false,
        labName: 'Vancouver Labs'
        }, {
        title: "Calculus",
        professor: "Gary Smith",
        start: new Date('April 11, 2017 1491138000000'),
        end: new Date('April 11, 2017 1491674400000'),
        allDay: false,
        labName: 'Becton Hall'
        }, {
        title: "Data Processing",
        professor: "Chandler Bing",
        start: new Date('2017-03-16T16:00:30Z'),
        end: new Date('2017-03-26T23:30:30Z'),
        allDay: false,
        backgroundColor: 'Red',
        labName: 'Vancouver Labs'
        }, {
        allDay: false,
        backgroundColor: "Blue",
        end: new Date("Apr 2, 2017 14:00"),
        professor: "Mike Vance",
        start: new Date("Apr 2, 2017 11:00"),
        title: "Unix Systems",
        labName: 'Becton Hall'
        }, {
        allDay: false,
        backgroundColor: "Pink",
        end: new Date("Apr 16, 2017 20:30"),
        professor: "John Barry",
        start: new Date("Apr 16, 2017 17:15"),
        title: "Adv Algorithms",
        labName: 'Becton Hall'
        }, {
        allDay: false,
        backgroundColor: "Pink",
        end: new Date("Apr 18, 2017 20:30"),
        professor: "John Barry",
        start: new Date("Apr 18, 2017 17:15"),
        title: "Adv Algorithms",
        labName: 'Vancouver Labs'
        }, {
        allDay: false,
        backgroundColor: "Pink",
        end: new Date("Apr 21, 2017 20:30"),
        professor: "John Barry",
        start: new Date("Apr 21, 2017 17:15"),
        title: "Adv Algorithms",
        labName: 'Vancouver Labs'
        }, {
        allDay: false,
        backgroundColor: "Red",
        end: new Date("Apr 21, 2017 20:30"),
        professor: "Arif Akram",
        start: new Date("Apr 21, 2017 17:15"),
        title: "Mathematics",
        labName: 'Vancouver Labs'
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
                left: 'title',
                right: 'month,agendaWeek,agendaDay,list prev,today,next'
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
                //creating new event
                $scope.isNewEvent = true;
                //reset selected days
                $scope.selectedDays = [];
                //show modal
                $('#las_modal').modal('show');
            },
            //event to trigger when an event on calendar is clicked
            eventClick: function (event) {
                console.log('event selected : ', event);

                //clicked on existing new event
                $scope.isNewEvent = false;

                $scope.event = {
                    startDate: moment(event.start).format('MMM D, YYYY HH:mm'),
                    endDate: moment(event.end).format('MMM D, YYYY HH:mm')
                };

                $scope.SelectedEvent.title = event.title;
                $scope.SelectedEvent.color = event.backgroundColor;
                $scope.SelectedEvent.professor = event.professor;
                $scope.selLab = event.labName;

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

    //determines whether to enable 'Create' event button
    $scope.shouldEnableButtonForCreate = function () {
        var selectedDays = $scope.selectedDays.map(function (a) {
            return a.value;
        });

        if (Object.keys($scope.SelectedEvent).length !== 3 || Object.keys($scope.event).length !== 2 || selectedDays.length !== 1 || $scope.selLab === '' || $scope.selLab === undefined) {
            return true;
        }
        return false;
    }

    //create an event
    $scope.create = function () {

        var selectedDays = $scope.selectedDays.map(function (a) {
            return a.value;
        });

        var eventDates = [];

        console.log($scope.SelectedEvent, ' ', $scope.event);

        //days - eg: Sun - 0, Mon - 1, ...

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
                event.day = day.getDay();
                event.labName = $scope.selLab;
                //console.log('object to save : ',event);

                eventDates.push(event);
            }
            day.setTime(day.getTime() + 1000 * 60 * 60 * 24);
        }

        console.log('Recorded events: ', eventDates, angular.toJson(eventDates));

        //make a server call to save 'eventDates'

        $scope.clear();
    }

    //clear modal contents
    $scope.clear = function () {
        //reset selected days
        $scope.selectedDays = [];
        //reset selected lab
        $scope.selLab = undefined;
    }

    // checks if given object is empty
    /*$scope.isEmpty = function (object) {
        if (Object.keys(object).length === 0) {
            $scope.isNewEvent = true;
        }
        else {
            $scope.isNewEvent = false;
        }
        return $scope.isNewEvent;
    }*/

    // This data has to be obtained from service call
    $scope.labs = [{
        id: 1,
        campusName: 'Teaneck/Hackensack',
        labName: 'Dickinson Hall'
    }, {
        id: 2,
        campusName: 'Teaneck/Hackensack',
        labName: 'Becton Hall'
    }, {
        id: 3,
        campusName: 'Teaneck/Hackensack',
        labName: 'University Hall'
    }, {
        id: 4,
        campusName: 'Madison',
        labName: 'Vancouver Labs'
    }, {
        id: 5,
        campusName: 'Madison',
        labName: 'Madison Lab 2'
    }, {
        id: 6,
        campusName: 'Canada',
        labName: 'Vancouver Labs'
    }];

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
