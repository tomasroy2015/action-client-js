"use strict";

define(['application-configuration', 'dataFactory', 'moreSettingsFactory'], function (app) {
    app.register.controller('moreSettingsController', ['$rootScope','$scope','dataFactory','moreSettingsFactory','Notify',
           function($rootScope,$scope,dataFactory,moreSettingsFactory,Notify){
               $scope.onlyNumbers = /[^0-9]+/g;
               $scope.minSiteRespondent = 0;
               $scope.minCountryRespondent = 0;
               $scope.colorSettings = dataFactory.GetColorSettings();
               $scope.selectedColorSet = $scope.colorSettings[0];
               $scope.selectedZoomLevel = 1;
               moreSettingsFactory.SetMinimumRespondentForCountry($scope.minSiteRespondent);
               moreSettingsFactory.SetMinimumRespondentForSite($scope.minCountryRespondent);
               $scope.onlyDigitsInput = function() {
                   $scope.minSiteRespondent = !angular.isUndefined($scope.minSiteRespondent) ? $scope.minSiteRespondent.toString().replace($scope.onlyNumbers, "") : $scope.minSiteRespondent;
                   $scope.minCountryRespondent = !angular.isUndefined($scope.minCountryRespondent) ? $scope.minCountryRespondent.toString().replace($scope.onlyNumbers, "") : $scope.minCountryRespondent;
               };
                   $scope.updateColorSet = function(colorSet){
                   moreSettingsFactory.SetColorSet(colorSet.OnTarget,colorSet.CloseToTarget,colorSet.FarFromTarget);
                   dataFactory.preparedServiceAreaScoreDataCollection();
                   $rootScope.$broadcast(Notify.COMPARATOR_COLOR_CHANGED);
               };
               $scope.updateZoomLevel = function(selectedZoomLevel){
                   moreSettingsFactory.SetDefaultZoomLevel(selectedZoomLevel);
               };
               $scope.respondentCountryChange_Handler= function(minResp){
                   if(typeof (minResp) != 'undefined' || minResp != null || minResp == "" ){
                       moreSettingsFactory.SetMinimumRespondentForCountry(minResp);
                   }
                   else{
                       minResp = 0;
                       moreSettingsFactory.SetMinimumRespondentForCountry(minResp);
                   }
               };
               $scope.respondentSiteChange_Handler= function(minResp) {
                   if(typeof (minResp) != 'undefined' || minResp != null || minResp == "" ) {
                       moreSettingsFactory.SetMinimumRespondentForSite(minResp);
                   }
                   else{
                       minResp = 0;
                       moreSettingsFactory.SetMinimumRespondentForSite(minResp);
                   }
               };
               $scope.$on(Notify.DATA_READY,function(event){
                   var stdRadio = document.getElementById('colosetStandard');
                   stdRadio.checked = true;
                   $scope.minSiteRespondent = 0;
                   $scope.minCountryRespondent = 0;
                   moreSettingsFactory.SetColorSet($scope.colorSettings[0].OnTarget, $scope.colorSettings[0].CloseToTarget, $scope.colorSettings[0].FarFromTarget);
                   $scope.selectedColorSet = $scope.colorSettings[0];
                   $scope.selectedZoomLevel = 1;
                   moreSettingsFactory.SetMinimumRespondentForCountry($scope.minSiteRespondent);
                   moreSettingsFactory.SetMinimumRespondentForSite($scope.minCountryRespondent);
                   dataFactory.preparedServiceAreaScoreDataCollection();
                   $rootScope.$broadcast(Notify.COMPARATOR_COLOR_CHANGED);
               });
               $scope.$on(Notify.DATASET_CHANGED,function(event){
                   if(dataFactory.IsResetFilterOrView())
                   {
                       var stdRadio = document.getElementById('colosetStandard');
                       stdRadio.checked = true;
                       $scope.minSiteRespondent = 0;
                       $scope.minCountryRespondent = 0;
                       moreSettingsFactory.SetColorSet($scope.colorSettings[0].OnTarget, $scope.colorSettings[0].CloseToTarget, $scope.colorSettings[0].FarFromTarget);
                       $scope.selectedColorSet = $scope.colorSettings[0];
                       $scope.selectedZoomLevel = 1;
                       moreSettingsFactory.SetMinimumRespondentForCountry($scope.minSiteRespondent);
                       moreSettingsFactory.SetMinimumRespondentForSite($scope.minCountryRespondent);
                       dataFactory.preparedServiceAreaScoreDataCollection();
                       $rootScope.$broadcast(Notify.COMPARATOR_COLOR_CHANGED);
                   }
               });
        }]);
});

