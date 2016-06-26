define(['application-configuration'], function (app) {

    app.register.factory('moreSettingsFactory', ['$rootScope','Notify',
        function ($rootScope,Notify) {

            var siteMinResp = 0,
                countryMinResp = 0,
                defaultZoomLevel = 1;

            var selectedColorSet = {
                OnTarget : "#4BAC4B",
                CloseToTarget:"#FB9838",
                FarFromTarget:"#E33833"
            }

            function getColorForIdScore(id,score){
                var colorCode = "#FFFFFF";
                if(score == -1){
                    return "#555759"; //dark Gray
                }

                if(id.indexOf("OS")>-1){

                    if( score>0 && score<6){
                        colorCode=selectedColorSet.FarFromTarget;
                    }
                    else if( score ==6){
                        colorCode=selectedColorSet.CloseToTarget;
                    }
                    else if(score > 6){
                        colorCode=selectedColorSet.OnTarget;
                    }
                }
                else if(id.indexOf("SES")>-1){
                    if( score>0 && score<4){
                        colorCode=selectedColorSet.FarFromTarget;
                    }

                    else if(score > 3){
                        colorCode=selectedColorSet.OnTarget;
                    }

                }
                else {
                    if( score>0 && score<3){
                        colorCode=selectedColorSet.FarFromTarget;
                    }
                    else if(score > 2){
                        colorCode=selectedColorSet.OnTarget;
                    }
                }
                return colorCode;
            }


            return {
                SetMinimumRespondentForSite: function (minResp) {
                    siteMinResp = minResp;
                },
                SetMinimumRespondentForCountry: function (minResp) {
                    countryMinResp = minResp;
                },
                SetDefaultZoomLevel: function (value) {
                    defaultZoomLevel = value;
                },
                SetColorSet: function (onTarget,closeToTarget,farFromTarget) {
                    selectedColorSet.OnTarget = onTarget;
                    selectedColorSet.CloseToTarget = closeToTarget;
                    selectedColorSet.FarFromTarget = farFromTarget;

                    //$rootScope.$broadcast(Notify.COMPARATOR_COLOR_CHANGED);

                },

                GetMinimumResponseForSite: function(){
                  return siteMinResp;
                },
                GetMinimumResponseForCountry: function(){
                    return countryMinResp;
                },
                GetDefaultZoomLevel: function(){
                    return defaultZoomLevel;
                },
                GetSelectedColorSet: function(){
                    return selectedColorSet;
                },
                GetColorCodeByIdScore:function(id,score){
                  return   getColorForIdScore(id,score);
                }
            };

        }]);
})

