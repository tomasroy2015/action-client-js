"use strict";
define(['application-configuration'], function (app) {
    app.register.directive("actionLoadingOverlay", function () {
        var uid = 1;
        return {
            restrict   : 'EA',
            scope      : {
                title: '='
            },
            templateUrl: "Views/Shared/Template/LoadingOverlayTemplate.html",
            replace    : false,
            link       : function (scope, el, attr) {
            }
        }
    });
});
