'use strict';

angular.module('computingServices.contact', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/contact', {
        templateUrl: 'general/contact/contact.html',
        controller: 'contactCtrl'
    })
}])

.controller('contactCtrl', ['$scope', function ($scope) {
    /*$http.get('json/templates.json').success(function(data){
        $scope.templates = data;
    });*/
    console.log('Contact ' + $scope);
}]);
