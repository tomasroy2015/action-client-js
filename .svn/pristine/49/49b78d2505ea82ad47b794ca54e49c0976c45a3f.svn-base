
"use strict";

define(['application-configuration'], function (app) {

    app.register.directive('actionScoreBox', [function () {
        return {
            restrict: 'AE',
            scope:{
                generalSurveyCollection:'=',
                triggerSurveyCollection:'=',
                scoreDataCollection:'=',
                scoreBarWidth:'=',
                selectedQuestionId:'=',
                selectedServiceAreaId:'=',
                onTabItemClick:'&',
                onQuestionItemClick:'&'
            },
            link:function (scope, el, attrs) {
                scope.onClickDir = function(selectedItem){
                    scope.onTabItemClick({selectedId:selectedItem});
                };

                scope.onQuestionClick = function(selectedItem){
                  scope.onQuestionItemClick({selectedItem:selectedItem})
                };
            },
            templateUrl: 'Views/Shared/Template/ScoreBoxTemplate.html'
        };
    }]);

});