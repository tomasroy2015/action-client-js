"use strict";
define(['application-configuration'], function (app) {
    app.register.directive("actionAnswerHeaderGrp", function () {

        return {
            templateUrl: "Views/Shared/Template/Evaluation/EvaluationUIGrid/HeaderColumnGroup/AnswerHeaderGrpTemplate.html",
            link   : function (scope, el, attr) {
                if(angular.isUndefined(scope.evaluationUiGridConfig.columnDefs))
                return;
                scope.$watch(function(scope){return scope.evaluationUiGridConfig.columnDefs},function(newValue,oldValue){
                    scope.headerRowHeight = 30;
                    scope.catHeaderRowHeight = scope.headerRowHeight + 'px';
                    scope.categories = [];
                    var lastDisplayName = "";
                    var totalWidth = 0;
                    var left = 0;
                    var cols=newValue;
                    for(var i=0;i<cols.length;i++)
                    {
                        totalWidth += Number(cols[i].width);
                        var displayName = (typeof(cols[i].columnHeaderGrpDisplayName) === "undefined") ?
                            "\u00A0" : cols[i].columnHeaderGrpDisplayName;

                        if (displayName !== lastDisplayName) {

                            scope.categories.push({
                                displayName: lastDisplayName,
                                width: totalWidth - Number(cols[i].width),
                                widthPx: (totalWidth - Number(cols[i].width)) + 'px',
                                left: left,
                                leftPx: left + 'px'
                            });

                            left += (totalWidth - Number(cols[i].width));
                            totalWidth = Number(cols[i].width);
                            lastDisplayName = displayName;
                        }
                    }

                    if (totalWidth > 0) {

                        scope.categories.push({
                            displayName: lastDisplayName,
                            width: totalWidth,
                            widthPx:totalWidth +'px',
                            left: left,
                            leftPx: left + 'px'
                        });
                    }
                },true)


            }
        };
    });
});