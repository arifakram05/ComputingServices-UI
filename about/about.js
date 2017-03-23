'use strict';

angular.module('computingServices.about', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/about', {
        templateUrl: 'about/about.html',
        controller: 'AboutCtrl'
    });
}])

.factory('AboutService', ['$http', function ($http) {
    var pageName = "About";

    return {
        getPageName: function () {
            return pageName;
        },
        getPageData: function () {
            //Angular $http() and then() both return promises themselves
            return $http({
                method: "GET",
                url: "json/about.json"
            }).then(function (result) {
                //What we return here is the data that will be accessible to us after the promise resolves
                return result.data;
            });
        }
    }
}])

.controller('AboutCtrl', ['$scope', 'AboutService', function ($scope, AboutService) {
    console.log('Page Name: ' + AboutService.getPageName());

    var myDataPromise = AboutService.getPageData();
    myDataPromise.then(function (result) {
        //this is only run after getPageData() resolves
        $scope.pageData = result;
        console.log('About Service Object:' + $scope.pageData);
    });

}]);
