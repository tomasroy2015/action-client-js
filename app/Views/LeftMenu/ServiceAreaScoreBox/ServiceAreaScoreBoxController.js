"use strict";

define(['application-configuration', 'alertsService', 'dataFactory', 'datasetSelectionFactory', 'leftMenuSlidingWindowEventNotifyFactory'], function (app) {

    app.register.controller('serviceAreaScoreBoxController', ['$scope', 'alertsService', 'dataFactory', 'appSettings', 'Notify', 'ComparatorType', 'comparatorFactory', 'datasetSelectionFactory', 'leftMenuSlidingWindowEventNotifyFactory',
        function ($scope, alertsService, dataFactory, appSettings, Notify, ComparatorType, comparatorFactory, datasetSelectionFactory, leftMenuSlidingWindowEventNotifyFactory) {

            $scope.leftMenuSlidingWindowEventNotify = leftMenuSlidingWindowEventNotifyFactory;
            var selectedServiceAreaId = dataFactory.SelectedServiceAreaId();
            initializeData();

            function initializeData() {
                prepareDefaultData();
            }
            function prepareDefaultData() {
                selectedServiceAreaId = dataFactory.SelectedServiceAreaId();
                $scope.selectedQuestionId = selectedServiceAreaId;
                $scope.selectedServiceAreaId = selectedServiceAreaId;
                var serviceAreaCollection = dataFactory.ServiceAreaCollection();

                $scope.generalSurveyCollection = function(){
                    return _.filter(serviceAreaCollection, function(n){
                        return n.SurveyType == "GEN" || n.SurveyType == "NOG";
                    });
                }();
                $scope.triggerSurveyCollection =  function(){
                    var tmp =  _.filter(serviceAreaCollection, function(n){
                        return n.SurveyType == "TCK";
                    });
                    return _.sortByOrder(tmp,"SortOrder",true);
                }();

                $scope.combinedScoreDataCollection = dataFactory.getServiceAreaDataById(selectedServiceAreaId);
            }
            $scope.$on(Notify.DATA_READY, function (event) {
                prepareDefaultData();
            });
            $scope.$on(Notify.DATASET_CHANGED, function (event) {
                prepareDefaultData();
            });
            $scope.$on(Notify.DATA_FILTER_APPLIED, function () {
                prepareDefaultData();
            });
            $scope.$on(Notify.COMPARATOR_TYPE_CHANGED, function () {
                $scope.combinedScoreDataCollection = dataFactory.getServiceAreaDataById(selectedServiceAreaId);
            });
            $scope.$on(Notify.COMPARATOR_COLOR_CHANGED, function () {
                $scope.combinedScoreDataCollection = dataFactory.getServiceAreaDataById(selectedServiceAreaId);
            });
            $scope.onServiceAreaClicked = function (selectedServiceArea) {
                selectedServiceAreaId = selectedServiceArea.Id;
                $scope.selectedServiceAreaId = selectedServiceAreaId;
                $scope.selectedQuestionId = selectedServiceAreaId;
                dataFactory.ServiceAreaChanged(selectedServiceAreaId);
                $scope.combinedScoreDataCollection = dataFactory.getServiceAreaDataById(selectedServiceAreaId);

            }
            $scope.onQuestionItemClick = function(selectedItem){

                if (selectedServiceAreaId === "OS" || selectedServiceAreaId === "TCK" || selectedServiceAreaId === "SES" || selectedServiceAreaId == selectedItem.QuestionId) {
                    //$scope.selectedServiceAreaId =  selectedItem.QuestionId;
                    $scope.selectedQuestionId = selectedItem.QuestionId;
                    dataFactory.ServiceAreaChanged(selectedItem.QuestionId);
                }
                else {
                    $scope.selectedQuestionId = selectedItem.QuestionId;
                    dataFactory.ServiceAreaQuestionChanged( selectedItem.QuestionId);
                }
            }
        }]);
});
