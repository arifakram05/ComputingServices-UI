'use strict';

angular.module('computingServices.manageStaffSchedule', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/manageStaffSchedule', {
        templateUrl: 'templates/admin/manageStaffSchedule.html',
        controller: 'ManageStaffScheduleCtrl'
    })
}])

.factory('ManageStaffScheduleService', ['$timeout', '$filter', '$q', function ($timeout, $filter, $q) {

    var DELETE_LA_SCHEDULE_URI = constants.url + 'services/deleteJobApplicant?';

    //define all factory methods
    var factory = {
        deleteLASchedule: deleteLASchedule
    };

    return factory;

    /*function getLabAssistants(searchText) {
        console.log('searching... ', searchText);
        var deferred = $q.defer();

        $timeout(function () {

            var states = getStates().filter(function (state) {
                return (state.name.toUpperCase().indexOf(searchText.toUpperCase()) !== -1 || state.abbreviation.toUpperCase().indexOf(searchText.toUpperCase()) !== -1);
            });
            deferred.resolve(states);
        }, 1000);

        return deferred.promise;
    }*/

    function deleteLASchedule(studentId) {
        var deferred = $q.defer();

        var data = $.param({
            studentId: studentId
        });

        $http.delete(DELETE_LA_SCHEDULE_URI + data)
            .success(
                function (response) {
                    console.log('record deleted ', response);
                    deferred.resolve(response.data);
                })
            .error(function (resError) {
                console.log('error while deleting ', resError);
                deferred.reject(errResponse);
            });
        return deferred.promise;
    }

}])

.controller('ManageStaffScheduleCtrl', ['$scope', '$mdDialog', '$timeout', '$q', '$filter', 'ManageStaffScheduleService', function ($scope, $mdDialog, $timeout, $q, $filter, ManageStaffScheduleService) {

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

    this.view_ss_selectedLAName = '';

    $scope.labAssistants = getStates(); //URI call for this

    $scope.create_ss_save = function (staffSchedule) {
        if ($scope.create_ss_form.$valid) {

            $scope.create_ss_form.$setSubmitted();

            staffSchedule.campus = $scope.create_ss_selectedCampusName.id;
            staffSchedule.lab = $scope.create_ss_selectedLabName.id;
            console.log('data to be saved is ', staffSchedule);

            //make service call
            var promise = ManageStaffScheduleService.saveStaffSchedule(staffSchedule);
            promise.then(function (result) {
                console.log('Scheduled saved.', result);
                notifyUser('Lab Assistant schedule has been saved successfully.');
            }).catch(function (resError) {
                notifyUser('Error occurred while saving Lab Assistant schedule.');
            });

            //clear fields
            $scope.create_ss_clearValue();

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
    $scope.create_ss_clearValue = function () {
        $scope.create_ss_rawStartDate = undefined;
        $scope.create_ss_rawEndDate = undefined;
        $scope.create_ss_rawStartTime = undefined;
        $scope.create_ss_rawEndTime = undefined;
        $scope.labSchedule = undefined;
        $scope.create_ss_selectedCampusName = undefined;
        $scope.create_ss_selectedLabName = undefined;
        this.view_ss_selectedLAName = '';
        $scope.create_ss_form.$setPristine();
        $scope.create_ss_form.$setUntouched();
        $scope.selected = [];
    };

    //Create items end
    //View items begin


    //monitor date selected and fetch shift details for a custom date
    $scope.$watch('view_ss_rawSelectedDate', function (view_ss_rawSelectedDate) {
        if ($scope.view_ss_searchByLA) {
            console.log('when refined results is in place, cannot call server');
        } else {
            $scope.view_ss_selectedDate = $filter('date')($scope.view_ss_rawSelectedDate, 'mediumDate');
            console.log('watching....value received : selectedDate', $scope.view_ss_selectedDate);
            //if form valid, then make a server call
            if ($scope.view_ss_rawSelectedDate) {
                console.log('calling server to get all LAs working on ', $scope.view_ss_selectedDate);
                $scope.view_ss_isDataFetched = true;
            }
        }
    });

    //Refined Search
    $scope.view_ss_refineSearch = function (view_ss_selectedLAName, view_ss_rawSelectedDate) {
        if (view_ss_selectedLAName && view_ss_rawSelectedDate) {
            //hide the default results section
            $scope.view_ss_isDataFetched = false;
            $scope.view_ss_selectedDate = $filter('date')($scope.view_ss_rawSelectedDate, 'mediumDate');
            console.log('fetching refined results for ', view_ss_selectedLAName, ' ', $scope.view_ss_selectedDate);
            //show the default results section with refined results
            $scope.view_ss_isDataFetched = true;
        } else {
            notifyUser('Please select both date and a Lab Assistant');
        }

    }

    //Delete a lab single lab asst schedule
    $scope.view_ss_delete = function (scheduleId) {
        console.log('Deleting single schedule for lab asst with id: ', scheduleId);

        var promise = ManageStaffScheduleService.deleteLASchedule(scheduleId);
        promise.then(function (result) {
            console.log('Operation success, refershing staff schedule table');
            //refresh table contents i.e iterate through $scope.view_ss_staffSchedule model and delete the record

            //nofity to the user
            notifyUser('Selected LA schedule has been deleted.');
        }).catch(function (resError) {
            notifyUser('Error occurred while performing this operation.');
        });
    }

    //Delete all related lab schedules
    $scope.view_ss_delete_all = function (scheduleId) {
        console.log('Deleting all occurrence with id: ', scheduleId);

        var promise = ManageStaffScheduleService.deleteLASchedule_All(scheduleId);
        promise.then(function (result) {
            console.log('Operation success, refershing staff schedule table');
            //refresh table contents i.e iterate through $scope.view_ss_labSchedule model and delete the record

            //nofity to the user
            notifyUser('All occurrences of the selected LA schedule has been deleted.');
        }).catch(function (resError) {
            notifyUser('Error occurred while performing this operation.');
        });
    }

    //show applicant details in a modal
    $scope.view_ss_showDetails = function (labSchedule) {
        $scope.view_ss_selectedLabAsstSchedule = labSchedule;
        $('#view_ss_modal').modal('show');
        console.log('preparing to show detail in modal ', $scope.view_ss_selectedLabAsstSchedule);
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

    //common stuff

    //URI call for this
    $scope.view_ss_staffSchedule = [{
        "labName": "Becton",
        "schedule": [{
            "firstName": "Arif",
            "lastName": "Akram",
            "startTime": "08:00",
            "endTime": "12:00",
            "studentId": "1643568",
            "endDate": "Jan 23, 2017",
            "campus": "Teaneck/Hackensack",
            "labName": "Becton",
            "days": [
                "Monday", "Friday"
            ]
        }, {
            "firstName": "Lance",
            "lastName": "Klusener",
            "startTime": "18:00",
            "endTime": "23:00",
            "studentId": "1656318",
            "endDate": "Jan 23, 2017",
            "campus": "Teaneck/Hackensack",
            "labName": "Becton",
            "days": [
                "Wednesday"
            ]
        }]
    }, {
        "labName": "University",
        "schedule": [{
            "firstName": "Jacques",
            "lastName": "Kallis",
            "startTime": "10:00",
            "endTime": "14:00",
            "studentId": "3143538",
            "endDate": "Jan 23, 2017",
            "campus": "Teaneck/Hackensack",
            "labName": "University",
            "days": [
                "Monday", "Wednesday"
            ]
        }, {
            "firstName": "Ricky",
            "lastName": "Ponting",
            "startTime": "11:00",
            "endTime": "20:00",
            "studentId": "19868568",
            "endDate": "Jan 23, 2017",
            "campus": "Teaneck/Hackensack",
            "labName": "University",
            "days": [
                "Monday", "Wednesday", "Sunday"
            ]
        }]
    }, {
        "labName": "Canada",
        "schedule": [{
            "firstName": "MS",
            "lastName": "Dhoni",
            "startTime": "11:00",
            "endTime": "15:00",
            "studentId": "986424",
            "endDate": "Jan 23, 2017",
            "campus": "Vancuover",
            "labName": "Canada",
            "days": [
                "Monday", "Wednesday", "Friday"
            ]
        }, {
            "firstName": "Mark",
            "lastName": "Waugh",
            "startTime": "09:00",
            "endTime": "15:00",
            "studentId": "359238759",
            "endDate": "Jan 23, 2017",
            "campus": "Vancuover",
            "labName": "Canada",
            "days": [
                "Monday", "Wednesday"
            ]
        }]
    }];

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

function getStates() {
    return [{
        "name": "Alabama",
        "abbreviation": "AL"
    }, {
        "name": "Alaska",
        "abbreviation": "AK"
    }, {
        "name": "American Samoa",
        "abbreviation": "AS"
    }, {
        "name": "Arizona",
        "abbreviation": "AZ"
    }, {
        "name": "Arkansas",
        "abbreviation": "AR"
    }, {
        "name": "California",
        "abbreviation": "CA"
    }, {
        "name": "Colorado",
        "abbreviation": "CO"
    }, {
        "name": "Connecticut",
        "abbreviation": "CT"
    }, {
        "name": "Delaware",
        "abbreviation": "DE"
    }, {
        "name": "District Of Columbia",
        "abbreviation": "DC"
    }, {
        "name": "Federated States Of Micronesia",
        "abbreviation": "FM"
    }, {
        "name": "Florida",
        "abbreviation": "FL"
    }, {
        "name": "Georgia",
        "abbreviation": "GA"
    }, {
        "name": "Guam",
        "abbreviation": "GU"
    }, {
        "name": "Hawaii",
        "abbreviation": "HI"
    }, {
        "name": "Idaho",
        "abbreviation": "ID"
    }, {
        "name": "Illinois",
        "abbreviation": "IL"
    }, {
        "name": "Indiana",
        "abbreviation": "IN"
    }, {
        "name": "Iowa",
        "abbreviation": "IA"
    }, {
        "name": "Kansas",
        "abbreviation": "KS"
    }, {
        "name": "Kentucky",
        "abbreviation": "KY"
    }, {
        "name": "Louisiana",
        "abbreviation": "LA"
    }, {
        "name": "Maine",
        "abbreviation": "ME"
    }, {
        "name": "Marshall Islands",
        "abbreviation": "MH"
    }, {
        "name": "Maryland",
        "abbreviation": "MD"
    }, {
        "name": "Massachusetts",
        "abbreviation": "MA"
    }, {
        "name": "Michigan",
        "abbreviation": "MI"
    }, {
        "name": "Minnesota",
        "abbreviation": "MN"
    }, {
        "name": "Mississippi",
        "abbreviation": "MS"
    }, {
        "name": "Missouri",
        "abbreviation": "MO"
    }, {
        "name": "Montana",
        "abbreviation": "MT"
    }, {
        "name": "Nebraska",
        "abbreviation": "NE"
    }, {
        "name": "Nevada",
        "abbreviation": "NV"
    }, {
        "name": "New Hampshire",
        "abbreviation": "NH"
    }, {
        "name": "New Jersey",
        "abbreviation": "NJ"
    }, {
        "name": "New Mexico",
        "abbreviation": "NM"
    }, {
        "name": "New York",
        "abbreviation": "NY"
    }, {
        "name": "North Carolina",
        "abbreviation": "NC"
    }, {
        "name": "North Dakota",
        "abbreviation": "ND"
    }, {
        "name": "Northern Mariana Islands",
        "abbreviation": "MP"
    }, {
        "name": "Ohio",
        "abbreviation": "OH"
    }, {
        "name": "Oklahoma",
        "abbreviation": "OK"
    }, {
        "name": "Oregon",
        "abbreviation": "OR"
    }, {
        "name": "Palau",
        "abbreviation": "PW"
    }, {
        "name": "Pennsylvania",
        "abbreviation": "PA"
    }, {
        "name": "Puerto Rico",
        "abbreviation": "PR"
    }, {
        "name": "Rhode Island",
        "abbreviation": "RI"
    }, {
        "name": "South Carolina",
        "abbreviation": "SC"
    }, {
        "name": "South Dakota",
        "abbreviation": "SD"
    }, {
        "name": "Tennessee",
        "abbreviation": "TN"
    }, {
        "name": "Texas",
        "abbreviation": "TX"
    }, {
        "name": "Utah",
        "abbreviation": "UT"
    }, {
        "name": "Vermont",
        "abbreviation": "VT"
    }, {
        "name": "Virgin Islands",
        "abbreviation": "VI"
    }, {
        "name": "Virginia",
        "abbreviation": "VA"
    }, {
        "name": "Washington",
        "abbreviation": "WA"
    }, {
        "name": "West Virginia",
        "abbreviation": "WV"
    }, {
        "name": "Wisconsin",
        "abbreviation": "WI"
    }, {
        "name": "Wyoming",
        "abbreviation": "WY"
    }];
}
