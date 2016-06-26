define(['application-configuration'], function (app) {

    app.register.factory('leftMenuSlidingWindowEventNotifyFactory', [
        function () {
            var isDatasetLoadEventClicked = false,
                isCompareSetttingsOkBtnClicked = false,
                isMoreSettingsOKbtnClicked = false,
                isCompareSetttingsOkBtnEvent = {},
                CompareSetttingsOkBtnClicked ={};
            return {
                getDatasetLoadEvent: function () {
                    return isDatasetLoadEventClicked;
                },
                setDatasetLoadEvent:function(val){
                    if(isDatasetLoadEventClicked !== val) {
                        isDatasetLoadEventClicked = val;
                    }
                },
                getCompareSettingsOkBtnEvent:function(){
                    //CompareSetttingsOkBtnClicked.IsClicked = isCompareSetttingsOkBtnClicked;
                    //CompareSetttingsOkBtnClicked.Event = isCompareSetttingsOkBtnEvent;
                    //return CompareSetttingsOkBtnClicked;
                    return isCompareSetttingsOkBtnClicked;
                },
                setCompareSettingsOkBtnEvent:function(val){
                    if(isCompareSetttingsOkBtnClicked !== val) {
                        isCompareSetttingsOkBtnClicked = val;
                        //isCompareSetttingsOkBtnEvent = event;
                    }
                },
                getMoreSettingsOkBtnEvent:function(){
                    return isMoreSettingsOKbtnClicked;
                },
                setMoreSettingsOkBtnEvent:function(val){
                    if(isMoreSettingsOKbtnClicked !== val) {
                        isMoreSettingsOKbtnClicked = val;
                    }
                }
            };
        }]);
});