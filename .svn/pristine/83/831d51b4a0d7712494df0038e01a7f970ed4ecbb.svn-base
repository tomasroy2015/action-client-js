"use strict";

define(['application-configuration'], function (app) {

    app.register.directive('actionOverallEvaluationSummary', [function () {

        return {
            restrict: 'AE',

            scope:{
               selectedAttributeScore:"=",
               colorSet:"="
            },
            templateUrl: 'Views/Shared/Template/OSEvaluationSummaryTemplate.html',
            link:function (scope, el, attr) {
                scope.selectedData = {};
                scope.$watch(function(scope){return scope.selectedAttributeScore},function(newValue){
                    if(angular.isUndefined(newValue)) return;
                    scope.selectedData = newValue;
                });
            }
        };

    }]);

});

