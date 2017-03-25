'use strict';

angular.module('computingServices.login', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/login', {
        templateUrl: 'login/login.html',
        controller: 'LoginCtrl'
    });
}])

/*.factory('LoginService', ['$http', '$cookies', '$rootScope', '$timeout', 'LocalLoginService', function ($http, $cookies, $rootScope, $timeout, LocalLoginService) {

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
    };

}])*/

.factory('LoginService', ['$http', '$q', function ($http, $q) {

    var LOGIN_USER_URI = constants.url + 'login/';

    var factory = {
        loginUser: loginUser,
    };

    return factory;

    //Login associate
    function loginUser(user) {
        console.log('User details for login: ', user);
        var deferred = $q.defer();

        if (user.username === "1643568") {
            console.log('control inside testing method : ', user.username);
            var userDetails = {
                "authToken": "shfulig{}}#@aelf734769q8rp3278",
                "name": "Arif Akram",
                "id": "1643568",
                "role": "Lab Assistant",
                "code": 200
            };
            deferred.resolve(userDetails);
            return deferred.promise;
        } else {
            deferred.reject("Login call failure");
            return deferred.promise;
        }

        // Real http call to server
        /*$http({
                method: 'POST',
                url: LOGIN_USER_URI,
                headers: {
                    'Content-Type': undefined
                },

                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("userDetails", angular.toJson(associate));
                    return formData;
                }
            })
            .success(function (data, status, headers, config) {
                console.log('Login Success ', data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.log('Login Failure ', status);
                deferred.reject(data);
            });

        return deferred.promise;*/

    }

}])

.controller('LoginCtrl', ['$scope', 'LoginService', '$location', 'SharedService', function ($scope, LoginService, $location, SharedService) {

    //responsible for logging in the user
    $scope.login = function () {
        console.log('Logging in ', $scope.username);
        //Start spinner
        $scope.dataLoading = true;

        var user = {
            username: $scope.username,
            password: $scope.password
        };

        var promise = LoginService.loginUser(user);
        promise.then(function (result) {
                console.log('Login Success, data retrieved :', result);

                if (result.code === 403) {
                    SharedService.showError(result.message);
                    $scope.dataLoading = false;
                    return;
                }

                if (result.code === 500) {
                    SharedService.showError('Error occurred while logging you in. Please contact administrator');
                    $scope.dataLoading = false;
                    return;
                }

                //Stop spinner
                $scope.dataLoading = false;

                //Make the data available to all controllers
                setApplicationLevelData(result);

                //Clear Form
                //clearForm();

                //Show success message to the user
                SharedService.showSuccess('Login Successful');

                //Navigate to home page
                SharedService.navigateToHome();

            })
            .catch(function (resError) {
                console.log('LOGIN FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Server Error. System could not log you in.');
                $scope.dataLoading = false;
            });
    }

    //share user details retured from login success call with all controllers
    function setApplicationLevelData(userDetails) {
        //set user details
        SharedService.setUserDetails(userDetails);
        //set auth token
        SharedService.setAuthToken(userDetails.authToken);
    }

}]);
