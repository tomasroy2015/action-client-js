"use strict";
define(['application-configuration'], function (app) {

    app.register.directive('actionDateRangeSelection', [function () {
        return {
            restrict: 'E',
            scope: {
                show: '=info',
                title:"=",
                fromDate:"=",
                toDate:"=",
                clickOk:'&'
            },
            link:function (scope, el, attrs) {
                scope.dialogStyle = {};
                scope.fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
                scope.toDate = new Date(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1) - 1);
                scope.isInvalidFromDate = false;
                scope.isInvalidToDate = false;
                scope.isToDateSmall = false;
                scope.isOkClicked = false;
                if (attrs.width)
                    scope.dialogStyle.width = attrs.width;
                if (attrs.height)
                    scope.dialogStyle.height = attrs.height;
                scope.hideModal = function() {
                    scope.show = false;
                    scope.isInvalidFromDate = false;
                    scope.isInvalidToDate = false;
                    scope.isOkClicked = false;
                    scope.isToDateSmall = false;
                    scope.fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
                    scope.toDate = new Date(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1) - 1);
                };
                scope.okClicked=function(){
                   scope.isOkClicked = true;
                   if(isValidDateRange()){
                       scope.clickOk();
                       scope.hideModal();
                   }
                };
                function isValidDateRange(){
                    var isValid = true;
                    if(scope.fromDate === null) {
                        //alert("Please select a DateRange");
                        scope.isInvalidFromDate = true;
                        isValid = false;
                    }
                    if(scope.toDate === null)
                    {
                        scope.isInvalidToDate = true;
                        isValid = false;
                    }
                    if(typeof scope.fromDate === "undefined") {
                        //alert("Please select a valid DateRange");
                        scope.isInvalidFromDate = true;
                        isValid = false;
                    }
                    if(typeof scope.toDate === "undefined")
                    {
                        scope.isInvalidToDate = true;
                        isValid = false;
                    }
                    if(scope.fromDate >  scope.toDate) {
                        //alert("To date is smaller than From date!");
                        scope.isToDateSmall = true;
                        isValid = false;
                    }

                    return isValid
                }
            },
            templateUrl: 'Views/Shared/Template/DateRangeSelectionTemplate.html'
        };
    }]);

});
