/**
 * Created by Shahin on 10/7/2015.
 */

"use strict";

define(['application-configuration'], function (app) {

    app.register.controller('groupDeleteConfirmationWindowController', function ($scope, $modalInstance, IsGroupDelete) {

        $scope.IsGroupDelete = IsGroupDelete;
        $scope.MsgHeaderLbl = "Delete from group";
        $scope.MsgBody = "Are you sure you want to delete this item from this group? The item will be available\n individually after you remove it.";

        if($scope.IsGroupDelete === true) {
            $scope.MsgHeaderLbl = "Delete group";
            $scope.MsgBody = "Are you sure you want to delete this group?\n All group items will be available individually.";
        }

        $scope.onOkBtnClickHandler = function(){
            $modalInstance.close({
                IsOkBtnClicked:true
            });
        };

        $scope.onCancelBtnClickHandler = function(){
            $modalInstance.dismiss('cancel');
        };

    });//end
});
