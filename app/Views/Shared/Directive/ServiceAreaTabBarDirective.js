"use strict";

define(['application-configuration'], function (app) {

    app.register.directive('actionServiceArea', [function () {

        return {
            restrict: 'AE',
            scope   : {
                serviceAreaCollection: "=data",
                selectedItem: '=',
                selectedServiceAreaId: '=',
                padding:'@',
                itemClick:'&'
            },
            link    : function (scope, el, attrs) {
                //scope.selectedServiceArea = {};
                //
                //scope.selectedServiceArea = function(data){
                //    scope.itemClick({selectedItem:data});
                //},

                //itemClick({selectedItem:eachSA})

                scope.serviceAreaId = attrs.id;

                scope.onClickDir = function(eachSA){
                    scope.itemClick({selectedItem:eachSA});
                }
                scope.$watch('serviceAreaCollection', function (newValue,oldValue) {
                    if(!angular.isUndefined(newValue))
                        return scope.render(newValue);
                },true);
                scope.render = function(data) {
                    scope.serviceAreaCollection = data;
                };
            },
            templateUrl:'Views/Shared/Template/ServiceAreaTabBarTemplate.html'
        };
    }]);
});
