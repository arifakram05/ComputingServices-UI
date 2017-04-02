'use strict';

angular.module('computingServices.manageLabAssistants', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/manageLabAssistants', {
        templateUrl: 'templates/admin/manageLabAssistants.html',
        controller: 'ManageLabAssistantsCtrl'
    })
}])

.factory('ManageLabAssistantsService', ['$http', '$q', function ($http, $q) {

    var GET_LAB_ASSISTANTS_URI = constants.url + 'admin/viewLabAssistants';

    var factory = {
        fetchAllUsers: fetchAllUsers
            /*,
            createUser: createUser,
            updateUser:updateUser,
            deleteUser:deleteUser*/
    };

    return factory;

    function fetchAllUsers() {
        var deferred = $q.defer();
        $http({
                method: 'GET',
                url: GET_LAB_ASSISTANTS_URI
            })
            .then(
                function (response) {
                    console.log('data from web service: ', response);
                    deferred.resolve(response.data.response);
                },
                function (errResponse) {
                    console.error('Error while making service call to fetch Users');
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

    /*function createUser(user) {
        var deferred = $q.defer();
        $http.post(REST_SERVICE_URI, user)
            .then(
            function (response) {
                deferred.resolve(response.data);
            },
            function(errResponse){
                console.error('Error while creating User');
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }


    function updateUser(user, id) {
        var deferred = $q.defer();
        $http.put(REST_SERVICE_URI+id, user)
            .then(
            function (response) {
                deferred.resolve(response.data);
            },
            function(errResponse){
                console.error('Error while updating User');
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }

    function deleteUser(id) {
        var deferred = $q.defer();
        $http.delete(REST_SERVICE_URI+id)
            .then(
            function (response) {
                deferred.resolve(response.data);
            },
            function(errResponse){
                console.error('Error while deleting User');
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }*/

}])

.controller('ManageLabAssistantsCtrl', ['$scope', 'ManageLabAssistantsService', function ($scope, ManageLabAssistantsService) {

    $scope.user = {};
    $scope.las = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10

    fetchAllUsers();

    function fetchAllUsers() {
        ManageLabAssistantsService.fetchAllUsers()
            .then(
                function (data) {
                    $scope.las = data;
                },
                function (errResponse) {
                    console.error('Error while fetching Users');
                }
            );
    }

    $scope.edit = function edit(la) {
        console.log('id to be edited', la.studentId);
        /*for(var i = 0; i < $scope.users.length; i++){
            if($scope.users[i].id === id) {
                $scope.user = angular.copy($scope.users[i]);
                break;
            }
        }*/
    }

    //show LA details in a modal
    $scope.showDetails = function (la) {
        $scope.selectedLA = la;
        $('#ladModal').modal('show');
        console.log('preparing to show detail in modal ', $scope.selectedLA);
    }

    /*function createUser(user){
        ManageCareersService.createUser(user)
            .then(
            fetchAllUsers,
            function(errResponse){
                console.error('Error while creating User');
            }
        );
    }

    function updateUser(user, id){
        ManageCareersService.updateUser(user, id)
            .then(
            fetchAllUsers,
            function(errResponse){
                console.error('Error while updating User');
            }
        );
    }

    function deleteUser(id){
        ManageCareersService.deleteUser(id)
            .then(
            fetchAllUsers,
            function(errResponse){
                console.error('Error while deleting User');
            }
        );
    }

    function submit() {
        if(self.user.id===null){
            console.log('Saving New User', self.user);
            createUser(self.user);
        }else{
            updateUser(self.user, self.user.id);
            console.log('User updated with id ', self.user.id);
        }
        reset();
    }

    function remove(id){
        console.log('id to be deleted', id);
        if(self.user.id === id) {//clean form if the user to be deleted is shown there.
            reset();
        }
        deleteUser(id);
    }


    function reset(){
        self.user={id:null,username:'',address:'',email:''};
        $scope.myForm.$setPristine(); //reset Form
    }*/

}]);
