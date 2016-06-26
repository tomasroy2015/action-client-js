"use strict";
define(['application-configuration'], function (app) {

    app.register.directive('actionQuestionScore', function () {
        var boxId = 1;
        return {
            restrict: 'EA',
            scope   : {
                questionItem:'=',
                colorSettings:'='
            },

            templateUrl: "Views/List/QuestionScoresTemplate.html",
            replace    : true,
            link       : function (scope, el, attr) {
                var scoreRect=el[0].children[0].children[0].children[0];
                scope.$watch( function(scope){ return scope.questionItem}, function(newValue,oldValue){
                    if(angular.isUndefined(newValue))
                    {
                        newValue = oldValue;
                    }
                    //QuestionText
                    var score = newValue.Score;
                    scope.QuestionText=newValue.QuestionText;
                    var colorCode=newValue.ScoreComparatorColor.ColorCode;
                    scoreRect.setAttribute("fill",colorCode);
                    if(!isNaN(score))
                    {
                        scope.scoreTex=score;
                    }
                    else
                        scope.scoreTex="";
                },true);
                //console.log("Score obj value is :"+scope.scoreObj.Score);
            }

        };
    });
});