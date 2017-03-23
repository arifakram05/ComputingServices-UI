'use strict';

angular.module('computingServices.login', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/login', {
        templateUrl: 'login/login.html',
        controller: 'LoginCtrl'
    });
}])

.factory('LoginService', ['$http', '$cookies', '$rootScope', '$timeout', 'LocalLoginService', function ($http, $cookies, $rootScope, $timeout, LocalLoginService) {

    // Base64 encoding service used by AuthenticationService
    var Base64 = {

        keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    this.keyStr.charAt(enc1) +
                    this.keyStr.charAt(enc2) +
                    this.keyStr.charAt(enc3) +
                    this.keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                             "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                             "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = this.keyStr.indexOf(input.charAt(i++));
                enc2 = this.keyStr.indexOf(input.charAt(i++));
                enc3 = this.keyStr.indexOf(input.charAt(i++));
                enc4 = this.keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };

    var service = {};

    service.Login = Login;
    service.SetCredentials = SetCredentials;
    service.ClearCredentials = ClearCredentials;

    return service;

    function Login(username, password, callback) {

        /* Dummy authentication for testing, uses $timeout to simulate api call
             ----------------------------------------------*/
        $timeout(function () {
            var response;
            //$http.get('/api/users/' + username).then(handleSuccess, handleError('Error getting user by username'));
            LocalLoginService.GetByUsername(username)
                .then(function (user) {
                    if (user !== null && user.password === password) {
                        response = {
                            success: true
                        };
                    } else {
                        response = {
                            success: false,
                            message: 'Username or password is incorrect'
                        };
                    }
                    callback(response);
                });
        }, 1000);

        /* Use this for real authentication
             ----------------------------------------------*/
        //$http.post('/api/authenticate', { username: username, password: password })
        //    .success(function (response) {
        //        callback(response);
        //    });

    };

    function SetCredentials(username, password) {

        var authdata = Base64.encode(username + ':' + password);

        console.log('Base64: '+JSON.stringify(authdata));
        $rootScope.globals = {
            currentUser: {
                username: username,
                authdata: authdata
            }
        };

        // set default auth header for http requests
        $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;

        // store user details in globals cookie that keeps user logged in for 1 week (or until they logout)
        var cookieExp = new Date();
        cookieExp.setDate(cookieExp.getDate() + 7);
        $cookies['globals'] = angular.toJson($rootScope.globals, {
            expires: cookieExp
        });
        /*$cookies.putObject('globals', $rootScope.globals, {
            expires: cookieExp
        });*///For newer angular version
    };

    function isEmpty(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        }
        return true;
    };

    function ClearCredentials() {
        console.log('implementing logout...');
        $rootScope.globals = {};
        /*$cookies.remove('globals');*///for new angular version
        delete $cookies['globals'];
        $http.defaults.headers.common.Authorization = 'Basic';
        console.log(JSON.stringify($rootScope.globals));

        return isEmpty($rootScope.globals);
    };

}])

.controller('LoginCtrl', ['$scope', 'LoginService', '$location', 'FlashService', '$rootScope', function ($scope, LoginService, $location, FlashService, $rootScope) {

    $scope.login = login;
    //$scope.logout = logout;

    function login() {
        console.log('Called login function');
        $scope.dataLoading = true;
        LoginService.Login($scope.username, $scope.password, function (response) {
            if (response.success) {
                LoginService.SetCredentials($scope.username, $scope.password);
                $location.path('/home');
            } else {
                FlashService.Error(response.message);
                $scope.dataLoading = false;
            }
        });
    };

    //logout() functionality moved to app.js
    /*function logout() {
        console.log('logging out...');
        // reset login status
        if(LoginService.ClearCredentials()) {
            console.log('successfully logged out...');
            FlashService.success('Successfully Logged Out');
        } else {
            FlashService.Error('Something went wrong. Logout Unsuccessful.');
        }
    };*/

}]);
