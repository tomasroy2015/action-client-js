"use strict";
define(['application-configuration','lodash','customerSettingsFactory'], function (app) {
    app.register.controller('ipMappingController', ['$scope','$rootScope','customerSettingsFactory','Notify',
        '$modal',
        function ($scope,$rootScope,customerSettingsFactory,Notify,$modal) {
            $scope.addOrEditModalShown=false;
            $scope.modalCustomer;
            var selectedData=null;
            $scope.modalShown = false;
            initializeData();
            $scope.$watch( function($scope){ return $scope.selectedCustomer}, function(newValue,oldValue){
                if(angular.isUndefined(newValue)|| (newValue.CustomerId === oldValue.CustomerId))
                    return;
                else{
                    initializeData();
                }
            });
            function initializeData(){
                $scope.ipMappingCollection=[];
                var selectedCustomer = customerSettingsFactory.GetSelectedCustomer().Others;
                $scope.customer={
                    SessionId:$scope.currentuser.SessionId,
                    CustomerId: selectedCustomer.CustomerId
                };
                customerSettingsFactory.GetIpMapping($scope.customer);
            }

            $scope.$on(Notify.CUSTOMER_SETTINGS_IP_MAPPING_DATA_READY, function (event) {
                $scope.rowCollection=customerSettingsFactory.IpMappingList();
                _.forEach($scope.rowCollection,function(item){
                    item.isEditDeleteHide=true;

                });
                $scope.ipMappingCollection=[].concat($scope.rowCollection);
            });
            $scope.rowMouseOut_Handler=function(data){
                data.isEditDeleteHide=true;
            };
            $scope.rowHover_Handler=function(data){
                data.isEditDeleteHide=false;
            };
            $scope.deleteIcon_mouseleaveHandler=function(event){
                stopEventBubble(event);
                var obj=event.currentTarget;
                obj.className="fa fa-times";
            };
            $scope.deleteIcon_mouseoverHandler=function(event){
                stopEventBubble(event);
                var obj=event.currentTarget;
                obj.className="fa fa-times-circle";
            };
            $scope.addIp=function(){
                $scope.addOrEditModalShown=true;
                $scope.data=null;
                $scope.modalCustomer={
                    SessionId:$scope.currentuser.SessionId,
                    CustomerId:customerSettingsFactory.GetSelectedCustomer().Others.CustomerId
                }
            };
            $scope.ipMappingAddEditWindowClose=function(){
                $scope.addOrEditModalShown=false;
            };
            $scope.editIpMapping_ClickHandler=function(data){
                $scope.addOrEditModalShown=true;
                $scope.data=data;
                $scope.modalCustomer={
                    SessionId:$scope.currentuser.SessionId,
                    CustomerId:customerSettingsFactory.GetSelectedCustomer().Others.CustomerId
                }
            };
            $scope.deleteIpMapping_ClickHandler=function(data)
            {
                $scope.modalShown = !$scope.modalShown;
                $scope.message="Are you sure to delete this IP mapping?";
                selectedData=null;
                selectedData=data;
            };
            $scope.confirmIpMappingDelete=function(){
                var index=$scope.rowCollection.indexOf(selectedData);
                $scope.rowCollection.splice(index,1);
                var attributeRoute=getAttributeRouteParam();
                customerSettingsFactory.DeleteIPMapping(selectedData,attributeRoute);
            };
            function getAttributeRouteParam(){
                return  "/"+$scope.currentuser.SessionId+"/"+customerSettingsFactory.GetSelectedCustomer().Others.CustomerId;
            }

            function stopEventBubble(event){
                event.preventDefault();
                event.stopPropagation();
            }







        }]);
});

