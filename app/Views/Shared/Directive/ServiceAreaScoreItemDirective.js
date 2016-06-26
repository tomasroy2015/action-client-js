"use strict";

define(['application-configuration'], function (app) {

    app.register.directive('actionServiceAreaQuestion', [function () {

        var uid = 1;
        return {
            restrict: 'AE',

            scope:{
              data:'=',
              width: '=',
              isOsTypeQuestion: '@'
            },
            templateUrl: 'Views/Shared/Template/ServiceAreaScoreItemTemplate.html',
            link:function (scope, el, attr) {
                scope.isOsTypeQuestion =  scope.data.QuestionId == 'OS' ? true : false;
            }
        };

    }]);

});