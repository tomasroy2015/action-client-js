"use strict";
define(['application-configuration','lodash','customerSettingsFactory'], function (app) {
    app.register.controller('regionMappingController', ['$scope','$rootScope','customerSettingsFactory','Notify',
        '$modal',
        function ($scope,$rootScope,customerSettingsFactory,Notify,$modal) {
            $scope.unmappedCount = "";
            $scope.modalShown = false;
            var selectedItem = null;
            var selectedCustomer;
            initializeData();
            function initializeData(){
                $scope.unmappedCount = "";
                $scope.regionMappingCollection=[];
                $scope.mappedColumn = "CITIES";
                selectedCustomer = customerSettingsFactory.GetSelectedCustomer().Others;
                $scope.customer={
                    SessionId:$scope.currentuser.SessionId,
                    CustomerId: selectedCustomer.CustomerId
                };
                customerSettingsFactory.GetRegionMapping($scope.customer);
                if(selectedCustomer.RegionMappingAttributeIndex != null && !angular.isUndefined(selectedCustomer.RegionMappingAttributeIndex)){
                    $scope.mappedColumn = (selectedCustomer.RegionMappingAttributeIndex == 3) ? "SITES" : "CITIES";
                }
            }

            $scope.$on(Notify.CUSTOMER_SETTINGS_REGION_MAPPING_DATA_READY, function (event) {
                $scope.regionMappingData = customerSettingsFactory.RegionMappingList();
                $scope.rowCollection = $scope.regionMappingData.RegionMappingCollection;
                _.forEach($scope.rowCollection,function(item){
                    item.isEditDeleteHide=true;

                });
                $scope.regionMappingCollection=[].concat($scope.rowCollection);

                if(selectedCustomer.RegionMappingAttributeIndex != null && !angular.isUndefined(selectedCustomer.RegionMappingAttributeIndex)){
                    var mappedValue  = (selectedCustomer.RegionMappingAttributeIndex == 3) ? "Site" : "City";
                    $scope.unmappedCount = ($scope.regionMappingData.UnmappedRegionCollection && $scope.regionMappingData.UnmappedRegionCollection.length > 0) ?
                                                  "There are "+$scope.regionMappingData.UnmappedRegionCollection.length.toString()+" unmapped "+mappedValue+" values" : "";
                }
            });
            $scope.$watch( function($scope){ return $scope.selectedCustomer}, function(newValue,oldValue){
                if(angular.isUndefined(newValue)|| (newValue.CustomerId === oldValue.CustomerId))
                    return;
                else{
                    initializeData();
                }
            });
            $scope.rowHover_Handler = function(data){
                data.isEditDeleteHide=false;
            };
            $scope.rowMouseOut_Handler = function(data){
                data.isEditDeleteHide=true;
            };
            $scope.addEditWindowClose = function(){
                $scope.addEditModalShown=false;
            };
            $scope.deleteRegion = function(item){
                $scope.modalShown = !$scope.modalShown;
                $scope.message="Are you sure to delete this region mapping?";
                selectedItem = null;
                selectedItem = item;
            };
            $scope.addRegion = function(data){
                $scope.isEditMode = false;
                $scope.addEditModalShown=true;
                $scope.mappedData = $scope.regionMappingData;
                $scope.selectedCustomer.SessionId=$scope.currentuser.SessionId;

            };
            $scope.editRegion = function(data){
                $scope.isEditMode = true;
                $scope.addEditModalShown=true;
                $scope.mappedData = $scope.regionMappingData;
                $scope.selectedData = data;
                $scope.selectedCustomer.SessionId=$scope.currentuser.SessionId;

            };
            $scope.confirmDelete=function(){
                var attrRoute="/"+$scope.customer.SessionId+"/"+$scope.customer.CustomerId;
                customerSettingsFactory.DeleteRegionMapping(selectedItem,attrRoute);
            }
        }]);
});

