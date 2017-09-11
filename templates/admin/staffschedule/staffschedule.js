angular.module('computingServices.manageStaffSchedule', ['ngRoute', 'ui.calendar', 'daterangepicker', 'ngSanitize', 'ui.select'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/manageStaffSchedule', {
        templateUrl: 'templates/admin/staffschedule/staffschedule.html',
        controller: 'manageStaffScheduleCtrl'
    });
    }])

.factory('ManageStaffScheduleService', ['$http', '$q', function ($http, $q) {

    var GET_LAB_SCHEDULE_URI = constants.url + 'staff-schedule/fetch';
    var SAVE_LAB_SCHEDULE_URI = constants.url + 'staff-schedule/save';
    var UPDATE_LAB_SCHEDULE_URI = constants.url + 'staff-schedule/update';
    var DELETE_LAB_SCHEDULE_URI = constants.url + 'staff-schedule/delete';
    var UPDATE_ALL_LAB_SCHEDULE_URI = constants.url + 'staff-schedule/update-all';
    var DELETE_ALL_LAB_SCHEDULE_URI = constants.url + 'staff-schedule/delete-all';

    //define all factory methods
    var factory = {
        getLabSchedule: getLabSchedule,
        saveLabSchedule: saveLabSchedule,
        updateLabSchedule: updateLabSchedule,
        deleteLabSchedule: deleteLabSchedule,
        updateAllEvents: updateAllEvents,
        deleteAllEvents: deleteAllEvents
    };

    return factory;

    //fetch all events
    function getLabSchedule() {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: GET_LAB_SCHEDULE_URI
        }).then(
            function success(response) {
                console.log('lab schedule from web service: ', response.data);
                deferred.resolve(response.data);
            },
            function error(errResponse) {
                console.error('Error while making service call to fetch lab schedule ', errResponse);
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }

    //create new event
    function saveLabSchedule(schedule) {
        console.log('schedule to save : ', schedule);
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: SAVE_LAB_SCHEDULE_URI,
            headers: {
                'Content-Type': undefined
            },
            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("staffschedule", angular.toJson(schedule));
                return formData;
            }
        }).success(function (data, status, headers, config) {
            console.log('Saved schedule: ', data);
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            console.log('Failed to save the schedule: ', status);
            deferred.reject(data);
        });

        return deferred.promise;
    }

    //update existing event
    function updateLabSchedule(schedule) {
        console.log('schedule details to update : ', schedule);
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: UPDATE_LAB_SCHEDULE_URI,
            headers: {
                'Content-Type': undefined
            },
            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("staffschedule", angular.toJson(schedule));
                return formData;
            }
        }).success(function (data, status, headers, config) {
            console.log('Updated schedule: ', data);
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            console.log('Failed to update the schedule: ', status);
            deferred.reject(data);
        });

        return deferred.promise;
    }

    //delete existing event
    function deleteLabSchedule(eventId) {
        var deferred = $q.defer();

        $http({
                method: 'DELETE',
                url: DELETE_LAB_SCHEDULE_URI,
                params: {
                    eventId: eventId
                }
            })
            .then(
                function success(response) {
                    console.log('schedule deleted ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while deleting schedule ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

    //update all events
    function updateAllEvents(schedule) {
        console.log('all schedule details to update : ', schedule);
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: UPDATE_ALL_LAB_SCHEDULE_URI,
            headers: {
                'Content-Type': undefined
            },
            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("staffschedule", angular.toJson(schedule));
                return formData;
            }
        }).success(function (data, status, headers, config) {
            console.log('Updated schedule: ', data);
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            console.log('Failed to update the schedule: ', status);
            deferred.reject(data);
        });

        return deferred.promise;
    }

    //delete all events
    function deleteAllEvents(groupId) {
        var deferred = $q.defer();

        $http({
                method: 'DELETE',
                url: DELETE_ALL_LAB_SCHEDULE_URI,
                params: {
                    groupId: groupId
                }
            })
            .then(
                function success(response) {
                    console.log('schedule deleted ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while deleting schedule ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

    }])

.controller('manageStaffScheduleCtrl', ['$scope', '$http', 'uiCalendarConfig', '$mdDialog', 'SharedService', 'ManageStaffScheduleService', '$location', function ($scope, $http, uiCalendarConfig, $mdDialog, SharedService, ManageStaffScheduleService, $location) {

    // to search for a student/Lab Assistant
    $scope.search = function (searchText) {
        console.log('searching for ... ', searchText);
        var promise = SharedService.searchUsers(searchText);
        promise.then(function (result) {
                console.log('got the result from searching users :', result);
                if (result.statusCode === 200) {
                    $scope.users = result.response;
                } else {
                    SharedService.showError('Failed to retreive users');
                }

            })
            .catch(function (resError) {
                console.log('search for users failed :: ', resError);
                //show failure message to the user
                SharedService.showError('Error ocurred while searching for users');
            });
    }

    $scope.colors = [
        'black', 'blueviolet', 'brown', 'darkslateblue', 'lightcoral', 'red', 'steelblue', 'burlywood', 'cadetblue', 'chocolate', 'coral', 'dimgrey', 'olive', 'seagreen', 'teal', 'crimson', 'darkcyan', 'green', 'firebrick', 'purple', 'sienna'
    ];

    $scope.isNewEvent = false;

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
        timePickerIncrement: 1,
        locale: {
            format: 'MMM D, YYYY h:mm A'
        }
    };

    // get lab schedule
    getLabSchedule();

    function getLabSchedule() {
        // create events object
        $scope.events1 = [];
        console.log('making a server call to get lab schedule');
        var promise = ManageStaffScheduleService.getLabSchedule();
        promise.then(function (result) {
            var events = result.response;
            console.log('all events fetched :', events);
            //process event and the display
            angular.forEach(events, function (event) {
                event.start = new Date(event.start);
                event.end = new Date(event.end);
                event.stick = true;
                $scope.events1.push(event);
            });
            $('#calendar').fullCalendar('removeEvents');
            $('#calendar').fullCalendar('addEventSource', $scope.events1);
            //reset filters
            $scope.filteredLabs = undefined;
        });
    }

    /*$scope.events2 = [{
    title: "Linda Cook",
    studentId: "987325",
    start: new Date('2017-03-26T12:00:30Z'),
    end: new Date('2017-03-26T13:30:30Z'),
    allDay: false,
    labName: 'Becton Hall',
    _id: '456789',
    groupId: '3298724362'
    }, {
    title: "Betty Moore",
    studentId: "904208",
    start: new Date('2017-03-26T14:00:30Z'),
    end: new Date('2017-03-26T16:30:30Z'),
    allDay: false,
    labName: 'Dickinson Hall',
    _id: '456789',
    groupId: null
    }, {
    title: "Shawn Reynolds",
    studentId: "287222",
    start: new Date('2017-03-26T15:00:30Z'),
    end: new Date('2017-03-26T16:30:30Z'),
    allDay: false,
    labName: 'University Hall',
    _id: '456789',
    groupId: '3298724362'
    }, {
    title: 'AB Devilliers',
    studentId: "972525"
    start: new Date('2017-03-16T10:20:30Z'),
    end: new Date('2017-03-16T15:20:30Z'),
    allDay: false,
    labName: 'Becton Hall',
    _id: '456789',
    groupId: '3298724362'
    }, {
    title: "Linda Cook",
    studentId: "32523",
    start: new Date('2017-03-16T12:00:30Z'),
    end: new Date('2017-03-16T13:30:30Z'),
    allDay: false,
    labName: 'University Hall',
    _id: '456789',
    groupId: '3298724362'
    }, {
    title: "Adv Operating Systems",
    studentId: "Betty Moore",
    start: new Date('2017-03-16T14:00:30Z'),
    end: new Date('2017-03-16T16:30:30Z'),
    allDay: false,
    labName: 'Becton Hall',
    _id: '456789',
    groupId: '3298724362'
    }, {
    title: "Adv Database Systems",
    studentId: "Shawn Reynolds",
    start: new Date('2017-03-16T15:00:30Z'),
    end: new Date('2017-03-16T16:30:30Z'),
    allDay: false,
    labName: 'Becton Hall',
    _id: '456789',
    groupId: '3298724362'
    }, {
    title: "Operating Systems",
    studentId: "Betty Moore",
    start: new Date('April 10, 2017 23:13:00'),
    end: new Date('April 11, 2017 08:00:00'),
    allDay: false,
    labName: 'Vancouver Labs',
    _id: '456789',
    groupId: '3298724362'
    }, {
    title: "Calculus",
    studentId: "Gary Smith",
    start: new Date('April 11, 2017 15:00'),
    end: new Date('April 11, 2017 18:30'),
    allDay: false,
    labName: 'Becton Hall',
    _id: '456789',
    groupId: '3298724362'
    }, {
    title: "Chandler Bing",
    studentId: "727883",
    start: new Date('2017-03-16T16:00:30Z'),
    end: new Date('2017-03-26T23:30:30Z'),
    allDay: false,
    backgroundColor: 'Red',
    labName: 'Vancouver Labs',
    _id: '456789',
    groupId: '3298724362'
    }, {
    allDay: false,
    backgroundColor: "Blue",
    end: new Date("Apr 2, 2017 14:00"),
    studentId: "9833",
    start: new Date("Apr 2, 2017 11:00"),
    title: "Mike Vance",
    labName: 'Becton Hall',
    _id: '456789',
    groupId: '3298724362'
    }, {
    allDay: false,
    backgroundColor: "Pink",
    end: new Date("Apr 16, 2017 20:30"),
    studentId: "436247",
    start: new Date("Apr 16, 2017 17:15"),
    title: "John Barry",
    labName: 'Becton Hall',
    _id: '456789',
    groupId: '3298724362'
    }, {
    allDay: false,
    backgroundColor: "Pink",
    end: new Date("Apr 18, 2017 20:30"),
    studentId: "14145",
    start: new Date("Apr 18, 2017 17:15"),
    title: "John Barry",
    labName: 'Vancouver Labs',
    _id: '456789',
    groupId: '3298724362'
    }, {
    allDay: false,
    backgroundColor: "Pink",
    end: new Date("Apr 21, 2017 20:30"),
    studentId: "975352",
    start: new Date("Apr 21, 2017 17:15"),
    title: "John Barry",
    labName: 'Vancouver Labs',
    _id: '456789',
    groupId: '3298724362'
    }, {
    allDay: false,
    backgroundColor: "Red",
    end: new Date("Apr 21, 2017 20:30"),
    studentId: "468415",
    start: new Date("Apr 21, 2017 17:15"),
    title: "Arif Akram",
    labName: 'Vancouver Labs',
    _id: '456789',
    groupId: '3298724362'
    }];*/
    $scope.eventSources = [];

    //configure calendar
    $scope.uiConfig = {
        calendar: {
            height: 800,
            editable: true,
            // disable event drag and drop
            eventStartEditable: false,
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
                    startDate: moment(start).format('MMM DD, YYYY HH:mm'),
                    endDate: moment(end).subtract(1, "days").format('MMM DD, YYYY HH:mm')
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
                    startDate: moment(event.start).format('MMM DD, YYYY HH:mm'),
                    endDate: moment(event.end).format('MMM DD, YYYY HH:mm')
                };

                $scope.SelectedEvent.title = event.title;
                $scope.SelectedEvent.color = event.backgroundColor;
                $scope.SelectedEvent.studentId = event.studentId;
                $scope.SelectedEvent.labName = event.labName;
                $scope._id = event._id;
                $scope.SelectedEvent._id = event._id;
                $scope.SelectedEvent.groupId = event.groupId;

                //show modal
                $('#las_modal').modal('show');
            },
            eventColor: '#378006',
            eventMouseover: function (event, jsEvent, view) {
                var startTime = moment(event.start).format('h:mm A');
                var endTime = moment(event.end).format('h:mm A');

                var shiftStartDateTime = constructDateTime(new Date(event.date), moment(event.start).format('H:mm'));
                var shiftEndDateTime = constructDateTime(new Date(event.date), moment(event.end).format('H:mm'));
                var shiftDuration = calculateHours(shiftStartDateTime, shiftEndDateTime);

                var tooltip = '<div class="tooltiptopicevent" style="width:auto;height:auto;background:rgb(16,108,200);color:#fff;position:absolute;z-index:10001;padding: 5px; line-height: 150%;border-top-right-radius: 15px;border-bottom-left-radius: 15px;">' + startTime + ' - ' + endTime + '</br>' + event.title + '</br>' + event.studentId + '</br>' + event.labName + '</br>' + shiftDuration + '</br>' + '</div>';
                $("body").append(tooltip);
                $(this).mouseover(function (e) {
                    $(this).css('z-index', 10000);
                    $('.tooltiptopicevent').fadeIn('500');
                    $('.tooltiptopicevent').fadeTo('10', 1.9);
                }).mousemove(function (e) {
                    $('.tooltiptopicevent').css('top', e.pageY + 10);
                    $('.tooltiptopicevent').css('left', e.pageX + 20);
                });
            },
            eventMouseout: function (data, event, view) {
                $(this).css('z-index', 8);
                $('.tooltiptopicevent').remove();
            }
        }
    };

    // given date as Date object and time as string, construct date object with time
    function constructDateTime(date, time) {
        var timeTokens = time.split(':');
        date.setHours(timeTokens[0]);
        date.setMinutes(timeTokens[1]);
        return date;
    }

    // given a start and end date and time object, calculate the difference in terms of hours:minutes
    function calculateHours(start, end) {
        var timeStart = start.getTime();
        var timeEnd = end.getTime();
        var msDiff = timeEnd - timeStart; //in milliseconds
        var secDiff = msDiff / 1000; //in seconds
        var minDiff = msDiff / 60 / 1000; //in minutes
        var hDiff = msDiff / 3600 / 1000; //in hours
        var humanReadable = {};
        humanReadable.hours = Math.floor(hDiff);
        humanReadable.minutes = minDiff - 60 * humanReadable.hours;
        if (humanReadable.minutes == 0) {
            return humanReadable.hours + ':' + humanReadable.minutes + '0' + ' hours';
        } else {
            return humanReadable.hours + ':' + humanReadable.minutes + ' hours';
        }
    }

    //determines whether to enable 'Create' event button
    $scope.shouldEnableButtonForCreate = function () {
        var selectedDays = $scope.selectedDays.map(function (a) {
            return a.value;
        });
        if (Object.keys($scope.event).length !== 2 || selectedDays.length < 1 || Object.keys($scope.SelectedEvent).length != 3) {
            return true;
        }
        return false;
    }

    //create an event
    $scope.create = function () {

        console.log("clicked on create event button");

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
        if (startMins < 10) {
            startMins = '0' + startMins;
        }
        if (startHour < 10) {
            startHour = '0' + startHour;
        }
        var startTime = startHour + ':' + startMins;

        var endHour = endDate.getHours();
        var endMins = endDate.getMinutes();
        if (endMins < 10) {
            endMins = '0' + endMins;
        }
        if (endHour < 10) {
            endHour = '0' + endHour;
        }
        var endTime = endHour + ':' + endMins;

        for (var day = startDate; day <= endDate;) {
            if (selectedDays.includes(day.getDay())) {

                var event = {};

                event.title = $scope.SelectedEvent.user.firstName + ' ' + $scope.SelectedEvent.user.lastName; // title is lab assistant's name
                event.studentId = $scope.SelectedEvent.user.userId;
                event.backgroundColor = $scope.SelectedEvent.color;
                event.allDay = false;
                event.day = day.getDay();
                event.labName = $scope.SelectedEvent.labName;

                var date = moment(day).format('MMM DD, YYYY');
                event.start = date + ' ' + startTime;
                event.end = date + ' ' + endTime;
                event.date = date;

                eventDates.push(event);
            }
            day.setTime(day.getTime() + 1000 * 60 * 60 * 24);
        }

        // do not submit until there is a valid day selected
        if (eventDates == null || eventDates.length === 0) {
            return;
        }

        console.log('Recorded events to save: ', eventDates);

        //make a server call to save 'eventDates'
        var promise = ManageStaffScheduleService.saveLabSchedule(eventDates);
        promise.then(function (result) {
                if (result.statusCode === 200) {
                    SharedService.showSuccess(result.message);
                    //clear modal contents
                    $scope.clear();
                    //clear existing claendar
                    //angular.element('.calendar').fullCalendar('removeEventSource', $scope.eventSources);
                    // reload calendar
                    getLabSchedule();
                    return;
                } else {
                    SharedService.showError(result.message);
                }
            })
            .catch(function (resError) {
                console.log('SAVE SCHEDULE CALL FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to save the lab schedule');
            });
    }

    //update an event
    $scope.update = function () {
        var event = {};

        event.title = $scope.SelectedEvent.title;
        event.studentId = $scope.SelectedEvent.studentId;
        event.backgroundColor = $scope.SelectedEvent.color;
        event.allDay = false;
        event.labName = $scope.SelectedEvent.labName;
        event._id = $scope.SelectedEvent._id;
        event.groupId = $scope.SelectedEvent.groupId;
        event.start = calculateStartDateTime();
        event.end = calculateEndDateTime();

        console.log('Record to update: ', event);

        //call service method to update event
        var promise = ManageStaffScheduleService.updateLabSchedule(event);
        promise.then(function (result) {
                if (result.statusCode === 200) {
                    SharedService.showSuccess(result.message);
                    //clear modal contents
                    $scope.clear();
                    // reload calendar
                    getLabSchedule();
                } else {
                    SharedService.showError(result.message);
                }
            })
            .catch(function (resError) {
                console.log('UPDATE CALL FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to update the lab schedule');
            });
    }

    //calculate start date and time
    function calculateStartDateTime() {
        var startDate = new Date($scope.event.startDate);

        var startHour = startDate.getHours();
        var startMins = startDate.getMinutes();
        if (startMins < 10) {
            startMins = '0' + startMins;
        }
        if (startHour < 10) {
            startHour = '0' + startHour;
        }
        var startTime = startHour + ':' + startMins;

        var stDate = moment(startDate).format('MMM DD, YYYY');

        return stDate + ' ' + startTime;
    }

    //calculate end date and time
    function calculateEndDateTime() {
        var endDate = new Date($scope.event.endDate);

        var endHour = endDate.getHours();
        var endMins = endDate.getMinutes();
        if (endMins < 10) {
            endMins = '0' + endMins;
        }
        if (endHour < 10) {
            endHour = '0' + endHour;
        }
        var endTime = endHour + ':' + endMins;

        var edDate = moment(endDate).format('MMM DD, YYYY');

        return edDate + ' ' + endTime;
    }

    //update all related events
    $scope.updateAll = function () {
        var event = {};

        event.title = $scope.SelectedEvent.title;
        event.studentId = $scope.SelectedEvent.studentId;
        event.backgroundColor = $scope.SelectedEvent.color;
        event.allDay = false;
        event.labName = $scope.SelectedEvent.labName;
        event.groupId = $scope.SelectedEvent.groupId;
        event.start = calculateStartDateTime();
        event.end = calculateEndDateTime();

        console.log('Record to update: ', event);

        //call service method to update event
        var promise = ManageStaffScheduleService.updateAllEvents(event);
        promise.then(function (result) {
                if (result.statusCode === 200) {
                    SharedService.showSuccess(result.message);
                    //clear modal contents
                    $scope.clear();
                    // reload calendar
                    getLabSchedule();
                } else {
                    SharedService.showError(result.message);
                }
            })
            .catch(function (resError) {
                console.log('UPDATE CALL FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to update the lab schedule');
            });
    }

    //delete an event
    $scope.delete = function () {

        console.log('Deleting - ', $scope.SelectedEvent._id);
        var promise = ManageStaffScheduleService.deleteLabSchedule($scope.SelectedEvent._id);
        promise.then(function (result) {
                if (result.statusCode === 200) {
                    SharedService.showSuccess(result.message);
                    //clear modal contents
                    $scope.clear();
                    // reload calendar
                    getLabSchedule();
                    return;
                } else {
                    SharedService.showError(result.message);
                }
            })
            .catch(function (resError) {
                console.log('DELETE CALL FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to delete the event');
            });
    }

    //delete all related events
    $scope.deleteAll = function () {

        console.log('Deleting - ', $scope.SelectedEvent.groupId);
        var promise = ManageStaffScheduleService.deleteAllEvents($scope.SelectedEvent.groupId);
        promise.then(function (result) {
                if (result.statusCode === 200) {
                    SharedService.showSuccess(result.message);
                    //clear modal contents
                    $scope.clear();
                    // reload calendar
                    getLabSchedule();
                    return;
                } else {
                    SharedService.showError(result.message);
                }
            })
            .catch(function (resError) {
                console.log('DELETE ALL CALL FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Failed to delete all occurrences of the event');
            });
    }

    //clear modal contents
    $scope.clear = function () {
        //reset selected days
        $scope.selectedDays = [];
    }

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
        labName: 'Vancouver Labs Madison'
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

    //filter events on calendar
    $scope.filter = function (lab) {
        console.log('filtering events of lab - ', lab);

        // firstly, remove all events from the calendar as this is the only way to make the events marked as stick disappear
        $('#calendar').fullCalendar('removeEvents');

        if (lab) {
            var updatedEvents = [];
            angular.forEach($scope.events1, function (event) {
                if (lab.indexOf(event.labName) !== -1) {
                    event.start = new Date(event.start);
                    event.end = new Date(event.end);
                    event.stick = true;
                    updatedEvents.push(event);
                }
            });
            console.log('updated events with the filter - ', updatedEvents);
            // secondly, add the filtered events to the calendar
            $('#calendar').fullCalendar('addEventSource', updatedEvents);
        } else {
            $('#calendar').fullCalendar('addEventSource', $scope.events1);
        }
        $('#calendar').fullCalendar('refetchEvents');
    }

    //watch filter and update calendar
    $scope.$watch('filteredLabs', function (filteredLabs) {
        console.log('filteredLabs - ', filteredLabs);
        if (filteredLabs && filteredLabs.length > 0) {
            console.log('filter applied - ', filteredLabs);
            $scope.filter(filteredLabs);
        } else {
            $scope.filter(null);
        }
    });

    //related to filter
    $scope.searchTerm;
    $scope.clearSearchTerm = function () {
        $scope.searchTerm = '';
    };
    $scope.onSearchChange = function ($event) {
        $event.stopPropagation();
    }

    }]);
