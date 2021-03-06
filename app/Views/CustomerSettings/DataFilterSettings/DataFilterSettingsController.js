"use strict";
define(['application-configuration','lodash','customerSettingsFactory'], function (app) {
    app.register.controller('dataFilterSettingsController', ['$scope','$rootScope','customerSettingsFactory','Notify',
        function ($scope,$rootScope,customerSettingsFactory,Notify) {
            /* here $scope also inherit parent controller $scope ie 'CustomerSettingsController Scope'.
            * because ng-include always creates a new scope and
            * A "child scope" (prototypically) inherits properties from its parent scope.
             * */
           // initForm();
            $scope.displayColl=[];
            $scope.rowCollection=[];
            $scope.rowViewCollection=[];
            $scope.modalShown = false;
            $scope.addOrEditModalShown=false;
            $scope.modalCustomer;
            var selectedData=null;
            initForm();
            $scope.$watch( function($scope){ return $scope.selectedCustomer}, function(newValue,oldValue){
                if(angular.isUndefined(newValue)|| (newValue.CustomerId === oldValue.CustomerId))
                    return;
                else{
                    initForm();
                }
            })
           function initForm(){
               $scope.displayColl=[];
               var customer={
                   sessionId:$scope.currentuser.SessionId,
                   CustomerId:customerSettingsFactory.GetSelectedCustomer().Others.CustomerId
               }
               customerSettingsFactory.GetDataFilterSettings(customer);
           }

            $scope.$on(Notify.CUSTOMER_SETTINGS_DATA_FILTER_SETTINGS_DATA_READY, function (event) {
                $scope.rowCollection=customerSettingsFactory.DataFilterSettingsList().DataFilterCollection;
                $scope.rowViewCollection=[];
                var coll = _.values(_.groupBy($scope.rowCollection,'Type'));
                for(var i=0;i<coll.length;i++){
                    var grpColl=coll[i];
                    var grpDisplayName="";
                    switch(grpColl[0].Type){
                        case 0:
                            grpDisplayName="Geography";
                            break;
                        case 1:
                            grpDisplayName="Organization";
                            break;
                        case 2:
                            grpDisplayName="Tickets";
                            break;
                        case 3:
                            grpDisplayName="Others";
                    }
                    var typeItem={
                        isGrpType:true,
                        Label:grpDisplayName
                    }
                    $scope.rowViewCollection.push(typeItem);
                    _.forEach(grpColl,function(item){
                        item.isGrpType=false;
                        item.isEditHide=true;
                        item.isDeleteHide=true;
                        $scope.rowViewCollection.push(item);
                    })
                }
                $scope.displayColl=[].concat($scope.rowViewCollection);

            });

            $scope.deleteDataFilterSettings_ClickHandler=function(data)
            {
                $scope.modalShown = !$scope.modalShown;
                $scope.message="Are you sure to delete this data filter?";
                selectedData=null;
                selectedData=data;
            }
            $scope.confirmDataFilterDelete=function(){
                console.log("delete data filter..."+$scope.rowViewCollection.indexOf(selectedData));
                //var index=$scope.rowViewCollection.indexOf(selectedData);
                //$scope.rowViewCollection.splice(index,1);
                var attributeRoute=getAttributeRouteParam();
                customerSettingsFactory.DeleteDataFilter(selectedData,attributeRoute);

            }
            $scope.$on(Notify.CUSTOMER_SETTINGS_DATAFILTER_DELETE_SUCCESS,function(event){
                initForm();
            })
            $scope.addDataFilter=function(){
                $scope.addOrEditModalShown=true;
                $scope.data=null;
                $scope.modalCustomer={
                    SessionId:$scope.currentuser.SessionId,
                    CustomerId:customerSettingsFactory.GetSelectedCustomer().Others.CustomerId
                }
            }
            $scope.dataFilterAddEditWindowClose=function(){
                $scope.addOrEditModalShown=false;
            }


            function getAttributeRouteParam(){
                return  "/"+$scope.currentuser.SessionId+"/"+customerSettingsFactory.GetSelectedCustomer().Others.CustomerId;
            }
            $scope.editDataFilterSettings_ClickHandler=function(data){
                $scope.addOrEditModalShown=true;
                $scope.data=data;
                $scope.modalCustomer={
                    SessionId:$scope.currentuser.SessionId,
                    CustomerId:customerSettingsFactory.GetSelectedCustomer().Others.CustomerId
                }
            }

            $scope.rowHover_Handler=function(data){
                if(data.isGrpType)
                    return;
                data.isEditHide=false;
                data.isDeleteHide=false;

            }
            $scope.rowMouseOut_Handler=function(data){
                if(data.isGrpType)
                return;
                data.isEditHide=true;
                data.isDeleteHide=true;
            }
            $scope.deleteIcon_mouseleaveHandler=function(event){
                stopEventBubble(event);
                var obj=event.currentTarget;
                obj.className="fa fa-times";
            }
            $scope.deleteIcon_mouseoverHandler=function(event){
                stopEventBubble(event);
                var obj=event.currentTarget;
                obj.className="fa fa-times-circle";
            }
            function stopEventBubble(event){
                event.preventDefault();
                event.stopPropagation();
            }

        }]);
});
