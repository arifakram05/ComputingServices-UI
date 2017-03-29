'use strict';

var computingServicesApp = angular.module('computingServices', [
    'ngRoute', 'ngCookies', 'ngMaterial', 'ngMessages', 'angular-growl', 'material.components.eventCalendar',
    'computingServices.login',
    'computingServices.home',
    'computingServices.careers',
    'computingServices.about',
    'computingServices.contact',
    'computingServices.faq',
    'computingServices.labSchedule',
    'computingServices.staff',
    'computingServices.staffSchedule',

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
    'angularUtils.directives.dirPagination',

    /*shared module*/
    'computingServices.shared'
])

.config(function ($routeProvider, growlProvider, $httpProvider) {
    //handling unknown routes
    $routeProvider.otherwise('/home');

    //notifications
    growlProvider.globalTimeToLive(5000);
    growlProvider.globalPosition('bottom-right');
    growlProvider.globalDisableCountDown(true);

    //interceptor for http calls
    $httpProvider.interceptors.push('csInterceptor');
})

//this method will intercept all http calls
.factory('csInterceptor', function ($q, $window, growl, $injector) {

    return {
        request: function (config) {
            var SharedService = $injector.get('SharedService');
            console.log('auth token : ', SharedService.getAuthToken());
            console.log('Intercepted Service Call....Adding authToken to request....');
            config.headers = config.headers || {};
            if (SharedService.getAuthToken()) {
                config.headers.Authorization = SharedService.getAuthToken();
            }
            return config;
        },
        response: function (response) {
            if (response.status === 401 || response.status === 403) {
                // handle the case where the user is not authenticated
                SharedService.showError('This operation cannot be performed as you are not authenticated');
            }
            return response || $q.when(response);
        }
    };
})

.controller('mainCtrl', ['SharedService', '$scope', function (SharedService, $scope) {

    $scope.$watch(function () {
        $scope.userDetails = SharedService.getUserDetails();
        $scope.isUserLoggedIn = SharedService.isUserAuthenticated();

        if ($scope.userDetails != null) {
            $scope.userRole = $scope.userDetails.role;
        }
    }, true);

    console.log('user details ',$scope.userDetails);
    console.log('is user logged in : ',$scope.isUserLoggedIn);
    console.log('user role : ',$scope.userRole);

    // user logout
    $scope.logout = function logout() {
        console.log('Logging out...');
        SharedService.navigateToHome();
        SharedService.logout();
        SharedService.showSuccess("Logged out");
    }

}]);

/*.run(['$rootScope', '$location', '$cookies', '$http', function ($rootScope, $location, $cookies, $http) {

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
}]);*/
