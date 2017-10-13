'use strict';

angular.module('computingServices.faq', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/faq', {
        templateUrl: 'general/faq/faq.html',
        controller: 'FaqCtrl'
    })
}])

.factory('FaqService', ['$http', function ($http) {
    var pageName = "FAQ";

    return {
        getPageName: function () {
            return pageName;
        },
        getPageData: function () {
            return $http({
                method: "GET",
                url: "json/faq.json"
            }).then(function (result) {
                return result.data;
            });
        }
    }
}])

.controller('FaqCtrl', ['$scope', 'FaqService', function ($scope, FaqService) {
    console.log('Page Name: ' + FaqService.getPageName());

    $scope.currentPage = 1;
    $scope.pageSize = 10;

    var myDataPromise = FaqService.getPageData();
    myDataPromise.then(function (result) {
        $scope.faqs = result;
        console.log('FAQ Service Object:' + $scope.faqs);
    });

    $scope.selectedQA = function (faq) {
        console.log('showing faq - ',faq);
        $scope.selQues = faq.id;
    }

}])

.controller('FaqPageCtrl', ['$scope', function ($scope) {
    $scope.pageChangeHandler = function (num) {
        console.log('going to page ' + num);
    };
}]);
