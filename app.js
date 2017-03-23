'use strict';

// Declare app level module which depends on views, and components
var computingServicesApp = angular.module('computingServices', [
    'ngRoute', 'ngCookies', 'ngMaterial', 'ngMessages',
    'computingServices.login',
    'computingServices.home',
    'computingServices.careers',
    'computingServices.about',
    'computingServices.contact',
    'computingServices.faq',
    'computingServices.labSchedule',
    'computingServices.staff',
    'computingServices.staffSchedule',
    'computingServices.register',

    /*admin modules*/
    'computingServices.manageLabAssistants',
    'computingServices.manageJobApplicants',
    'computingServices.manageLabSchedule',
    'computingServices.manageRoles',
    'computingServices.authorize',
    'computingServices.manageStaffSchedule',

    /*lab assistant modules*/
    'computingServices.recordwork',
    'computingServices.displaywork',
    'computingServices.viewworkschedule',
    'computingServices.manageprofile',

    /*'computingServices.logout',*/
    'angularUtils.directives.dirPagination'
])

.config(['$routeProvider', function ($routeProvider) {

    $routeProvider.otherwise({
        redirectTo: '/home'
    });
}])

.controller('LogoutCtrl', ['LoginService', 'FlashService', '$scope', function (LoginService, FlashService, $scope) {

    $scope.logout = function logout() {
        console.log('Logging out...');
        if (LoginService.ClearCredentials()) {
            console.log('successfully logged out...');
            FlashService.Success('Successfully Logged Out', false);
        } else {
            FlashService.Error('Something went wrong. Logout Unsuccessful.', false);
        }
    }

    $scope.isEmpty = function (obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }
        return true;
    }
}])

.run(['$rootScope', '$location', '$cookies', '$http', function ($rootScope, $location, $cookies, $http) {

    //hack for user login
    $rootScope.globals = {
        currentUser: {
            username: "1",
            authdata: "fsadsfadsf3523sfca",
            password: "1"
        }
    };

    console.log('From the run() method, globals is ', ($rootScope.globals.currentUser));

    // keep user logged in after page refresh
    //$rootScope.globals = $cookies['globals'] || {}; //commenting this out is a hack for user login during development - user refresh does not ask for user relogin
    if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
    }



    $rootScope.$on('$locationChangeStart', function (event, next, current) {
        console.log('Global data: ' + JSON.stringify($rootScope.globals.currentUser));
        if ($rootScope.globals.currentUser) {
            $rootScope.globals.role = "admin";
            console.log('isAdmin variable: ' + $rootScope.globals.isAdmin);
        } else {
            console.log('--------------------User is not logged in-------------------');
        }

        // redirect to login page if not logged in and trying to access a restricted page
        var unRestrictedPages = ['/home', '/login', '/register', '/about', '/contact', '/', '/labSchedule', '/staffSchedule', '/staff', '/faq', '/careers'];
        var restrictedPage = $.inArray($location.path(), unRestrictedPages) === -1;
        console.log('path:' + $location.path() + ' --isRestrictedPage: ' + restrictedPage);
        var loggedIn = $rootScope.globals.currentUser;
        console.log('loggedIn is ' + loggedIn);
        if (restrictedPage && !loggedIn) {
            $location.path('/login');
        }
    });
}]);
