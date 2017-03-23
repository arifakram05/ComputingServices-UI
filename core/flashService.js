'use strict';

angular.module('computingServices')

.factory('FlashService', ['$rootScope', function ($rootScope) {

    var service = {};

    service.Success = Success;
    service.Error = Error;

    initService();

    return service;

    function initService() {
        $rootScope.$on('$locationChangeStart', function () {
            clearFlashMessage();
        });

        function clearFlashMessage() {
            var flash = $rootScope.flash;
            if (flash) {
                console.log('keepafterlocationchange: '+flash.keepAfterLocationChange);
                if (!flash.keepAfterLocationChange) {
                    console.log('not changing flash messages');
                    delete $rootScope.flash;
                } else {
                    // only keep for a single location change
                    console.log('making flash messages false');
                    flash.keepAfterLocationChange = false;
                }
            }
        }
    }

    function Success(message, keepAfterLocationChange) {
        $rootScope.flash = {
            message: message,
            type: 'success',
            keepAfterLocationChange: keepAfterLocationChange
        };
    }

    function Error(message, keepAfterLocationChange) {
        $rootScope.flash = {
            message: message,
            type: 'error',
            keepAfterLocationChange: keepAfterLocationChange
        };
    }

}]);
