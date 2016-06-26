"use strict";

define(['application-configuration', 'dataFactory', 'comparatorFactory', 'CustomCheckbox'], function (app) {
    app.register.controller('compareWithSettingsController', ['$rootScope', '$scope', 'dataFactory', 'comparatorFactory', 'ComparatorType', 'Notify', '$timeout','datasetSelectionFactory',
        function ($rootScope, $scope, dataFactory, comparatorFactory, ComparatorType, Notify, $timeout,datasetSelectionFactory) {
            //$scope.isDoubleTargetSelected = false;
            $scope.selectedComparator = ComparatorType.Target;
            $scope.ComparatorType = ComparatorType;
            $scope.isDoubleTargetChecked = false;
            $scope.isShowDoubleTarget = false;
            $scope.SliderVal = 50;
            $scope.benchmark = ComparatorType.LowerLimit;
            $scope.DoubleTargetDefaultComparator = ComparatorType.Median;
            $scope.selectedCustomer = datasetSelectionFactory.selectedCustomer;
            $scope.compareSettingsCustomValue = {
                min: 10,
                max: 100,
                step: 2,
                precision: 50,
                value: 50,
                orientation: 'horizontal',  // vertical
                handle: 'square', //'square', 'triangle' or 'custom'
                tooltip: 'hide', //'hide','always'
                tooltipseparator: ':',
                tooltipsplit: false,
                enabled: true,
                naturalarrowkeys: false,
                range: false,
                ngDisabled: false,
                reversed: false
            };
            $scope.updateComparatorType = function (type) {
                setComparator(type);
            };

            $scope.doubleTargetSelection_Handler = function () {
                $scope.isDoubleTargetChecked = !$scope.isDoubleTargetChecked;
                if ($scope.isDoubleTargetChecked) {
                    $scope.selectedComparator = $scope.DoubleTargetDefaultComparator;
                    $scope.benchmark = $scope.DoubleTargetDefaultComparator;
                    comparatorFactory.SetDoubleTarget($scope.selectedComparator, true);
                    //angular.element('#target').attr('checked',true);
                } else {
                    $scope.selectedComparator = ComparatorType.Target;
                    comparatorFactory.SetDoubleTarget($scope.selectedComparator, false);
                }
                dataFactory.preparedServiceAreaScoreDataCollection();
                $rootScope.$broadcast(Notify.COMPARATOR_TYPE_CHANGED);
            };


            $scope.onClickHandler = function () {
                $scope.selectedComparator = ComparatorType.Custom;
                setComparator($scope.selectedComparator);
            };

            function setComparator(type) {
                if (parseInt(type) === ComparatorType.Custom) {
                    comparatorFactory.SetCustomComparator($scope.SliderVal);
                    $scope.benchmark = ComparatorType.LowerLimit;
                }
                else {
                    if (parseInt(type) === ComparatorType.Median || parseInt(type) === ComparatorType.LowerLimit ||
                        parseInt(type) === ComparatorType.UpperLimit) {
                        $scope.benchmark = type;
                    } else {
                        $scope.benchmark = ComparatorType.LowerLimit;
                    }
                    $scope.selectedComparator = type;
                    comparatorFactory.UpdateComparatorType(type);
                }

                dataFactory.preparedServiceAreaScoreDataCollection();
                $rootScope.$broadcast(Notify.COMPARATOR_TYPE_CHANGED);
            }
            $scope.$on(Notify.DATA_READY,function(event){
                $scope.selectedComparator = ComparatorType.Target;
                $scope.ComparatorType = ComparatorType;
                $scope.SliderVal = 50;
                $scope.benchmark = ComparatorType.LowerLimit;
                $scope.selectedCustomer = datasetSelectionFactory.selectedCustomer;
                $scope.compareSettingsCustomValue = {
                    min: 10,
                    max: 100,
                    step: 2,
                    precision: 50,
                    value: 50,
                    orientation: 'horizontal',  // vertical
                    handle: 'square', //'square', 'triangle' or 'custom'
                    tooltip: 'hide', //'hide','always'
                    tooltipseparator: ':',
                    tooltipsplit: false,
                    enabled: true,
                    naturalarrowkeys: false,
                    range: false,
                    ngDisabled: false,
                    reversed: false
                };
                $scope.isDoubleTargetChecked = dataFactory.CustomerGeneralSettings().HasDoubleTarget;
                $scope.isShowDoubleTarget = dataFactory.CustomerGeneralSettings().HasDoubleTarget;
                comparatorFactory.SetDoubleTarget($scope.selectedComparator, dataFactory.CustomerGeneralSettings().HasDoubleTarget);
                if (dataFactory.CustomerGeneralSettings().HasDoubleTarget) {
                    $scope.DoubleTargetDefaultComparator = dataFactory.CustomerGeneralSettings().DoubleTargetDefaultComparator;
                    $scope.selectedComparator = $scope.DoubleTargetDefaultComparator;
                    $scope.benchmark = $scope.DoubleTargetDefaultComparator;
                }
                setComparator($scope.selectedComparator);
            });
            $scope.$on(Notify.DATASET_CHANGED,function(event){
                if(dataFactory.IsResetFilterOrView())
                {
                    $scope.selectedComparator = ComparatorType.Target;
                    $scope.ComparatorType = ComparatorType;
                    $scope.SliderVal = 50;
                    $scope.benchmark = ComparatorType.LowerLimit;
                    $scope.selectedCustomer = datasetSelectionFactory.selectedCustomer;
                    $scope.compareSettingsCustomValue = {
                        min: 10,
                        max: 100,
                        step: 2,
                        precision: 50,
                        value: 50,
                        orientation: 'horizontal',  // vertical
                        handle: 'square', //'square', 'triangle' or 'custom'
                        tooltip: 'hide', //'hide','always'
                        tooltipseparator: ':',
                        tooltipsplit: false,
                        enabled: true,
                        naturalarrowkeys: false,
                        range: false,
                        ngDisabled: false,
                        reversed: false
                    };
                    $scope.isDoubleTargetChecked = dataFactory.CustomerGeneralSettings().HasDoubleTarget;
                    $scope.isShowDoubleTarget = dataFactory.CustomerGeneralSettings().HasDoubleTarget;
                    comparatorFactory.SetDoubleTarget($scope.selectedComparator, dataFactory.CustomerGeneralSettings().HasDoubleTarget);
                    if (dataFactory.CustomerGeneralSettings().HasDoubleTarget) {
                        $scope.DoubleTargetDefaultComparator = dataFactory.CustomerGeneralSettings().DoubleTargetDefaultComparator;
                        $scope.selectedComparator = $scope.DoubleTargetDefaultComparator;
                        $scope.benchmark = $scope.DoubleTargetDefaultComparator;
                    }
                    setComparator($scope.selectedComparator);
                }
            });
            $timeout(function () {
                var oCustomerGeneralSettings = dataFactory.CustomerGeneralSettings();
                if (oCustomerGeneralSettings.HasDoubleTarget) {
                    $scope.isShowDoubleTarget = oCustomerGeneralSettings.HasDoubleTarget;
                    $scope.DoubleTargetDefaultComparator = oCustomerGeneralSettings.DoubleTargetDefaultComparator;
                    $scope.doubleTargetSelection_Handler();
                }
            }, 10);


        }]);
});

