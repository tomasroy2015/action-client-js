"use strict";
define(['application-configuration','lodash'], function (app) {
    app.register.directive('actionAddOrEditDataFilter',['customerSettingsFactory','Notify',
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
            controller:function($scope){
                $scope.filterCategory=[{typeName:'Geography',type:0},
                                 {typeName:'Organization',type:1},
                                 {typeName:'Tickets',type:2},
                                {typeName:'Others',type:3}];

                $scope.unassignedDataFilterColl = [];
                angular.copy(customerSettingsFactory.DataFilterSettingsList().UnAssignedAttributeCollection,$scope.unassignedDataFilterColl);
                function initViewModel(){
                    if($scope.data==null)
                    {
                        $scope.data={
                            Label:'',
                            CustomerId:$scope.customer.CustomerId,
                            IsTopLevel:false
                        };
                        $scope.isEditMode=false;
                        $scope.isDisable=false;
                    }
                    else{
                        $scope.isEditMode=true;
                        $scope.isDisable=$scope.data.IsDefault;
                    }
                    $scope.title=$scope.isEditMode?"Edit data filter":"Add new data filter";

                    if($scope.isEditMode) {
                        var userDataFilter = {
                            AttributeName: $scope.data.AttributeName,
                            DisplayOrder: $scope.data.DisplayOrder,
                            Index: $scope.data.Index,
                            VerticaColumnName: $scope.data.VerticaColumnName
                        };
                        $scope.unassignedDataFilterColl.push(userDataFilter);
                    }
                }

                $scope.setFilterCategory=function(){
                    if($scope.isEditMode){
                        $scope.selectedFilterCategory= _.filter($scope.filterCategory,function(item){
                            return item.type==$scope.data.Type;
                        })[0];
                    }
                    else{
                        $scope.selectedFilterCategory= $scope.filterCategory[0];
                    }
                };
                $scope.setAttributeColumn=function(){
                        $scope.unassignedDataFilterColl= _.sortBy($scope.unassignedDataFilterColl,'AttributeName');
                        $scope.selectedAttributeColumn=_.filter($scope.unassignedDataFilterColl,function(item){
                            return item.AttributeName==$scope.data.AttributeName;
                        })[0];

                    if(!$scope.isEditMode)
                        $scope.selectedAttributeColumn=$scope.unassignedDataFilterColl[0];

                };
                initViewModel();
                $scope.setFilterCategory();
                $scope.setAttributeColumn();

            },
            link:function (scope, el, attrs) {
                scope.dialogStyle = {};
                if (attrs.width)
                    scope.dialogStyle.width = attrs.width;
                if (attrs.height)
                    scope.dialogStyle.height = attrs.height;
                scope.hideModal = function() {
                    scope.show = false;
                    scope.windowCloseListener();
                };
                scope.confirmOperation=function(){
                    scope.data.Type=scope.selectedFilterCategory.type;
                    scope.data.Index=scope.selectedAttributeColumn.Index;
                    var attrParam=getAttributeRouteParam();
                    customerSettingsFactory.AddOrUpdateDataFilterSettings(scope.data,attrParam);
                }
                function getAttributeRouteParam(){
                    return  "/"+scope.customer.SessionId+"/"+scope.customer.CustomerId;
                }
                scope.filterCategoryChanged=function(filterCategory){
                    scope.selectedFilterCategory=filterCategory;
                }
                scope.attributeColumnChanged=function(attrColumn){
                    scope.selectedAttributeColumn=attrColumn;
                }
                scope.$on(Notify.CUSTOMER_SETTINGS_DATAFILTER_ADD_OR_UPDATE_SUCCESS,function(event){
                    scope.hideModal();
                    var requestedCustomer={
                        SessionId:scope.customer.SessionId,
                        CustomerId: scope.customer.CustomerId
                    }
                    customerSettingsFactory.GetDataFilterSettings(requestedCustomer);
                })
            },
            templateUrl: 'Views/CustomerSettings/DataFilterSettings/AddOrEditDataFilterDirectiveTemplate.html'
        };
    }]);

});