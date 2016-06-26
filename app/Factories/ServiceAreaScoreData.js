define(['application-configuration'], function (app) {

    app.register.factory('serviceAreaScoreData', [function () {
            var generalSurveyCollection = {};
            var triggerSurveyCollection = {};

            return {
                SetGeneralSurveyCollection: function(genSurveyCollection) {
                    generalSurveyCollection = genSurveyCollection;
                },
                SetTriggerSurveyCollection: function (trgSurveyCollection) {
                    triggerSurveyCollection = trgSurveyCollection;
                },
                GetGeneralSurveyCollection: function(){
                    return generalSurveyCollection;
                },
                GetTriggerSurveyCollection: function(){
                    return triggerSurveyCollection;
                }
            };
        }]);
})
