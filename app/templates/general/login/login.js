'use strict';

angular.module('computingServices.login', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/login', {
        templateUrl: 'templates/general/login/login.html',
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

    function Login(userId, password, callback) {

        $timeout(function () {
            var response;
            //$http.get('/api/users/' + userId).then(handleSuccess, handleError('Error getting user by userId'));
            LocalLoginService.GetByuserId(userId)
                .then(function (user) {
                    if (user !== null && user.password === password) {
                        response = {
                            success: true
                        };
                    } else {
                        response = {
                            success: false,
                            message: 'userId or password is incorrect'
                        };
                    }
                    callback(response);
                });
        }, 1000);


    };

    function SetCredentials(userId, password) {

        var authdata = Base64.encode(userId + ':' + password);

        console.log('Base64: '+JSON.stringify(authdata));
        $rootScope.globals = {
            currentUser: {
                userId: userId,
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

    var LOGIN_USER_URI = constants.url + 'general/login/';
    var REGISTER_CHECK_URI = constants.url + 'general/check/';
    var REGISTER_USER_URI = constants.url + 'general/register/';
    var GET_PRIVILEGES_URI = constants.url + 'admin/assigned-privs/';

    var factory = {
        loginUser: loginUser,
        canUserRegister: canUserRegister,
        registerUser: registerUser,
        getPrivileges: getPrivileges
    };

    return factory;

    //Login associate
    function loginUser(user) {
        console.log('User details for login: ', user);
        var deferred = $q.defer();

        /*if (user.userId === 468415) {
            console.log('control inside testing method : ', user.userId);
            var userDetails = {
                "authToken": "shfulig{}}#@aelf734769q8rp3278",
                "name": "Arif Akram",
                "userId": "468415",
                //"role": "Lab Assistant",
                "role": "Admin",
                "code": 200
            };
        } else {
            var userDetails = {
                "message": "Either the ID or Password is incorrect",
                "code": 403
            };
        }
        deferred.resolve(userDetails);
        return deferred.promise;*/

        // Real http call to server
        $http({
                method: 'POST',
                url: LOGIN_USER_URI,
                headers: {
                    'Content-Type': undefined
                },

                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("userDetails", angular.toJson(user));
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

        return deferred.promise;

    }

    //Check if user can register
    function canUserRegister(userId) {
        console.log('User to verify registration for is : ', userId);
        var deferred = $q.defer();

        /*if (userId === 1) {
            console.log('control inside testing method : ', userId);
            var result = {
                "code": 200
            };
        } else {
            var result = {
                "code": 403
            };
        }
        deferred.resolve(result);
        return deferred.promise;*/

        //Real Server Call
        $http({
                method: 'GET',
                url: REGISTER_CHECK_URI,
                headers: {
                    'Content-Type': undefined
                },
                params: {
                    userId: userId
                }
            })
            .success(function (data, status, headers, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.log('Registration check Failure ', status);
                deferred.reject(data);
            });
        return deferred.promise;
    }

    //Register new user
    function registerUser(user) {
        console.log('User to register : ', user);
        var deferred = $q.defer();

        $http({
                method: 'POST',
                url: REGISTER_USER_URI,
                headers: {
                    'Content-Type': undefined
                },

                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("userDetails", angular.toJson(user));
                    return formData;
                }
            })
            .success(function (data, status, headers, config) {
                console.log('Registration Success ', data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.log('Registration Failure ', status);
                deferred.reject(data);
            });
        return deferred.promise;
    }

    //get user privileges
    function getPrivileges(role) {
        console.log('fetching privileges for role name : ', role);
        var deferred = $q.defer();

        //mock data
        var privileges = ["UploadWiki", "DeleteWiki", "/manageJobApplicants", "/manageLabAssistants", "/authorize", "/manageRoles", "/managelabschedule", "/manageStaffSchedule", "/displaywork", "/recordwork", "/manageprofile", "/manageUsers", "/settings", "ViewApplicantDetails", "JobApplicants", "LabAssistants", "Roles", "DeleteRole", "CreateRole", "Users", "AddUser", "Authorize", "Settings", "ChangePassword"];
        deferred.resolve(privileges);

        //real server call
        /*$http({
                method: 'GET',
                url: GET_PRIVILEGES_URI,
                params: {
                    role: role
                }
            })
            .success(function (data, status, headers, config) {
                console.log('privileges fetched ', data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.log('Failed to fetch privileges ', status);
                deferred.reject(data);
            });*/
        return deferred.promise;
    }

}])

.controller('LoginCtrl', ['$scope', 'LoginService', '$location', 'SharedService', '$mdDialog', function ($scope, LoginService, $location, SharedService, $mdDialog) {

    navigateToHomeIfAlreadyLoggedIn();

    //function to redirect user to home page if logged in
    function navigateToHomeIfAlreadyLoggedIn() {
        if (SharedService.isUserAuthenticated()) {
            console.log("Navigating to home page as user is already logged in : ", SharedService.isUserAuthenticated());
            SharedService.navigateToHome();
            return;
        }
    }

    //responsible for logging in the user
    $scope.login = function (user) {
        console.log('Logging in ', $scope.user);
        //Start spinner
        $scope.dataLoading = true;

        var promise = LoginService.loginUser(user);
        promise.then(function (result) {
                console.log('Login Success, data retrieved :', result);

                //Stop spinner
                $scope.dataLoading = false;

                //Make the data available to all controllers
                setApplicationLevelData(result.response[0]);

                //Clear Form
                //clearForm();

                //Show success message to the user
                SharedService.showSuccess('Logged In');

                //Navigate to home page
                SharedService.navigateToHome();

            })
            .catch(function (resError) {
                console.log('LOGIN FAILURE :: ', resError);
                if (resError.statusCode === 403 || resError.statusCode === 404) {
                    SharedService.showError(resError.message);
                    $scope.dataLoading = false;
                    return;
                }

                if (resError.statusCode === 500) {
                    SharedService.showError('Error occurred while logging you in. Please contact administrator');
                    $scope.dataLoading = false;
                    return;
                }
            });
    }

    //share user details retured from login success call with all controllers
    function setApplicationLevelData(userDetails) {
        //set user details
        console.log('setting application level data ', userDetails);
        SharedService.setUserDetails(userDetails);
        //set auth token
        SharedService.setAuthToken(userDetails.authToken);
        //get privileges
        getPrivileges();
    }

    //get the info about what sections of application the user can access
    function getPrivileges() {
        var promise = LoginService.getPrivileges(SharedService.getUserRole());
        promise.then(function (result) {
                console.log('Obtained user privileges', result);
                //put them in sharedservice
                SharedService.setUserPrivileges(result);
                //do something with the privileges
                console.log('user privileges: ', SharedService.getUserPrivileges());
            })
            .catch(function (resError) {
                console.log('FETCH USER PRIVILEGES FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Error while getting crucial data, hence logging you out. Please contact Lab Manager');
                // logout the user
                SharedService.logout();
            });
    }

    //Clear login form
    $scope.clearLoginForm = function () {
        $scope.user = undefined;
        $scope.loginForm.$setPristine();
        $scope.loginForm.$setUntouched();
    }

    //Check if the given user id is authorized to register
    $scope.checkUserValidity = function (user) {

        var promise = LoginService.canUserRegister(user.userId);
        promise.then(function (result) {
                console.log('Login Success, data retrieved :', result);

                if (result.statusCode === 500) {
                    SharedService.showError('Error occurred while verifying. Please contact Lab Assistant or Lab Manager');
                    return;
                }

                if (result.statusCode === 200) {
                    $scope.canUserRegister = true;
                } else if (result.statusCode === 404) {
                    SharedService.showInfo(result.message);
                    //show first tab, as user is already registered
                    $scope.showTab(1);
                } else if (result.statusCode === 403) {
                    notifyUser(result.message);
                }
            })
            .catch(function (resError) {
                console.log('FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Error Ocurred. System could not process your request');
            });
    }

    //Register the user such that he can login
    $scope.register = function (user) {
        console.log('user to be registerd is ', user);
        if ($scope.registerForm.$valid) {

            if (user.password !== user.confirmedPassword) {
                notifyUser('Passwords do not match. Please verify and re-submit.');
                return;
            }

            //remove the below property before calling server
            delete user.confirmedPassword;
            //remove secret key before calling server
            delete user.secretKey;

            //call server to register new user
            var promise = LoginService.registerUser(user);
            promise.then(function (result) {
                    console.log('Registration Success, data retrieved :', result);

                    if (result.code === 404) {
                        SharedService.showWarning(result.message);
                        return;
                    }
                    if (result.code === 403) {
                        SharedService.showError(result.message);
                        return;
                    }

                    if (result.code === 500) {
                        SharedService.showError('Error occurred while registering. Please contact administrator');
                        return;
                    }

                    //Show success message to the user
                    SharedService.showSuccess(result.message);

                    //show first tab
                    $scope.showTab(1);

                    //clear register form
                    $scope.clearRegisterForm();
                    $scope.startRegistration();
                })
                .catch(function (resError) {
                    console.log('FAILURE :: ', resError);
                    //show failure message to the user
                    SharedService.showError('Server Error. System could not register you.');
                });

        } else {
            console.log('form is invalid');
            //notify user to correct the form data before submitting
            notifyUser('Please fill in all the fields to register.');
            return;
        }
    }

    //Clear registerForm fields
    $scope.clearRegisterForm = function () {
        $scope.user = undefined;
        $scope.registerForm.$setPristine();
        $scope.registerForm.$setUntouched();
    }

    //Start ID validity check again
    $scope.startRegistration = function () {
        $scope.canUserRegister = false;
    }

    $scope.showTab = function (index) {
        if (index === 1) {
            $scope.isFirstTabActive = true;
            $scope.isSecondTabActive = false;
        } else if (index === 2) {
            $scope.isFirstTabActive = false;
            $scope.isSecondTabActive = true;
        }
    }

    //alerts to user
    function notifyUser(message) {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .textContent(message)
            .ok('Got it!')
        );
    }
            }]);
