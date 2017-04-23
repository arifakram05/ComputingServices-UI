angular.module('computingServices.shared', ['ngRoute'])

.service('SharedService', ['growl', '$http', '$q', '$window', '$location', function (growl, $http, $q, $window, $location) {

    var SEARCH_USERS_URI = constants.url + 'general/search';
    var GET_ROLES_URI = constants.url + 'admin/role-names';

    this.userDetails = {};
    this.authToken = '';

    var service = {
        setUserDetails: setUserDetails,
        getUserDetails: getUserDetails,

        setAuthToken: setAuthToken,
        getAuthToken: getAuthToken,

        getUserName: getUserName,
        getUserId: getUserId,
        getUserRole: getUserRole,
        getUserTitle: getUserTitle,
        getUserEmail: getUserEmail,

        showLoginPage: showLoginPage,
        navigateToHome: navigateToHome,
        isUserAuthenticated: isUserAuthenticated,
        verifyUserAndRedirect: verifyUserAndRedirect,

        showSuccess: showSuccess,
        showWarning: showWarning,
        showError: showError,
        showInfo: showInfo,

        logout: logout,

        //common service calls
        searchUsers: searchUsers,
        getRoles: getRoles
    };

    return service;

    function setUserDetails(userDetails) {
        this.userDetails = userDetails;
        console.log('User details now set :: ', this.userDetails);
        $window.localStorage.setItem('csUserDetails', JSON.stringify(userDetails));
    }

    function getUserDetails() {
        if ($window.localStorage.getItem('csUserDetails')) {
            this.userDetails = JSON.parse($window.localStorage.getItem('csUserDetails'));
        }
        return this.userDetails;
    }

    function setAuthToken(authToken) {
        this.authToken = authToken;
        //console.log('token set : ', this.authToken);
        $window.localStorage.setItem('csAuthToken', authToken);
    }

    function getAuthToken() {
        this.authToken = $window.localStorage.getItem('csAuthToken');
        return this.authToken;
    }

    function getUserName() {
        return this.userDetails.userName;
    }

    function getUserId() {
        return this.userDetails.userId;
    }

    function getUserRole() {
        return this.userDetails.role;
    }

    function getUserTitle() {
        return this.userDetails.title;
    }

    function getUserEmail() {
        return this.userDetails.emailId;
    }

    function showLoginPage() {
        //console.log('Inside Shared Controller"s showLoginPage method');
        $location.path('/login');
    }

    function navigateToHome() {
        //console.log('Inside Shared Controller"s NavigateToScurmBoard method');
        $location.path('/home');
    }

    function isUserAuthenticated() {
        var localUserDetails = JSON.parse($window.localStorage.getItem('csUserDetails'));
        var localToken = $window.localStorage.getItem('csAuthToken');
        if (localUserDetails != null && localToken !== '')
            return true;
        else
            return false;
    }

    //verify if user if authenticated, if not redirect to home page
    function verifyUserAndRedirect() {
        if (!isUserAuthenticated()) {
            console.log('User is not authorized, redirecting to Login page');
            showLoginPage();
        }
    }

    //logout user
    function logout() {
        this.userDetails = undefined;
        this.authToken = '';
        $window.localStorage.removeItem('csUserDetails');
        $window.localStorage.removeItem('csAuthToken');
    }

    /*Messages to the user*/
    function showSuccess(message) {
        growl.success(message, {
            title: 'Success!'
        });
    }

    function showWarning(message) {
        growl.warning(message, {
            title: 'Warning!'
        });
    }

    function showError(message) {
        growl.error(message, {
            title: 'Error!'
        });
    }

    function showInfo(message) {
        growl.info(message, {
            title: 'Info!'
        });
    }

    //Common service calls

    function searchUsers(searchText) {
        var deferred = $q.defer();
        $http({
                method: 'GET',
                url: SEARCH_USERS_URI,
                params: {
                    user: searchText
                }
            })
            .then(
                function success(response) {
                    console.log('users retrieved per search criteria: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while making service call to search for users ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

    function getRoles() {
        var deferred = $q.defer();
        $http({
                method: 'GET',
                url: GET_ROLES_URI
            })
            .then(
                function success(response) {
                    console.log('Roles retreived: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while making service call to fetch roles ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

}]);
