"use strict";
define(['application-configuration'], function (app) {
    app.register.directive("actionEvaluationSpeechBubble", function () {
        var uid = 1;
        return {
            restrict   : 'EA',
            scope      : {
                evaluationCount: '='
            },
            //template: '<div><table>' + '<tr><td><span>{{score}}&nbsp;%</span></td>' + '<td><canvas id="{{::canvasid}}" width="100px" height="100px"></canvas></td>' +
            //'</tr></table></div>',
            templateUrl: "Views/Shared/Template/EvaluationSpeechBubbleTemplate.html",
            replace    : false,
            link       : function (scope, el, attr) {

            }
        }
    });
});