"use strict";

define(['application-configuration'], function (app) {

    app.register.controller('attributeScoreSummaryController', ['$scope', '$rootScope','$timeout','Notify', 'dataFactory', 'comparatorFactory','moreSettingsFactory','attributeScoreSummaryData',
        function ($scope, $rootScope,$timeout,Notify, dataFactory, comparatorFactory,moreSettingsFactory,attributeScoreSummaryData) {

            var customerSettings = dataFactory.CustomerGeneralSettings();
            $scope.hasTranslation = customerSettings.HasTranslation;

            $scope.$on(Notify.ATTRIBUTE_EVALUATION_DATA_READY, function (event) {
                if(dataFactory.GetAttributeEvaluationDataCollection() != null){
                    var evaluationData= dataFactory.GetAttributeEvaluationDataCollection();
                    var attEvaluationData =  attributeScoreSummaryData.AttributeEvaluationData(evaluationData,attributeScoreSummaryData.getSelectedServiceAreaId());

                    if(attributeScoreSummaryData.getSelectedView() == "map-view-attribute-summary"){
                        $rootScope.$broadcast(Notify.ATTRIBUTE_EVALUATION_FROM_MAP_READY,{data:attEvaluationData});
                    }
                    else if(attributeScoreSummaryData.getSelectedView() == "list-view-attribute-summary"){
                        $rootScope.$broadcast(Notify.ATTRIBUTE_EVALUATION_FROM_LIST_READY,{data:attEvaluationData});
                    }
                }
            });
        }]);

});
