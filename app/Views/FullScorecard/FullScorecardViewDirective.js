"use strict";

define(['application-configuration'], function (app) {

    app.register.directive('actionFullScorecardView', ['$timeout',function () {

        return {
            restrict: "E",
            transclude:false,
            scope:{},
            templateUrl: 'Views/FullScorecard/FullScorecardView.html'
        };
    }]);

});

