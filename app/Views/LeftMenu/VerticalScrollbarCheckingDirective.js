"use strict";

define(['application-configuration'], function (app) {

    app.register.directive('actionVerticalScrollbarCheck', ['$rootScope',function ($rootScope) {

        return {
            restrict: 'A',
            link: function (scope, element) {
                scope.$watch(
                    function() {
                        if(element && element.length > 0)
                            //return element.get(0).scrollHeight;
                            return element[0].scrollHeight;
                    },
                    function() {
                        //if(element.get(0).scrollHeight > element.height()) {
                        //    $rootScope.$broadcast('resize');
                        //}
                        $rootScope.$broadcast('resize');
                    }
                );

                //this.get(0).scrollHeight > this.height()
            }
        }


    }]);

});

