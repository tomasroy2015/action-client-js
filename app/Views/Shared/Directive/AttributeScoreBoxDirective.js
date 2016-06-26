"use strict";

define(['application-configuration'], function (app) {

    app.register.directive('actionAttributeScoreBox', [function () {

        var uid = 1;
        return {
            restrict: 'AE',

            scope:{
                score:'=',
                question:'='
            },
            templateUrl: 'Views/Shared/Template/AttributeScoreBoxTemplate.html',
            link:function (scope, el, attr) {
                scope.$watch(function(scope) {return scope.question}, function (newValue) {
                    scope.question = newValue;
                });
           }
        };

    }]);

});