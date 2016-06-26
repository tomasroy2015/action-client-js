"use strict";
define(['application-configuration'], function (app) {
    app.register.directive("actionScoreBar",['moreSettingsFactory',function (moreSettingsFactory) {
        return {
            restrict   : 'EA',
            scope      : {
                scoreComparator: '=',
                isOsScore:'='
            },
            templateUrl: "Views/Shared/Template/ScoreBarTemplate.html",
            replace: false,
            link   : function (scope, el, attr) {

                /**
                 * var selectedColorSet = {
                OnTarget : "#4BAC4B",
                CloseToTarget:"#FB9838",
                FarFromTarget:"#E33833"
                }
                */

                var svg =el[0].children[1].children[1];
                var svgChildren = svg.children || svg.childNodes;
                var tmp = [];
                for (var i=0; i < svgChildren.length; i++){
                    if (svgChildren[i].nodeType == 1) {
                        tmp.push(svgChildren[i]);
                    };
                }

                var scoreBarMain = tmp[0];
                var coloredScoreBar= tmp[1];
                var shortageScoreBar = tmp [2];
                var doubleTargetScoreBar = tmp[3];
                var comparatorScoreBar = tmp[4];

                /*var scoreBarMain=svg.children[0];
                var coloredScoreBar= svg.children[1];
                var comparatorScoreBar=svg.children[2];
                var doubleTargetScoreBar=svg.children[3];*/

                scope.$watch( function(scope){ return scope.scoreComparator}, function(newValue,oldValue){
                    scope.baseScore = "";
                    scope.comparatorValue="";
                    if(angular.isUndefined(newValue))
                    {
                        newValue = oldValue;
                    }

                    var colorSettings=moreSettingsFactory.GetSelectedColorSet();
                    var score = newValue.Score;
                    var comparator  = newValue.ComparatorValue;
                    scope.comparatorValue= newValue.ComparatorValue;
                    var doubleTarget=newValue.DoubleTarget;
                    var colorCode = newValue.ComparatorColorCode;
                    var coloredBarLength =  score  * (scope.isOsScore?10:1);
                    //rect(x,y,width,height)
                    coloredScoreBar.setAttribute("width",coloredBarLength>3?coloredBarLength-3:coloredBarLength);
                    coloredScoreBar.setAttribute("fill",colorCode);
                    coloredScoreBar.style.stroke = colorCode;
                    if(colorSettings.OnTarget != colorCode && !isNaN(score) && (comparator > score)){

                        var offset = scope.isOsScore?10:1;
                        var shortageScoreBarWidth = (comparator * offset) - (score * offset);
                        shortageScoreBar.setAttribute("width",shortageScoreBarWidth);
                        shortageScoreBar.setAttribute("fill",colorCode);
                        shortageScoreBar.setAttribute("fill-opacity",0.4);
                        shortageScoreBar.setAttribute("x",coloredBarLength>3?coloredBarLength-3:coloredBarLength);
                        shortageScoreBar.setAttribute("y",8.5);
                        shortageScoreBar.style.stroke = colorCode;
                    }
                    else{
                        shortageScoreBar.setAttribute("width",0);
                        shortageScoreBar.setAttribute("fill","none");
                        shortageScoreBar.setAttribute("fill-opacity",0.4);
                        shortageScoreBar.setAttribute("x",0);
                        shortageScoreBar.setAttribute("y",8.5);
                        shortageScoreBar.style.stroke = "none";
                    }

                    if(!isNaN(comparator)){
                        var comparatorPosition = comparator * (scope.isOsScore?10:1);
                        comparatorScoreBar.setAttribute("x",comparatorPosition>3?comparatorPosition-3:0);
                        comparatorScoreBar.setAttribute("y",3);
                        comparatorScoreBar.setAttribute("height",18);
                        comparatorScoreBar.setAttribute("width",3);
                        comparatorScoreBar.setAttribute("fill","#878787");
                    }
                    else{
                        scope.comparatorValue="";
                        comparatorScoreBar.setAttribute("x",0);
                        comparatorScoreBar.setAttribute("y",0);
                        comparatorScoreBar.setAttribute("height",0);
                        comparatorScoreBar.setAttribute("width",0);
                        comparatorScoreBar.setAttribute("fill","#ffffff");
                    }
                    if(!isNaN(doubleTarget)){
                        var doubleTargetPosition = doubleTarget * (scope.isOsScore?10:1);
                        doubleTargetScoreBar.setAttribute("x",doubleTargetPosition>3?doubleTargetPosition-3:0);
                        doubleTargetScoreBar.setAttribute("y",3);
                        doubleTargetScoreBar.setAttribute("height",18);
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
                    scope.baseScore = isNaN(score) ? "" : scope.isOsScore ? score : score + "%";
                })
            }
        }
    }]);//#868888
});