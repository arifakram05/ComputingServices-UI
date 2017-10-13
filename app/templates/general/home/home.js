angular.module('computingServices.home', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/home', {
        templateUrl: 'general/home/home.html',
        controller: 'homeCtrl'
    })
}])

.controller('homeCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
    console.log('home: ' + JSON.stringify($rootScope.globals));
}]);
