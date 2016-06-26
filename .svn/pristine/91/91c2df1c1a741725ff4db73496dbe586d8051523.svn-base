"use strict";

define(['application-configuration'], function (app) {

    app.register.directive('actionDataSetAccordion', [function () {

        return {
            restrict: 'AE',
            scope   : {
                dataset: "=data"
            },
            link    : function (scope,el, attrs) {
                scope.$watch(function(scope) {return scope.dataset.resetFilterOrView}, function (newValue,oldValue) {
                    scope.resetFilterOrView = newValue;
                });
            },
            templateUrl:'Views/DatasetAccordion/DatasetTemplate.html'
        };

    }]);

});