define(['application-configuration'], function (app) {
    app.register.directive('actionFrequencyBar', [function () {
        return{
            restrict: 'E',
            scope: {
                scoreFrequency: "=",
                selectedAttribute: "=",
                colorSet:"="
            },
            template: '<div id="scoreBar" class="os-frequency-bar"></div>',
            link: function (scope, el, attr) {
                scope.$watch(function (scope) {return scope.selectedAttribute }, function (newValue, oldValue) {
                    var barValue = scope.scoreFrequency.Frequency == 0 ? 0 : (scope.scoreFrequency.Frequency / newValue.NoOfRespondent) * 100;
                    var bar = el.find('#scoreBar');
                    $(bar).css({"height": (barValue*154)/100 + 'px'});

                    if(scope.selectedAttribute.QuestionId == "OS"){
                       if(scope.scoreFrequency.AnswerType < 6){
//                           $(bar).addClass('bg-color-red');
                           $(bar).css({"background-color": scope.colorSet.FarFromTarget});
                       }
                       else if(scope.scoreFrequency.AnswerType == 6){
//                           $(bar).addClass('bg-color-orange');
                           $(bar).css({"background-color": scope.colorSet.CloseToTarget});
                       }
                       else{
//                            $(bar).addClass('bg-color-green');
                           $(bar).css({"background-color": scope.colorSet.OnTarget});
                        }
                    }
                    else if(scope.selectedAttribute.QuestionId == "SES" || scope.selectedAttribute.Id == "SES"){
                        if(scope.scoreFrequency.AnswerType < 4){
//                            $(bar).addClass('bg-color-red');
                            $(bar).css({"background-color": scope.colorSet.FarFromTarget});
                        }
//                        else if(scope.scoreFrequency.AnswerType == 4){
////                            $(bar).addClass('bg-color-orange');
//                            $(bar).css({"background-color": scope.colorSet.CloseToTarget});
//                        }
                        else{
//                            $(bar).addClass('bg-color-green');
                            $(bar).css({"background-color": scope.colorSet.OnTarget});
                        }
                    }
                });
            }
        };
    }]);

});