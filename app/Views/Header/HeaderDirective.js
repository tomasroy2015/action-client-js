"use strict";

define(['application-configuration'], function (app) {

    app.register.directive('actionHeader', [function () {

        return {
            restrict   : 'AE',
            scope      : {
                logOutEvent: '&'
            },
            templateUrl: 'Views/Header/HeaderTemplate.html'
        };

    }]);
});
