/**
 * Created by Shahin on 7/11/2015.
 */

"use strict";

define(['application-configuration'], function (app) {

    app.register.controller('addToGroupController', function ($scope, $modalInstance, items, ddlColl) {

        $scope.selectedGroup = null;
        $scope.items = items;
        $scope.ddlColl = ddlColl;
        //console.log(ddlColl);
        $scope.selected = {};
        $scope.GroupText = {};
        $scope.isEnableAddToGroupBtn = true;


        $scope.onAddToGroupClick = function () {
            //console.log($scope.GroupText.Name);

            if (($scope.selectedGroup && $scope.selectedGroup.Id !== 0)) {
                //$modalInstance.close({GroupName:$scope.selectedGroup.Name, Items:$scope.items.concat($scope.selectedGroup.Items),IsAddInExistingGroup:true});
                $modalInstance.close({
                    GroupName: $scope.selectedGroup.Name,
                    Items: $scope.items,
                    IsAddInExistingGroup: true,
                    ExistingGroupItems: $scope.selectedGroup.Items
                });
            } else {
                $modalInstance.close({
                    GroupName: $scope.GroupText.Name,
                    Items: $scope.items,
                    IsAddInExistingGroup: false,
                    ExistingGroupItems: []
                });
            }

        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.onDelete = function (item) {
            var delIndex = $scope.items.indexOf(item);
            $scope.items.splice(delIndex, 1);
            onCheckHasGroupItems();
        };

        function onCheckHasGroupItems() {
            if ($scope.items && $scope.items.length === 0) {
                $scope.isEnableAddToGroupBtn = true;
                return false;
            } else {
                $scope.isEnableAddToGroupBtn = false;
                return true;
            }
        }

        $scope.addtoGroupBtnEnableDisable = function () {

            if(!onCheckHasGroupItems()) return;

            if ($scope.GroupText.Name === undefined || ($scope.GroupText.Name.length === 0 && ($scope.selectedGroup && $scope.selectedGroup.Id === 0))) {
                $scope.isEnableAddToGroupBtn = true;
            } else if ((($scope.GroupText.Name !== undefined && $scope.GroupText.Name.length > 0) && ($scope.selectedGroup && $scope.selectedGroup.Id > 0))) {
                $scope.isEnableAddToGroupBtn = true;
            } else {
                $scope.isEnableAddToGroupBtn = false;
            }
        };

        $scope.onDDLGroupChange = function (item) {
            $scope.selectedGroup = item;
            if(!onCheckHasGroupItems()) return;

            if (($scope.selectedGroup && $scope.selectedGroup.Id === 0) && $scope.GroupText.Name === undefined) {
                $scope.isEnableAddToGroupBtn = true;
            } else if (($scope.selectedGroup && $scope.selectedGroup.Id === 0) && ($scope.GroupText.Name !== undefined && $scope.GroupText.Name.length === 0)) {
                $scope.isEnableAddToGroupBtn = true;
            } else if (($scope.selectedGroup && $scope.selectedGroup.Id > 0) && ($scope.GroupText.Name !== undefined && $scope.GroupText.Name.length > 0)) {
                $scope.isEnableAddToGroupBtn = true;
            } else {
                $scope.isEnableAddToGroupBtn = false;
            }
        }

    });

});

//
//define(['application-configuration'], function (app) {
//    app.register.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {
//
//        $scope.items = items;
//        $scope.selected = {
//            item: $scope.items[0]
//        };
//
//        $scope.ok = function () {
//            $modalInstance.close($scope.selected.item);
//        };
//
//        $scope.cancel = function () {
//            $modalInstance.dismiss('cancel');
//        };
//    });
//
//});
