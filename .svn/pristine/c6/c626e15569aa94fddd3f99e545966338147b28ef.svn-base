"use strict";
define(['application-configuration'], function (app) {
    app.register.directive("actionColorSet", function () {
        return {
            restrict: 'EA',
            scope   : {
                colorSet:'='
            },
            link       : function (scope, el, attr) {
                var colorSet = scope.colorSet;
                var farTarget = colorSet.FarFromTarget.toString().replace('0x','#');
                var closeTarget = colorSet.CloseToTarget.toString().replace('0x','#');
                var onTarget = colorSet.OnTarget.toString().replace('0x','#');

                var id1 = el.find('#colorFirst');
                $(id1).css({ "color": farTarget });

                var id2 = el.find('#colorSecond');
                $(id2).css({ "color": closeTarget });

                var id3 = el.find('#colorThird');
                $(id3).css({ "color": onTarget });

            },
            templateUrl: "Views/LeftMenuSettings/ColorSetTemplate.html"
        }
    });
});