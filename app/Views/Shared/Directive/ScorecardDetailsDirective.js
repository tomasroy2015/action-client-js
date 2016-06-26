"use strict";

define(['application-configuration','comparatorFactory'], function (app) {

    app.register.directive('actionScorecardDetails', ['comparatorFactory',function (comparatorFactory) {

        return {
            restrict: 'AE',
            scope: {
                surveyData:'=',
                headerData:'=',
                surveyType:'@',
                title:'@'
            },
            link: function (scope, el, attrs) {
                scope.comparatorSettings = comparatorFactory;
            },
            templateUrl: 'Views/Shared/Template/ScorecardDetailsTemplate.html'
        };

    }]);

});

