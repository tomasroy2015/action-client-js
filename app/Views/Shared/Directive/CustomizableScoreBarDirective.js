"use strict";
define(['application-configuration'], function (app) {
    app.register.directive("actionCustomizableScoreBar",['moreSettingsFactory',function (moreSettingsFactory) {
        var uid = 1;
        return {
            restrict: 'EA',
            scope: {
                scoreComparator: '=',
                canvasid: '=',
                isOsScore: '=',
                width: '=',
                data:'=',
                scoreText:'@',
                showComparator:'@'
            },
            templateUrl: "Views/Shared/Template/CustomizableScoreBarTemplate.html",
            replace: false,
            link: function (scope, el, attr) {
                var svg=el[0].children[1].children[1];
                var svgChildren = svg.children || svg.childNodes;

                var tmp = [];
                for (var i=0; i < svgChildren.length; i++){
                    if (svgChildren[i].nodeType == 1) {
                        tmp.push(svgChildren[i]);
                    };
                }
                //var scoreBarMain=svg.children[0];
                //var coloredScoreBar= svg.children[1];
                //var comparatorScoreBar=svg.children[2];
                //var doubleTargetScoreBar=svg.children[3];

                var scoreBarMain=tmp[0];
                var coloredScoreBar= tmp[1];
                var shortageScoreBar = tmp [2];
                var doubleTargetScoreBar=tmp[3];
                var comparatorScoreBar=tmp[4];


                scope.$watch(function(scope) {return scope.data || scope.showComparator}, function (newValue,oldValue) {

                    scope.showComparator = scope.showComparator || 'true';
                    scope.isShowComparator = scope.showComparator === 'true';

                    if(angular.isUndefined(newValue)) return;
                    scope.isShowComparator =  scope.isShowComparator && !isNaN(newValue.Comparator);
                    var score = newValue.Score;
                    var comparator = newValue.Comparator;
                    var colorCode = newValue.ScoreColor;
                    var doubleTarget=newValue.DoubleTarget;
                    var isOsScore = (newValue.QuestionId === 'OS' ? true : false) || scope.isOsScore;
                    var colorSettings=moreSettingsFactory.GetSelectedColorSet();

                    var valueMaxRange = 0;
                    var valueMinRange = 0;
                    if (newValue.isOsScore) {
                        valueMaxRange = 10;
                    }
                    else {
                        valueMaxRange = 100;
                    }
                    var pixelThreshold = 0.5;
                    var calculatedScore = getNormalizedValue(score, valueMaxRange, valueMinRange, scope.width, 0.5);
                    var calculatedComparatorValue = getNormalizedValue(comparator, valueMaxRange, valueMinRange, scope.width, 0.5);
                    //var calculatedDoubleTargetValue = getNormalizedValue(doubleTarget, valueMaxRange, valueMinRange, scope.width, 0.5);

                    svg.setAttribute("height",20);
                    svg.setAttribute("width",scope.width);

                    var totalScoreBarWidth = scope.width;
                    var colorBarWidth = calculatedScore * (isOsScore ? 10 : 1);
                    var comparatorPosition = calculatedComparatorValue * (isOsScore ? 10 : 1);
                    //var doubleTargetPosition = calculatedDoubleTargetValue * (isOsScore ? 10 : 1);

                    scoreBarMain.setAttribute("x",0.5);
                    scoreBarMain.setAttribute("y",8.5);
                    scoreBarMain.setAttribute("height",7);
                    scoreBarMain.setAttribute("width",totalScoreBarWidth - pixelThreshold);
                    scoreBarMain.setAttribute("fill","#ffffff");
                    scoreBarMain.style.stroke="#878787";

                    colorBarWidth=colorBarWidth - pixelThreshold;
                    coloredScoreBar.setAttribute("x",0.5);
                    coloredScoreBar.setAttribute("y",8.5);
                    coloredScoreBar.setAttribute("height",7);
                    coloredScoreBar.setAttribute("width",colorBarWidth>0?colorBarWidth:0);
                    coloredScoreBar.setAttribute("fill",colorCode);
                    coloredScoreBar.style.stroke=colorCode;

                    if(colorSettings.OnTarget != colorCode && !isNaN(score) && (calculatedComparatorValue > calculatedScore)){
                        var shortageScoreBarWidth = comparatorPosition - colorBarWidth - pixelThreshold;
                        shortageScoreBar.setAttribute("width",shortageScoreBarWidth);
                        shortageScoreBar.setAttribute("fill",colorCode);
                        shortageScoreBar.setAttribute("fill-opacity",0.4);
                        shortageScoreBar.setAttribute("height",7);
                        shortageScoreBar.setAttribute("x",colorBarWidth>0?colorBarWidth:0);
                        shortageScoreBar.setAttribute("y",8.5);
                        shortageScoreBar.style.stroke = colorCode;
                    }
                    else{
                        shortageScoreBar.setAttribute("width",0);
                        shortageScoreBar.setAttribute("fill","none");
                        shortageScoreBar.setAttribute("fill-opacity",0.4);
                        shortageScoreBar.setAttribute("x",0);
                        shortageScoreBar.setAttribute("y",8.5);
                        shortageScoreBar.setAttribute("height",7);
                        shortageScoreBar.style.stroke = "none";
                    }


                    if(!isNaN(newValue.Comparator)){
                        comparatorScoreBar.setAttribute("x",comparatorPosition > 3 ? comparatorPosition - 3 : 0);
                        comparatorScoreBar.setAttribute("y",5);
                        comparatorScoreBar.setAttribute("height",20);
                        comparatorScoreBar.setAttribute("width",3);
                        comparatorScoreBar.setAttribute("fill","#878787");
                    }
                    else{
                        comparatorScoreBar.setAttribute("x",0);
                        comparatorScoreBar.setAttribute("y",0);
                        comparatorScoreBar.setAttribute("height",0);
                        comparatorScoreBar.setAttribute("width",0);
                        comparatorScoreBar.setAttribute("fill","#ffffff");
                    }
                    if(!isNaN(doubleTarget)){
//                        var doubleTargetPosition = doubleTarget * (scope.isOsScore?10:1);
                        var doubleTargetComparatorValue = getNormalizedValue(doubleTarget, valueMaxRange, valueMinRange, scope.width, 0.5);
                        var doubleTargetPosition = doubleTargetComparatorValue * (isOsScore ? 10:1);
                        doubleTargetScoreBar.setAttribute("x",doubleTargetPosition>3?doubleTargetPosition-3:0);
                        doubleTargetScoreBar.setAttribute("y",5);
                        doubleTargetScoreBar.setAttribute("height",20);
                        doubleTargetScoreBar.setAttribute("width",3);
                        doubleTargetScoreBar.setAttribute("fill","#c6c6c6");
                    }
                    else{
                        doubleTargetScoreBar.setAttribute("x",0);
                        doubleTargetScoreBar.setAttribute("y",0);
                        doubleTargetScoreBar.setAttribute("height",0);
                        doubleTargetScoreBar.setAttribute("width",0);
                        doubleTargetScoreBar.setAttribute("fill","#ffffff");
                    }
                    scope.scoreText = isNaN(score) ? "" : isOsScore ? score : score + "%";
                });
            }
        }
    }]);

    function getNormalizedValue(value, valueMaxRange, valueMinRange, targetedValueMaxRange, targetedValueMinRange) {
        /*value normalization formula implement here*/
        var normalizedValueInTargatedRange = (value - valueMinRange) * (targetedValueMaxRange - targetedValueMinRange)
            / (valueMaxRange - valueMinRange) + targetedValueMinRange;
        // console.log("normalized value: "+normalizedValueInTargatedRange);
        return normalizedValueInTargatedRange;
    }

});