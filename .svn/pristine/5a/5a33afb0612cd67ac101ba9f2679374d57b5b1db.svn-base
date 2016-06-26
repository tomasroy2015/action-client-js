"use strict";
define(['application-configuration','lodash','customerSettingsFactory'], function (app) {
    app.register.controller('siteClusteringController', ['$scope','$rootScope','customerSettingsFactory','Notify',
        '$modal',
        function ($scope,$rootScope,customerSettingsFactory,Notify,$modal) {
            $scope.unmappedCount = "";
            $scope.modalShown = false;
            var selectedItem = null;
            var selectedCustomer;
            initializeData();
            function initializeData(){
                $scope.unmappedCount = "";
                $scope.siteClusteringCollection=[];
                selectedCustomer = customerSettingsFactory.GetSelectedCustomer().Others;
                $scope.customer={
                    SessionId:$scope.currentuser.SessionId,
                    CustomerId: selectedCustomer.CustomerId
                };
                customerSettingsFactory.GetSiteClusters($scope.customer);
            }

            $scope.$on(Notify.CUSTOMER_SETTINGS_SITE_CLUSTER_DATA_READY, function (event) {
                $scope.siteMappingData = customerSettingsFactory.SiteClusterList();
                $scope.rowCollection = $scope.siteMappingData.SiteClusterCollection;
                _.forEach($scope.rowCollection,function(item){
                    item.isEditDeleteHide=true;

                });
                $scope.siteClusteringCollection =[].concat($scope.rowCollection);

                if($scope.siteMappingData.UnmappedSiteCollection && $scope.siteMappingData.UnmappedSiteCollection.length > 0){
                   $scope.unmappedCount = "There are "+$scope.siteMappingData.UnmappedSiteCollection.length.toString()+" unmapped site values";
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
            $scope.addCluster = function(data){
                $scope.isEditMode = false;
                $scope.addEditModalShown=true;
                $scope.mappedData = $scope.siteMappingData;
                $scope.selectedCustomer.SessionId=$scope.currentuser.SessionId;

            };
            $scope.editCluster = function(data){
                $scope.isEditMode = true;
                $scope.addEditModalShown=true;
                $scope.mappedData = $scope.siteMappingData;
                $scope.selectedData = data;
                $scope.selectedCustomer.SessionId=$scope.currentuser.SessionId;

            };
            $scope.deleteCluster = function(item){
                $scope.modalShown = !$scope.modalShown;
                $scope.message="Are you sure to delete this region mapping?";
                selectedItem = null;
                selectedItem = item;
            };
            $scope.confirmDelete=function(){
                var attrRoute="/"+$scope.customer.SessionId+"/"+$scope.customer.CustomerId;
                customerSettingsFactory.DeleteSiteCluster(selectedItem,attrRoute);
            }
        }]);
});

