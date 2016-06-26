"use strict";
define(['application-configuration','lodash'], function (app) {
    app.register.directive('actionEditShortCodeMapping',['customerSettingsFactory','Notify',
        function (customerSettingsFactory,Notify) {
            return {
                restrict: 'E',
                scope: {
                    show: '=info',
                    message:'=',
                    data:'=',
                    windowCloseListener:'&',
                    customer:'='
                },
//                controller:function($scope){
//                },
                link:function (scope, el, attrs) {
                    scope.mapData = {};
                    angular.copy(scope.data,scope.mapData);
                    scope.dialogStyle = {};
                    if (attrs.width)
                        scope.dialogStyle.width = attrs.width;
                    if (attrs.height)
                        scope.dialogStyle.height = attrs.height;
                    scope.hideModal = function() {
                        scope.show = false;
                        scope.windowCloseListener();
                    };

                    scope.$on(Notify.CUSTOMER_SETTINGS_SHORT_CODE_UPDATE_SUCCESS,function(event){
                        scope.hideModal();
                        var requestedCustomer={
                            SessionId:scope.customer.SessionId,
                            CustomerId: scope.customer.CustomerId
                        };
                        customerSettingsFactory.GetShortCodeMapping(requestedCustomer);
                    });
                    scope.editShortCode=function(){
                        var attrRoute="/"+scope.customer.SessionId+"/"+scope.customer.CustomerId;
                        customerSettingsFactory.UpdateShortCodeMapping(scope.mapData,attrRoute);
                    }
                },
                templateUrl: 'Views/CustomerSettings/ShortCodeMapping/EditShortCodeMappingTemplate.html'
            };
        }]);

});
