"use strict";

define(['application-configuration', 'dataFactory', 'fullScorecardDataFactory'], function (app) {

    app.register.controller('fullScorecardController',
        ['$scope', '$timeout', 'serviceAreaScoreData', 'dataFactory', 'fullScorecardDataFactory', 'Notify',
            function ($scope, $timeout, serviceAreaScoreData, dataFactory, fullScorecardDataFactory, Notify, ViewDataFactory) {

                $scope.fullScorecardData = {};
                $scope.customerID = '';
                $timeout(function () {
                    initializeData();
                }, 0);

                function initializeData() {
                    $scope.fullScorecardData = {};
                    $scope.fullScorecardDataView = {};
                    $scope.fullScorecardData = dataFactory.GetFullScoreCardData();
                    $scope.customerID = dataFactory.DataInfo().customerID;
                }

                $scope.$on(Notify.COMPARATOR_TYPE_CHANGED, function (event) {
                    initializeData();
                });
                $scope.$on(Notify.DATA_READY, function (event) {
                    initializeData();
                });
                $scope.$on(Notify.DATA_FILTER_APPLIED, function (event) {
                    initializeData();
                });
                $scope.$on(Notify.COMPARATOR_COLOR_CHANGED, function (event) {
                    initializeData();
                });

                $scope.$on(Notify.DATASET_CHANGED, function () {
                    initializeData();
                });

            }]);
});

