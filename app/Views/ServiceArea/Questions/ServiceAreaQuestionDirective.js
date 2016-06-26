"use strict";

define(['application-configuration'], function (app) {

    app.register.directive('actionServiceAreaQuestion', [function () {

        var uid = 1;
        return {
            restrict: 'AE',

            scope:{
              score:'=',
               question:'='
            },
            templateUrl: 'Views/ServiceArea/Questions/ServiceAreaQuestionTemplate.html',
            link:function (scope, el, attr) {
                var item = 'item' + uid++;
                var obj = scope.question;
                el.find('canvas').attr('id', item);
                var id = document.getElementById(item);
                var ctx = id.getContext('2d');
                var totalScorebarWidth = 57;
                var colorBarWidth = (57* scope.score)/100;
                var shortageScoreBarWidth = totalScorebarWidth-colorBarWidth;

                ctx.beginPath();
                ctx.rect(0,9,colorBarWidth,7);
                ctx.fillStyle = 'green';
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.rect(colorBarWidth, 9, shortageScoreBarWidth, 7);
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.rect(scope.score > 0 ? scope.score : 0, 4, 3, 17);
                ctx.fillStyle = 'gray';
                ctx.fill();
            }
        };

    }]);

});