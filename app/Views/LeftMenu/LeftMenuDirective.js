
"use strict";

define(['application-configuration'], function (app) {

    app.register.directive('actionLeftMenu', [function () {

        return {
            restrict: 'AE',
            templateUrl: 'Views/LeftMenu/LeftMenuTemplate.html'
        }

    }]);

});
