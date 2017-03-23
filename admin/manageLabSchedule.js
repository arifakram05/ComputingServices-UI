'use strict';

angular.module('computingServices.manageLabSchedule', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/manageLabSchedule', {
        templateUrl: 'admin/manageLabSchedule.html',
        controller: 'ManageLabScheduleCtrl'
    });

}])

.factory('ManageLabScheduleService', ['$http', '$q', '$mdDialog', function ($http, $q, $mdDialog) {

    var SAVE_LAB_SCHEDULE = 'http://127.0.0.1:8080/ComputingServicesApp/admin/saveLabSchedule';
    var DELETE_LAB_SCHEDULE_URI = 'http://127.0.0.1:8080/ComputingServicesApp/admin/deleteLabSchedule?';
    var DELETE_ALL_LAB_SCHEDULE_URI = 'http://127.0.0.1:8080/ComputingServicesApp/services/deleteAllLabSchedules?';

    //define all factory methods
    var factory = {
        saveLabSchedule: saveLabSchedule,
        fetchLabScheduleForEdit: fetchLabScheduleForEdit,
        deleteStaffSchedule: deleteStaffSchedule,
        deleteStaffSchedule_All: deleteStaffSchedule_All
    };

    return factory;

    //save given lab schedule
    function saveLabSchedule(schedule) {
        var deferred = $q.defer();

        $http.post(SAVE_LAB_SCHEDULE, JSON.stringify(schedule))
            .success(
                function (data, status, headers, config) {
                    console.log('Save operation success', data);
                    deferred.resolve(data);
                })
            .error(
                function (data, status, header, config) {
                    console.log('Save operation failed ', status);
                    deferred.reject(data);
                });
        return deferred.promise;
    }

    //get lab details and display in edit panel
    function fetchLabScheduleForEdit() {

        return $http({
            method: "GET",
            url: "json/labschedule.json"
        }).then(function (result) {
            return result.data;
        });
    }

    //delete single lab schedule
    function deleteStaffSchedule(scheduleId) {
        var deferred = $q.defer();

        var data = $.param({
            scheduleId: scheduleId
        });

        $http.delete(DELETE_LAB_SCHEDULE_URI + data)
            .success(
                function (response) {
                    console.log('record deleted successfully ', response);
                    deferred.resolve(response.data);
                })
            .error(function (resError) {
                console.log('error with service call while deleting ', resError);
                deferred.reject(resError);
            });
        return deferred.promise;
    }

    //delete all related lab schedules
    function deleteStaffSchedule_All(scheduleId) {
        var deferred = $q.defer();

        var data = $.param({
            scheduleId: scheduleId
        });

        $http.delete(DELETE_ALL_LAB_SCHEDULE_URI + data)
            .success(
                function (response) {
                    console.log('record deleted successfully ', response);
                    deferred.resolve(response.data);
                })
            .error(function (resError) {
                console.log('error with service call while deleting ', resError);
                deferred.reject(resError);
            });
        return deferred.promise;
    }

}])

.controller('ManageLabScheduleCtrl', ['$scope', 'ManageLabScheduleService', '$filter', '$mdDialog', function ($scope, ManageLabScheduleService, $filter, $mdDialog) {

    $scope.labSchedule = undefined;

    $scope.items = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    $scope.selected = [];
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

    $scope.create_ls_save = function (labSchedule) {
        if ($scope.create_ls_form.$valid) {

            $scope.create_ls_form.$setSubmitted();

            labSchedule.campus = $scope.create_ls_selectedCampusName.id;
            labSchedule.lab = $scope.create_ls_selectedLabName.id;
            console.log('data to be saved is ', labSchedule);

            //make service call
            var promise = ManageLabScheduleService.saveLabSchedule(labSchedule);
            promise.then(function (result) {
                console.log('Scheduled saved.', result);
                notifyUser('Lab Schedule has been saved successfully.');
            }).catch(function (resError) {
                notifyUser('Error occurred while saving lab schedule.');
            });

            //clear fields
            $scope.create_ls_clearValue();

        } else {

            $mdDialog.show(
                $mdDialog.alert()
                .clickOutsideToClose(true)
                .textContent('Cannot submit yet! Please fill all the required fields.')
                .ok('Got it!')
            );

            return;
        }
    }

    //clear form
    $scope.create_ls_clearValue = function () {
        $scope.create_ls_rawStartDate = undefined;
        $scope.create_ls_rawEndDate = undefined;
        $scope.create_ls_rawStartTime = undefined;
        $scope.create_ls_rawEndTime = undefined;
        $scope.labSchedule = undefined;
        $scope.create_ls_selectedCampusName = undefined;
        $scope.create_ls_selectedLabName = undefined;
        $scope.selected = [];
        $scope.create_ls_form.$setPristine();
        $scope.create_ls_form.$setUntouched();
    };

    //Create items end
    //View items begin

    //URI call for this
    $scope.view_ls_labSchedule = [{
        "labName": "Becton",
        "schedule": [{
            "subject": "Arif",
            "profName": "Akram",
            "startTime": "08:00",
            "endTime": "12:00",
            "scheduleId": "1643568",
            "endDate": "Jan 23, 2017",
            "campus": "Teaneck/Hackensack",
            "labName": "Becton",
            "days": [
                "Monday", "Wednesday"
            ]
        }, {
            "subject": "Lance",
            "profName": "Klusener",
            "startTime": "18:00",
            "endTime": "23:00",
            "scheduleId": "1656318",
            "endDate": "Jan 23, 2017",
            "campus": "Teaneck/Hackensack",
            "labName": "Becton",
            "days": [
                "Monday"
            ]
        }]
    }, {
        "labName": "University",
        "schedule": [{
            "subject": "Jacques",
            "profName": "Kallis",
            "startTime": "10:00",
            "endTime": "14:00",
            "scheduleId": "3143538",
            "endDate": "Jan 23, 2017",
            "campus": "Teaneck/Hackensack",
            "labName": "University",
            "days": [
                "Monday", "Wednesday", "Friday"
            ]
        }, {
            "subject": "Ricky",
            "profName": "Ponting",
            "startTime": "11:00",
            "endTime": "20:00",
            "scheduleId": "19868568",
            "endDate": "Jan 23, 2017",
            "campus": "Teaneck/Hackensack",
            "labName": "University",
            "days": [
                "Wednesday"
            ]
        }]
    }, {
        "labName": "Vancuover",
        "schedule": [{
            "subject": "MS",
            "profName": "Dhoni",
            "startTime": "11:00",
            "endTime": "15:00",
            "scheduleId": "986424",
            "endDate": "Jan 23, 2017",
            "campus": "Canada",
            "labName": "Vancuover",
            "days": [
                "Monday", "Friday"
            ]
        }, {
            "subject": "Mark",
            "profName": "Waugh",
            "startTime": "09:00",
            "endTime": "15:00",
            "scheduleId": "359238759",
            "endDate": "Jan 23, 2017",
            "campus": "Canada",
            "labName": "Vancuover",
            "days": [
                "Sunday"
            ]
        }]
    }];

    //monitor date selected and fetch shift details for a custom date
    $scope.$watch('view_ls_rawSelectedDate', function (view_ls_rawSelectedDate) {
        if ($scope.view_ls_searchByLA) {
            console.log('when refined results is in place, cannot call server');
        } else {
            $scope.view_ls_selectedDate = $filter('date')($scope.view_ls_rawSelectedDate, 'mediumDate');
            console.log('watching....value received : selectedDate', $scope.view_ls_selectedDate);
            //if form valid, then make a server call
            if ($scope.view_ls_rawSelectedDate) {
                console.log('calling server to get all LAs working on ', $scope.view_ls_selectedDate);
                $scope.view_ls_isDataFetched = true;
            }
        }
    });

    //Refined Search
    $scope.view_ls_refineSearch = function (selectedCampusName, selectedLabName, rawSelectedDate) {
        if (selectedCampusName && selectedLabName && rawSelectedDate) {
            //hide the default results section
            $scope.view_ls_isDataFetched = false;
            $scope.view_ls_selectedDate = $filter('date')($scope.view_ls_rawSelectedDate, 'mediumDate');
            console.log('fetching refined results for ', selectedCampusName.name, ' ', selectedLabName.name, ' ', $scope.view_ls_selectedDate);
            //show the default results section with refined results
            $scope.view_ls_isDataFetched = true;
        } else {
            notifyUser('Please select both date and a lab');
        }

    }

    //Delete a lab single lab schedule
    $scope.view_ls_delete = function (scheduleId) {
        console.log('Deleting single schedule for lab with id: ', scheduleId);

        var promise = ManageLabScheduleService.deleteStaffSchedule(scheduleId);
        promise.then(function (result) {
            console.log('Operation success, refershing lab schedule table');
            //refresh table contents i.e iterate through $scope.view_ls_labSchedule model and delete the record

            //nofity to the user
            notifyUser('Selected lab schedule has been deleted.');
        }).catch(function (resError) {
            notifyUser('Error occurred while performing this operation.');
        });
    }

    //Delete all related lab schedules
    $scope.view_ls_delete_all = function (scheduleId) {
        console.log('Deleting all occurrence with id: ', scheduleId);

        var promise = ManageLabScheduleService.deleteStaffSchedule_All(scheduleId);
        promise.then(function (result) {
            console.log('Operation success, refershing lab schedule table');
            //refresh table contents i.e iterate through $scope.view_ls_labSchedule model and delete the record

            //nofity to the user
            notifyUser('All occurrences of the selected lab schedule has been deleted.');
        }).catch(function (resError) {
            notifyUser('Error occurred while performing this operation.');
        });
    }

    //show applicant details in a modal
    $scope.view_ls_showDetails = function (labSchedule) {
        $scope.view_ls_selectedLabSchedule = labSchedule;
        $('#view_ls_modal').modal('show');
        console.log('preparing to show detail in modal ', $scope.view_ls_selectedLabSchedule);
    }

    //common item begin
    //alerts to user
    function notifyUser(message) {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .textContent(message)
            .ok('Got it!')
        );
    }

    $scope.campus = [{
        id: 1,
        name: 'Teaneck/Hackensack'
    }, {
        id: 2,
        name: 'Madison'
    }, {
        id: 3,
        name: 'Canada'
    }];

    $scope.labNames = [{
        id: 1,
        parentId: 1,
        name: 'Dickinson Hall'
    }, {
        id: 2,
        parentId: 1,
        name: 'Becton Hall'
    }, {
        id: 3,
        parentId: 1,
        name: 'University Hall'
    }, {
        id: 4,
        parentId: 2,
        name: 'Madison Lab 1'
    }, {
        id: 5,
        parentId: 2,
        name: 'Madison Lab 2'
    }, {
        id: 6,
        parentId: 3,
        name: 'Vancouver Labs'
    }];

}])

.filter('LabFilter', function () {
    return function (selectedLabName, selectedCampusName) {
        var filtered = [];
        if (selectedCampusName === null) {
            return filtered;
        }
        angular.forEach(selectedLabName, function (item) {
            if (typeof selectedCampusName !== 'undefined') {
                if (item.parentId === selectedCampusName.id) {
                    filtered.push(item);
                }
            }
        });
        return filtered;
    };
});
