angular.module('computingServices.shared', ['ngRoute'])

.service('SharedService', ['growl', '$http', '$q', '$window', '$location', function (growl, $http, $q, $window, $location) {

    var SEARCH_USERS_URI = constants.url + 'search/users';
    var SEARCH_LAB_ASSISTANTS_URI = constants.url + 'search/labassistants';
    var GET_ROLES_URI = constants.url + 'admin/role-names';
    var DOWNLOAD_URI = constants.url + 'admin/download';
    var EMAIL_URI = constants.url + 'general/email';

    this.userDetails = {};
    this.authToken = '';
    this.privileges = [];

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

        setUserPrivileges: setUserPrivileges,
        getUserPrivileges: getUserPrivileges,

        isPrivilegePresent: isPrivilegePresent,
        isUserLoggedIn: isUserLoggedIn,

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
        searchLabAssistants: searchLabAssistants,
        getRoles: getRoles,
        download: download,
        viewFile: viewFile,
        sendEmail: sendEmail
    };

    return service;

    function setUserDetails(userDetails) {
        this.userDetails = userDetails;
        //console.log('User details now set :: ', this.userDetails);
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

    function setUserPrivileges(privileges) {
        $window.localStorage.setItem('csPrivileges', JSON.stringify(privileges));
    }

    function getUserPrivileges() {
        if ($window.localStorage.getItem('csPrivileges')) {
            this.privileges = JSON.parse($window.localStorage.getItem('csPrivileges'));
            return this.privileges;
        }
        return undefined;
    }

    function showLoginPage() {
        $location.path('/login');
    }

    function navigateToHome() {
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
            showLoginPage();
        }
    }

    //logout user
    function logout() {
        this.userDetails = undefined;
        this.authToken = '';
        this.privileges = [];
        $window.localStorage.removeItem('csUserDetails');
        $window.localStorage.removeItem('csAuthToken');
        $window.localStorage.removeItem('csPrivileges');
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

    // check if given privilege is present for the logged in user
    function isPrivilegePresent(priv) {
        if (getUserPrivileges()) {
            return getUserPrivileges().indexOf(priv) > -1;
        } else {
            return false;
        }
    }

    // verify if user is logged in before showing the view
    function isUserLoggedIn() {
        if (!isUserAuthenticated()) {
            logout();
            showLoginPage();
            showError('Please login to continue');
            return false;
        }
        return true;
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
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

    function searchLabAssistants(searchText) {
        var deferred = $q.defer();
        $http({
                method: 'GET',
                url: SEARCH_LAB_ASSISTANTS_URI,
                params: {
                    labAssistant: searchText
                }
            })
            .then(
                function success(response) {
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
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
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

    //download file
    function download(id, requester) {
        var deferred = $q.defer();
        $http({
                method: 'POST',
                url: DOWNLOAD_URI,
                responseType: 'arraybuffer',
                headers: {
                    'Content-Type': undefined
                },
                params: {
                    id: id,
                    requester: requester
                }
            })
            .success(function (data, status, headers, config) {
                //console.log('Download operation success - data ', data, ' - status ', status, ' - headers ', headers('filename'));

                headers = headers();

                var filename = headers['filename'];
                //console.log('file name is ', filename);
                var contentType = headers['content-type'];
                //console.log('content type of the file is ', contentType);

                var response = {};
                response.data = data;
                response.statusCode = status;
                response.filename = filename;

                deferred.resolve(response);
            })
            .error(function (data, status, headers, config) {
                //console.log('Download operation failure ', status);
                deferred.reject(data, headers, status);
            });
        return deferred.promise;
    }

    // view file
    function viewFile(id, source) {
        console.log('File Id to view is : ', id);
        //call service to download
        var promise = download(id, source);
        promise.then(function (response) {
                console.log('result : ', response);

                var fileLength = response.data.byteLength;

                if (fileLength !== 0) {
                    var url = URL.createObjectURL(new Blob([response.data], {
                        type: 'application/pdf'
                    }));
                    // open in new tab
                    $window.open(url);
                } else {
                    //notify that file does not exist for requested user
                    SharedService.showWarning("File does not exist");
                }
            })
            .catch(function (resError) {
                console.log('DOWNLOAD FAILURE :: ', resError);
                SharedService.showError('Error occurred while downloading requested file');
            });
    }

    // send email
    function sendEmail(emailDetails) {
        const deferred = $q.defer();

        const email = {
            to: emailDetails.email,
            subject: emailDetails.subject,
            content: emailDetails.content
        };

        $http.post(EMAIL_URI, JSON.stringify(email))
            .success(
                function (data, status, headers, config) {
                    console.log('Email operation success', data);
                    deferred.resolve(data);
                })
            .error(
                function (data, status, header, config) {
                    console.log('Email operation failed ', status);
                    deferred.reject(data);
                });
        return deferred.promise;
    }

}]);
