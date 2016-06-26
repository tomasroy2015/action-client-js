"use strict";
define(['application-configuration','lodash','customerSettingsFactory'], function (app) {
    app.register.controller('generalSettingsController', ['$scope','$rootScope','customerSettingsFactory','Notify','ComparatorType',
        function ($scope,$rootScope,customerSettingsFactory,Notify,ComparatorType) {
            /* here $scope also inherit parent controller $scope ie 'CustomerSettingsController Scope'.
            * because ng-include always creates a new scope and
            * A "child scope" (prototypically) inherits properties from its parent scope.
             * */
            $scope.selectedAttr;
            $scope.selectedRegionMapp;
            $scope.selectedGeneralCustomer=customerSettingsFactory.GetSelectedCustomer().Others;
            $scope.customerGeneralSettings = [];

//            function initForm(){
//              $scope.listViewSelectedDefaultAttribute=getListViewSelectedDefaultAttribute();
//                $scope.selectedRegionMapp=$scope.setDefaultRegionMapping();
//                $scope.noValueSelection=$scope.setDefaultNoValueSelection();
//                prepareDoubleTarget();
//
//            }
            $scope.setDefaultListViewSelectedDefaultAttribute=function(){
                $scope.listViewSelectedDefaultAttribute=  getListViewSelectedDefaultAttribute();
            };

            $scope.translationChanged=function(){
                if(!$scope.customerGeneralSettings.HasTranslation){
                    $scope.customerGeneralSettings.HasSentimentAnalysis=false;
                }
            };
            $scope.$on(Notify.CUSTOMER_GENERAL_SETTINGS_DATA_READY, function(event){
                $scope.customerGeneralSettings = customerSettingsFactory.CustomerGeneralSettings();
                $scope.setDefaultListViewSelectedDefaultAttribute();
                prepareRegionMapping();
                prepareNoValue();
                $scope.noValueSelection=$scope.setDefaultNoValueSelection();
                prepareDoubleTarget();
            });
            $scope.saveSettings=function(){
                $scope.customerGeneralSettings.DefaultListViewAttributeIndex= $scope.listViewSelectedDefaultAttribute.Index;
                $scope.customerGeneralSettings.RegionMappingAttributeIndex=$scope.selectedRegionMapp.Index;
                $scope.customerGeneralSettings.HasNullValueConversion=$scope.noValueSelection.value;
                if($scope.customerGeneralSettings.HasDoubleTarget){
                    $scope.customerGeneralSettings.DoubleTargetDefaultComparator=$scope.doubleTarget.value;
                }
                else{
                    $scope.customerGeneralSettings.DoubleTargetDefaultComparator=0;
                }
                var attrRoute="/"+$scope.selectedGeneralCustomer.CustomerId+"/"+$scope.currentuser.SessionId;
                customerSettingsFactory.UpdateGeneralSettings($scope.customerGeneralSettings,attrRoute);

            };

            function prepareDoubleTarget(){
                $scope.doubleTargetColl=[];
                $scope.doubleTargetColl.push({Label:'LowerLimit',value:ComparatorType.LowerLimit},
                    {Label:'Median',value:ComparatorType.Median},
                    {Label:'UpperLimit',value:ComparatorType.UpperLimit});
               var dbTarget= _.filter($scope.doubleTargetColl,function(item){
                    return item.value==$scope.customerGeneralSettings.DoubleTargetDefaultComparator;
                });
                if(dbTarget.length<1)
                $scope.doubleTarget=$scope.doubleTargetColl[0];
                else
                    $scope.doubleTarget=dbTarget[0];

            }
            $scope.doubleTarget_change = function(value){
                $scope.doubleTarget = value;
            };
            function prepareNoValue(){
                $scope.noValueColl=[];
                $scope.noValueColl.push({Label:'ON',value:true},{Label:'OFF',value:false});
            }
            $scope.setDefaultNoValueSelection=function(){
                if(angular.isUndefined($scope.noValueColl))
                    prepareNoValue();
                $scope.noValueSelection= _.filter($scope.noValueColl,function(item){
                    return item.value==$scope.customerGeneralSettings.HasNullValueConversion;
                })[0];
                return $scope.noValueSelection;
            };
            function prepareRegionMapping(){
                $scope.regionMappedColl=[];
                $scope.regionMappedColl= _.filter($scope.customerGeneralSettings.CustomAttributes,function(item){
                    return (item.AttributeName=="Site" ||item.AttributeName=="City");
                });

                var noneRegionMapObj={
                    AttributeName: "None",
                    Label: "None",
                    Index: null
                };
                $scope.regionMappedColl.push(noneRegionMapObj);
                $scope.setDefaultRegionMapping();
            }
            $scope.setDefaultRegionMapping=function(){
                if(angular.isUndefined($scope.regionMappedColl))
                    prepareRegionMapping();
                var selectedRegionMapp = _.filter( $scope.regionMappedColl,function(item){
                   return item.Index==$scope.customerGeneralSettings.RegionMappingAttributeIndex;
               });
                if(selectedRegionMapp.length<1){
                    $scope.selectedRegionMapp=$scope.regionMappedColl[2];
                }
                else{
                    $scope.selectedRegionMapp=selectedRegionMapp[0];
                }
                return $scope.selectedRegionMapp;
            };

            function getListViewSelectedDefaultAttribute(){
                $scope.selectedGeneralCustomer=customerSettingsFactory.GetSelectedCustomer().Others;
                var defaultAttIndex= $scope.customerGeneralSettings.DefaultListViewAttributeIndex;
                var item = _.find($scope.customerGeneralSettings.CustomAttributes,function(n){
                     return n.Index == defaultAttIndex;
                });
                return item;
            }
        }]);
});
