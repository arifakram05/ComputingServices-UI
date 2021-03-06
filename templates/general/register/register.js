'use strict';

angular.module('computingServices.register', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/register', {
        templateUrl: 'templates/general/register/register.html',
        controller: 'RegisterCtrl'
    })
}])

.controller('RegisterCtrl', ['$location', '$rootScope', '$scope', '$mdDialog', function ($location, $rootScope, $scope, $mdDialog) {

    //Check if the given user id is authorized to register
    $scope.checkUserValidity = function (id) {
        if (id === 1) {
            $scope.canUserRegister = true;
        } else {
            notifyUser('This ID is not authorized for registration. Please contact Lab Assistant or Lab Manager.');
            return;
        }
        console.log('id number is ',id);
        console.log('canUserRegister : ',$scope.canUserRegister);
    }

    //Register the user such that he can login
    $scope.registerUser = function (user) {
        console.log('user to be registerd is ',user);
        if ($scope.registerForm.$valid) {
            if(user.password !== user.confirmedPassword) {
                notifyUser('Passwords do not match. Please verify and re-submit.');
                return;
            }
            //Passcode will be checked at the server side
            if(user.passcode === 'xyz') {
                console.log('successfully registered ',user);
                $scope.clearForm();
                notifyUser('Registration Successful. You can now login.');
                $location.path('/login');
            } else {
                //notify user that the entered passcode is incorrect
                notifyUser('Passcode is incorrect. If you do not have the passcode emailed you, please hit Resend Email to get one.');
                return;
            }
        }
        else {
            console.log('form is invalid');
            //notify user to correct the form data before submitting
            notifyUser('Please fill in all the fields.');
            return;
        }
    }

    //Clear form fields
    $scope.clearForm = function () {
        $scope.user = undefined;
        $scope.registerForm.$setPristine();
        $scope.registerForm.$setUntouched();
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
