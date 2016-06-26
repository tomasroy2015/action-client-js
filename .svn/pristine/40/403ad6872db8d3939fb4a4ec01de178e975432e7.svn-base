define(['application-configuration', 'ajaxService'], function (app) {

    app.register.service('eventDispatchService', ['$http', 'ajaxService','$rootScope', function ($http, ajaxService,$rootScope) {

        var sharedService = {};

        sharedService.message = '';

        sharedService.prepForBroadcast = function(msg) {
            this.message = msg;
            this.broadcastItem();
        };

        sharedService.broadcastItem = function() {
            $rootScope.$broadcast('logedInEvent');
        };
        return sharedService;
    }]);
});
