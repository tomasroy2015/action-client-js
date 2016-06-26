"use strict";

define(['application-configuration','lodash'], function (app) {

    app.register.directive('actionAttributeEvaluationSummary', [function () {

        return {
            restrict: 'AE',

            scope:{
                index:'=',
                score:'=',
                question:'=',
                colorSet:'='
            },
            templateUrl: 'Views/Shared/Template/AttributeEvaluationSummaryTemplate.html',
            link:function (scope, el, attr) {
//                scope.setTooltipBg= function(){
//                    var tooltip = document.getElementsByClassName('tooltip-inner')[0];
//                    $(tooltip).css({" background-color": '#fff',"color":'#000'});
//                };
                scope.$watch(function(scope) {return scope.question}, function (newValue,oldValue) {

                    if(!angular.isUndefined(newValue)) {

                        if(angular.isUndefined(newValue.frequency1)) return;

                        scope.questionText = "";
                        scope.scoreText = "";

                        if(newValue.QuestionId.indexOf('SES') >= 0){
                            var barValue1 = newValue.frequency1.Frequency == 0 ? 0 : (newValue.frequency1.Frequency / newValue.NoOfRespondent) * 100;
                            var barValue2 = newValue.frequency2.Frequency == 0 ? 0 : (newValue.frequency2.Frequency / newValue.NoOfRespondent) * 100;
                            var barValue3 = newValue.frequency3.Frequency == 0 ? 0 : (newValue.frequency3.Frequency / newValue.NoOfRespondent) * 100;
                            var barValue4 = newValue.frequency4.Frequency == 0 ? 0 : (newValue.frequency4.Frequency / newValue.NoOfRespondent) * 100;
                            var barValue5 = newValue.frequency5.Frequency == 0 ? 0 : (newValue.frequency5.Frequency / newValue.NoOfRespondent) * 100;
                            var barValue6 = newValue.frequency6.Frequency == 0 ? 0 : (newValue.frequency6.Frequency / newValue.NoOfRespondent) * 100;
                            scope.questionText = "Score";
                            scope.scoreText = (newValue.Score <= 0 || newValue.Score.toString() == 'NaN') ? '' : newValue.Score.toString();

                            var bar1 = el.find('#ses-frequency-bar1');
                            $(bar1).css({"height": (barValue1*38)/100 + 'px',"background-color":scope.colorSet.FarFromTarget});

                            var bar2 = el.find('#ses-frequency-bar2');
                            $(bar2).css({"height": (barValue2*38)/100 + 'px',"background-color":scope.colorSet.FarFromTarget});

                            var bar3 = el.find('#ses-frequency-bar3');
                            $(bar3).css({"height": (barValue3*38)/100 + 'px',"background-color":scope.colorSet.FarFromTarget});

                            var bar4 = el.find('#ses-frequency-bar4');
                            $(bar4).css({"height": (barValue4*38)/100 + 'px',"background-color":scope.colorSet.OnTarget});

                            var bar5 = el.find('#ses-frequency-bar5');
                            $(bar5).css({"height": (barValue5*38)/100 + 'px',"background-color":scope.colorSet.OnTarget});

                            var bar6 = el.find('#ses-frequency-bar6');
                            $(bar6).css({"height": (barValue6*38)/100 + 'px',"background-color":scope.colorSet.OnTarget});

                            $('.negative-label').css({"background-color":scope.colorSet.FarFromTarget});
                            $('.positive-label').css({"background-color":scope.colorSet.OnTarget});
                        }else{
                            var barValue1 = newValue.frequency1.Frequency == 0 ? 0 : (newValue.frequency1.Frequency / newValue.NoOfRespondent) * 100;
                            var barValue2 = newValue.frequency2.Frequency == 0 ? 0 : (newValue.frequency2.Frequency / newValue.NoOfRespondent) * 100;
                            var barValue3 = newValue.frequency3.Frequency == 0 ? 0 : (newValue.frequency3.Frequency / newValue.NoOfRespondent) * 100;
                            var barValue4 = newValue.frequency4.Frequency == 0 ? 0 : (newValue.frequency4.Frequency / newValue.NoOfRespondent) * 100;
                            scope.questionText = newValue.QuestionText;
                            scope.scoreText = (newValue.Score <= 0 || newValue.Score.toString() == 'NaN') ? '' : newValue.Score.toString();

                            var bar1 = el.find('#frequency-bar1');
                            $(bar1).css({"height": (barValue1*38)/100 + 'px',"background-color":scope.colorSet.FarFromTarget});

                            var bar2 = el.find('#frequency-bar2');
                            $(bar2).css({"height": (barValue2*38)/100 + 'px',"background-color":scope.colorSet.FarFromTarget});

                            var bar3 = el.find('#frequency-bar3');
                            $(bar3).css({"height": (barValue3*38)/100 + 'px',"background-color":scope.colorSet.OnTarget});

                            var bar4 = el.find('#frequency-bar4');
                            $(bar4).css({"height": (barValue4*38)/100 + 'px',"background-color":scope.colorSet.OnTarget});

                        }
                    }
                });
                if (attr.toggle=="tooltip"){
                    $(el).tooltip();
                }
            }
        };

    }]);

});
