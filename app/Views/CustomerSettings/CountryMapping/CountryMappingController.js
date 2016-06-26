"use strict";
define(['application-configuration','lodash','customerSettingsFactory'], function (app) {
    app.register.controller('countryMappingController', ['$scope','$rootScope','customerSettingsFactory','Notify',
        '$modal',
        function ($scope,$rootScope,customerSettingsFactory,Notify,$modal) {
            $scope.unmappedCount = "";
            $scope.modalShown = false;
            var selectedItem = null;
            initializeData();
            function initializeData(){
                $scope.unmappedCount = "";
                $scope.countryMappingCollection = [];
                var selectedCustomer = customerSettingsFactory.GetSelectedCustomer().Others;
                $scope.customer={
                    SessionId:$scope.currentuser.SessionId,
                    CustomerId: selectedCustomer.CustomerId
                };
                customerSettingsFactory.GetCountryMapping($scope.customer);
            }

            $scope.$on(Notify.CUSTOMER_SETTINGS_COUNTRY_MAPPING_DATA_READY, function (event) {
                $scope.countryMappingData = customerSettingsFactory.CountryMappingList();
                $scope.rowCollection = $scope.countryMappingData.MappedCountries;
                _.forEach($scope.rowCollection,function(item){
                    item.isEditDeleteHide=true;

                });
                $scope.countryMappingCollection=[].concat($scope.rowCollection);
                $scope.unmappedCount = ($scope.countryMappingData.CountryValuesCount > 0) ?
                                       "There are "+$scope.countryMappingData.CountryValuesCount.toString()+ " unmapped Country values" :  $scope.unmappedCount = "";
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
            $scope.deleteMapItem = function(item){
                $scope.modalShown = !$scope.modalShown;
                $scope.message="Are you sure to delete this country mapping?";
                selectedItem = null;
                selectedItem = item;
            };
            $scope.addCountry = function(data){
                $scope.isEditMode = false;
                $scope.addEditModalShown=true;
                $scope.mappedData = $scope.countryMappingData;
                $scope.selectedCustomer.SessionId=$scope.currentuser.SessionId;

            };
            $scope.editCountry = function(data){
                $scope.isEditMode = true;
                $scope.addEditModalShown=true;
                $scope.mappedData = $scope.countryMappingData;
                $scope.selectedData = data;
                $scope.selectedCustomer.SessionId=$scope.currentuser.SessionId;

            };
            $scope.confirmDelete=function(){
                var attrRoute="/"+$scope.customer.SessionId+"/"+$scope.customer.CustomerId;
                customerSettingsFactory.DeleteCountryMapping(selectedItem,attrRoute);
            };
            $scope.$on(Notify.CUSTOMER_GENERAL_SETTINGS_PREDEFINED_VALUE_ADDED, function (event,response) {
                if(angular.isUndefined(response)) return;
                $scope.countryMappingData.PredefinedCountryValues.push(response.data);
             });
            $scope.$on(Notify.CUSTOMER_GENERAL_SETTINGS_PREDEFINED_VALUE_DELETED, function (event,response) {
                if(angular.isUndefined(response)) return;
                $scope.countryMappingData.PredefinedCountryValues = removePredefinedValue($scope.countryMappingData.PredefinedCountryValues,response);
            });
            function removePredefinedValue(values,response){
                var removeCounter = 0;
                for (var index = 0; index < values.length; index++) {
                    // If current array item equals itemToRemove then
                    if (values[index].Id === response.data.Id) {
                        // Remove array item at current index
                        values.splice(index, 1);

                        // Increment count of removed items
                        removeCounter++;

                        // Decrement index to iterate current position
                        // one more time, because we just removed item
                        // that occupies it, and next item took it place
                        index--;
                    }
                }
                return values;
            }
        }]);
});

