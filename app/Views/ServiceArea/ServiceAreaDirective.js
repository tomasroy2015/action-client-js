"use strict";

define(['application-configuration'], function (app) {

    app.register.directive('actionServiceArea', [function () {

        return {
            restrict: 'AE',
            scope   : {
                serviceAreaCollection: "=data"
            },
            link    : function (scope, el, attrs) {
                scope.$watch('serviceAreaCollection', function (newValue,oldValue) {
                    if(!angular.isUndefined(newValue))
                        return scope.render(newValue);
                },true);
                scope.render = function(data) {
                    scope.serviceAreaCollection = data;
                };
            },
            templateUrl:'Views/ServiceArea/ServiceAreaTemplate.html'
        };
    }]);
});
