"use strict";
define(['application-configuration','lodash'], function (app) {
    app.register.directive('actionAddOrEditIpMapping',['customerSettingsFactory','Notify',
        function (customerSettingsFactory,Notify) {
            return {
                restrict: 'E',
                scope: {
                    show: '=info',
                    message:'=',
                    data:'=',
                    windowCloseListener:'&',
                    customer:'=',
                    mapData:'='
                },
                controller:function($scope){
                    initView();
                    function initView(){
                        $scope.onlyNumbers = /[^0-9\.]+/g;
//                        if($scope.data==null){
//                            $scope.data={
//                                Location:'',
//                                IpAddress:''
//                            };
//                            $scope.title="Add IP mapping"
//                        }
//                        else{
//                            $scope.title="Edit IP mapping"
//                        }
                        $scope.onlyNumbersInput = function() {
                            $scope.IpAddress = !angular.isUndefined($scope.IpAddress) ? $scope.IpAddress.toString().replace($scope.onlyNumbers, "") : $scope.IpAddress;
                        }
                    }
                },
                link:function (scope, el, attrs) {
                    var ownAddress = "";
                    scope.isEdit = scope.data ? true : false;
                    scope.isOkClicked = false;
                    scope.invalidIp = false;
                    scope.invalidText = "";
                    scope.Location = "";
                    scope.IpAddress = "";
                    scope.dialogStyle = {};
                    if (attrs.width)
                        scope.dialogStyle.width = attrs.width;
                    if (attrs.height)
                        scope.dialogStyle.height = attrs.height;

                    if(scope.isEdit){
                        scope.title="Edit IP mapping";
                        ownAddress = scope.data.IpAddress;
                        scope.Location = scope.data.Location;
                        scope.IpAddress = scope.data.IpAddress;
                    }else{
                        scope.title="Add IP mapping"
                    }
                    scope.hideModal = function() {
                        scope.show = false;
                        scope.windowCloseListener();
                    };
                    scope.confirmOperation=function(){
                        scope.isOkClicked = true;
                        if (scope.ipForm.$valid) {
                            if(!isValidIP(scope.IpAddress.toString().trim())){
                                scope.invalidIp = true;
                                return;
                            }
                            var dataObj = {
                                Id:scope.isEdit ? scope.data.Id : null,
                                CustomerId:scope.customer.CustomerId,
                                Location:scope.Location,
                                IpAddress:scope.IpAddress
                            };
                           // scope.data.CustomerId = scope.customer.CustomerId;
                            var attrParam = getAttributeRouteParam();
                            customerSettingsFactory.AddOrUpdateIPMapping(dataObj, attrParam);
                        }
                    };
                    function countDot(theString){
                        return theString.split(".").length - 1;
                    }
                    function isValidIP(theString){
                        var valid = false;
                        var lastDotIndex = theString.lastIndexOf(".");
                        var lastChar = theString.charAt(lastDotIndex + 1);
                        if(countDot(theString) === 3 && lastDotIndex < theString.length && lastChar){
                            valid = true;
                            scope.invalidIp = false;

                        }else{
                            scope.invalidText = "Invalid IP address.";
                        }

                        if(scope.mapData && ownAddress.toLowerCase().trim() !=  scope.IpAddress.toLowerCase().trim()){
                            var ipExist = _.find(scope.mapData,function(n){
                                 return n.IpAddress.toLowerCase().trim() ==  scope.IpAddress.toLowerCase().trim();
                            });
                            if(ipExist && !angular.isUndefined(ipExist)){
                                valid = false;
                                scope.invalidText = "Already exists.";
                            }
                        }
                        return valid;
                    }
                    scope.$on(Notify.CUSTOMER_SETTINGS_IPMAPPING_ADD_OR_UPDATE_SUCCESS,function(event){
                        scope.hideModal();
                        var requestedCustomer={
                            SessionId:scope.customer.SessionId,
                            CustomerId: scope.customer.CustomerId
                        };
                        customerSettingsFactory.GetIpMapping(requestedCustomer);
                    });
                    function getAttributeRouteParam(){
                        return  "/"+scope.customer.SessionId+"/"+scope.customer.CustomerId;
                    }
                },
                templateUrl: 'Views/CustomerSettings/IPMapping/AddOrEditIpMappingTemplate.html'
            };
        }]);

});
