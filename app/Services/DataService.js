define(['application-configuration', 'ajaxService'], function (app) {

    app.register.service('dataService', ['$rootScope', '$http', 'ajaxService', function ($rootScope, $http, ajaxService) {
        this.getAllData = function (dataset, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(dataset, "data/getalldata", successFunction, errorFunction);
        };
        this.getAttributeData = function (dataset, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(dataset, "data/getAttributeScoreData", successFunction, errorFunction);
        };
        this.getEvaluations = function (dataset, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(dataset, "data/getEvaluations", successFunction, errorFunction);
        };
        this.applyDataFilter = function (dataset, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(dataset, "data/applyDataFilter",  successFunction, errorFunction);
        };
        this.getSelectedServiceAreaAttributeCount = function (dataset, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(dataset, "data/getSelectedServiceAreaAttributeCount",  successFunction, errorFunction);
        };
        this.getAttributeEvaluations = function (dataset, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(dataset, "data/getAttributeEvaluations", successFunction, errorFunction);
        };
        this.createDimensionValueGroup = function (dataset, attributeRoute, successFunction, errorFunction) {
            ajaxService.AjaxPostWithData(dataset, "customerSettings/createDimensionValueGroup" + attributeRoute,  successFunction, errorFunction);
        };
        this.deleteDimensionValueGroup = function (dataset, attributeRoute, successFunction, errorFunction) {
            ajaxService.AjaxPostWithData(dataset, "customerSettings/deleteDimensionValueGroup" + attributeRoute,  successFunction, errorFunction);
        };
        this.updateGeneralSettings=function (customer, attributeRoute, successFunction, errorFunction) {
            ajaxService.AjaxPostWithData(customer, "customerSettings/updateCustomerGeneralSettings" + attributeRoute,  successFunction, errorFunction);
        };
        this.getUsersByCustomer=function (customer, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(customer, "user/getusersbycustomer", successFunction, errorFunction);
        };
        this.deleteUserAccount = function (user, successFunction, errorFunction) {
            ajaxService.AjaxPostWithData(user, "customerSettings/deleteCustomerUser",  successFunction, errorFunction);
        };
        this.addOrUpdateUser=function(user,attributeRoute,successFunction, errorFunction){
            ajaxService.AjaxPostWithData(user, "customerSettings/updateCustomerUser" + attributeRoute,  successFunction, errorFunction);
        };
        this.getCountryMappingByCustomer=function (customer, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(customer, "customerSettings/getCountryMappingData", successFunction, errorFunction);
        };
        this.resetCustomerSettingsUserPassword=function(user,attributeRoute,successFunction,errorFunction){
            ajaxService.AjaxPostWithData(user,"customerSettings/resetpassword"+attributeRoute,successFunction,errorFunction);
        };
        this.getRegionMappingByCustomer = function (customer, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(customer, "customerSettings/getRegionMappingData", successFunction, errorFunction);
        };
        this.getSiteClustersByCustomer = function (customer, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(customer, "customerSettings/getSiteClusterData", successFunction, errorFunction);
        };
        this.getComparatorMapping=function(customer,successFunction,errorFunction){
            ajaxService.AjaxGetWithData(customer,"customerSettings/getComparatorMapping",successFunction,errorFunction);
        };
        this.addOrUpdateComparatorMapping=function(customer,attributeRoute,successFunction,errorFunction){
            return ajaxService.AjaxPostWithData(customer,"customerSettings/updateComparatorMapping"+attributeRoute,successFunction,errorFunction);
        };
        this.getDataFilterSettings=function(customer,successFunction,errorFunction){
            return ajaxService.AjaxGetWithData(customer,"customerSettings/getDataFilters",successFunction,errorFunction);
        };
        this.updateDataFilterSettings=function(customer,attributeRoute,successFunction,errorFunction){
            return ajaxService.AjaxPostWithData(customer,"customerSettings/updateDataFilter"+attributeRoute,successFunction,errorFunction);
        };
        this.getIpMappingByCustomer=function(customer,successFunction,errorFunction){
            return ajaxService.AjaxGetWithData(customer,"customerSettings/GetIpMapping",successFunction,errorFunction);
        };
        this.deleteDataFilter=function(customer,attributeRoute,successFunction,errorFunction){
            return ajaxService.AjaxPostWithData(customer,"customerSettings/deleteDataFilter"+attributeRoute,successFunction,errorFunction);
        };
        this.getShortCodeMapping=function(customer,successFunction,errorFunction){
            return ajaxService.AjaxGetWithData(customer,"customerSettings/getShortcodeMapping",successFunction,errorFunction);
        };
        this.addOrUpdateIPMapping=function(customer,attributeRoute,successFunction,errorFunction){
            return ajaxService.AjaxPostWithData(customer,"customerSettings/updateIPMapping"+attributeRoute,successFunction,errorFunction);
        };
        this.deleteIPMapping=function(customer,attributeRoute,successFunction,errorFunction){
            return ajaxService.AjaxPostWithData(customer,"customerSettings/deleteIPMapping"+attributeRoute,successFunction,errorFunction);
        };
        this.updateShortCodeMapping = function(customer,attributeRoute,successFunction,errorFunction){
            return ajaxService.AjaxPostWithData(customer,"customerSettings/updateShortcodeMapping/"+attributeRoute,successFunction,errorFunction);
        };
        this.getDistinctCountryList=function(customer,successFunction,errorFunction){
            return ajaxService.AjaxGetWithData(customer,"customerSettings/getDistinctCountryList",successFunction,errorFunction);
        };
        this.getDistinctCountriesByDate=function(customer,successFunction,errorFunction){
            return ajaxService.AjaxGetWithData(customer,"customerSettings/getDistinctCountryList",successFunction,errorFunction);
        };
        this.addUpdateCountryMapping = function(customer,attributeRoute,successFunction,errorFunction){
            return ajaxService.AjaxPostWithData(customer,"customerSettings/addUpdateCountryMapping/"+attributeRoute,successFunction,errorFunction);
        };
        this.deleteCountryMapping = function(customer,attributeRoute,successFunction,errorFunction){
            return ajaxService.AjaxPostWithData(customer,"customerSettings/deleteCountryMapping"+attributeRoute,successFunction,errorFunction);
        };
        this.addUpdateRegionMapping = function(customer,attributeRoute,successFunction,errorFunction){
            return ajaxService.AjaxPostWithData(customer,"customerSettings/addUpdateRegionMapping/"+attributeRoute,successFunction,errorFunction);
        };
        this.deleteRegionMapping = function(customer,attributeRoute,successFunction,errorFunction){
            return ajaxService.AjaxPostWithData(customer,"customerSettings/deleteRegionMapping"+attributeRoute,successFunction,errorFunction);
        };
        this.addUpdateSiteCluster = function(customer,attributeRoute,successFunction,errorFunction){
            return ajaxService.AjaxPostWithData(customer,"customerSettings/addUpdateSiteCluster/"+attributeRoute,successFunction,errorFunction);
        };
        this.deleteSiteCluster = function(customer,attributeRoute,successFunction,errorFunction){
            return ajaxService.AjaxPostWithData(customer,"customerSettings/deleteSiteCluster"+attributeRoute,successFunction,errorFunction);
        };
        this.getCustomerGeneralSettings = function(customer,successFunction,errorFunction){
            return ajaxService.AjaxGetWithData(customer,"customerSettings/getCustomerGeneralSettings",successFunction,errorFunction);
        };
        this.addPredefinedCountryValue = function(data,attributeRoute,successFunction,errorFunction){
            return ajaxService.AjaxPostWithData(data,"customerSettings/addPredefinedCountryValue/"+attributeRoute,successFunction,errorFunction);
        };
        this.deletePredefinedCountryValue = function(data,attributeRoute,successFunction,errorFunction){
            return ajaxService.AjaxPostWithData(data,"customerSettings/deletePredefinedCountryValue/"+attributeRoute,successFunction,errorFunction);
        };
        this.getDistinctRegionList=function(customer,successFunction,errorFunction){
            return ajaxService.AjaxGetWithData(customer,"customerSettings/getDistinctRegionList",successFunction,errorFunction);
        };
        this.getDistinctSiteClusterList=function(customer,successFunction,errorFunction){
            return ajaxService.AjaxGetWithData(customer,"customerSettings/getDistinctSiteClusterList",successFunction,errorFunction);
        };
        this.getTopLevelAttributeCount = function(customer,successFunction,errorFunction){
            return ajaxService.AjaxGetWithData(customer,"data/getTopLevelAttributeCount",successFunction,errorFunction);
        }
    }]);
});
