'use strict';

angular.module('computingServices.labSchedule',['ngRoute'])

.config(['$routeProvider', function($routeProvider){
	$routeProvider.
		when('/labSchedule', {
			templateUrl: 'labschedule/labschedule.html',
			controller: 'labScheduleCtrl'
		})
}])

.controller('labScheduleCtrl', ['$scope', function($scope){
	/*$http.get('json/templates.json').success(function(data){
		$scope.templates = data;
	});*/
	console.log('lab schedule '+$scope);
}]);