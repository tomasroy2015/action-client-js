"use strict";
define(['application-configuration','lodash','customerSettingsFactory'], function (app) {
    app.register.controller('userAccountSettingsController', ['$scope','$rootScope','customerSettingsFactory','Notify',
        '$modal',
        function ($scope,$rootScope,customerSettingsFactory,Notify,$modal) {
            $scope.userAccountColl=[];
            $scope.rowCollection=[];
            $scope.modalShown = false;
            $scope.addOrEditModalShown=false;
            var selectedUser=null;
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
               $scope.customer={
                   SessionId:$scope.currentuser.SessionId,
                   CustomerId: $scope.selectedCustomer.CustomerId
               }
               customerSettingsFactory.GetCustomerUsersList($scope.customer);
            }
            $scope.$on(Notify.CUSTOMER_SETTINGS_USER_DATA_READY, function (event) {
              $scope.rowCollection=customerSettingsFactory.CustomerUsersList();
                _.forEach($scope.rowCollection,function(item){
                    item.isEditDeleteHide=true;
                    if(item.UserType==1){
                        item.Acc="Giarte admin";
                    }
                    else if(item.UserType==2){
                        item.Acc="Customer admin";
                    }
                    else{
                        item.Acc="Customer user";
                    }

                })
              $scope.displayColl=[].concat($scope.rowCollection);
            });
            $scope.deleteUser_ClickHandler=function(user){
                $scope.modalShown = !$scope.modalShown;
                $scope.message="Are you sure to delete the selected user account?";
                selectedUser=null;
                selectedUser=user;
            }
            $scope.confirmUserDelete=function(){
                console.log("delete user..."+$scope.rowCollection.indexOf(selectedUser));
                var index=$scope.rowCollection.indexOf(selectedUser);
                $scope.rowCollection.splice(index,1);
                selectedUser.SessionId=$scope.currentuser.SessionId;
                customerSettingsFactory.DeleteUserAccount(selectedUser);
                //var index=$scope.rowCollection.indexOf(selectedUser);
            }
            if (!Array.prototype.remove) {
                Array.prototype.remove = function(val) {
                    var i = this.indexOf(val);
                    return i>-1 ? this.splice(i, 1) : [];
                };
            }

            $scope.editUser_ClickHandler= function(user){
                $scope.addOrEditModalShown=true;
                $scope.user=user;
                $scope.selectedCustomer.SessionId=$scope.currentuser.SessionId;

            }
            $scope.addUser=function(){
                $scope.addOrEditModalShown=true;
                $scope.user=null;
                $scope.selectedCustomer.SessionId=$scope.currentuser.SessionId;
            }

            $scope.userAddEditWindowClose=function(){
                $scope.addOrEditModalShown=false;
            }

            $scope.rowHover_Handler=function(user){
                user.isEditDeleteHide=false;
            }
            $scope.rowMouseOut_Handler=function(user){
                user.isEditDeleteHide=true;
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
//            $('#smartTable').on('click','tr',function(e){
//                if($(this).hasClass('highlight')){
//                    $(this).removeClass('highlight')
//                }
//                else{
//                    $(this).addClass('highlight')
//                }
//            })
        }]);
});
