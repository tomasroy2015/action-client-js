"use strict";
define(['application-configuration'], function (app) {

    app.register.directive('actionConfirmationAlertDialog', [function () {
        return {
            restrict: 'E',
            scope: {
                show: '=info',
                message:'=',
                confirmOk:'&'

            },
            link:function (scope, el, attrs) {
                scope.dialogStyle = {};
                if (attrs.width)
                    scope.dialogStyle.width = attrs.width;
                if (attrs.height)
                    scope.dialogStyle.height = attrs.height;
                scope.hideModal = function() {
                    scope.show = false;
                };
                scope.confirmOperation=function(){
                    scope.confirmOk();
                    scope.hideModal();
                }


            },
            templateUrl: 'Views/Shared/Template/ConfirmationAlertDialogTemplate.html'
        };
    }]);

});