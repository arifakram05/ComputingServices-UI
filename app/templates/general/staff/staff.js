'use strict';

angular.module('computingServices.staff', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/staff', {
        templateUrl: 'general/staff/staff.html',
        controller: 'StaffCtrl'
    })
}])

.factory('StaffService', ['$http', function ($http) {
    var pageName = "Staff";

    return {
        getPageName: function () {
            return pageName;
        },
        getPageData: function () {
            return $http({
                method: "GET",
                url: "json/staff.json"
            }).then(function (result) {
                return result.data;
            });
        }
    }
}])

.controller('StaffCtrl', ['$scope', 'StaffService', function ($scope, StaffService) {
    console.log('Page Name: ' + StaffService.getPageName());
    $scope.columns4 = "col-xs-4";
    $scope.columns6 = "col-md-6";
    $scope.staffMembers = [];
    $scope.assistants = [];

    var myDataPromise = StaffService.getPageData();
    myDataPromise.then(function (result) {
        $scope.staff = result;
        console.log('Staff Service Object::' + $scope.staff[1].category);

        angular.forEach($scope.staff, function (item) {
            console.log('category: ' + item.category);
            if (item.category === "staff") {
                $scope.staffMembers.push(item);
            } else if (item.category === "assistant") {
                $scope.assistants.push(item);
            }
        });

        //logging staff memebers
        angular.forEach($scope.staffMembers, function (item) {
            console.log(item.name + ' ' + item.category);
        });

        //logging lab assistants
        angular.forEach($scope.assistants, function (item) {
            console.log(item.name + ' ' + item.category);
        });
    });

}]);
