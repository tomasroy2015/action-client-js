define(['application-configuration', 'dataService', 'lodash','datasetSelectionFactory'], function (app) {

    app.register.factory('customerSettingsFactory', ['$rootScope', '$http', 'dataService', 'Notify','datasetSelectionFactory',
        function ($rootScope, $http, dataService, Notify,datasetSelectionFactory ) {

            var customerUsersList=null;
            var countryMappingList = null;
            var regionMappingList = null;
            var siteClusterList = null;
            var ipMappingList = null;
            var shortCodeMappingList = null;
            var selectedCustomer={Giarte:null,Others:null};
            var customerSettingsComparatorList=null;
            var dataFilterSettingsList=null;
            var distinctCountryList = null;
            var customerGeneralSettings = null;
            var distinctRegionList = null;
            var distinctSiteList = null;
            var errorMessage = "Email already used";
            var isDatasetInfoChanged = false;
            var errorFunction = function (response) {
                //Error handling goes here.
                if(response.Message.toLowerCase().trim() == "session expired") {
                    window.alert("Your login session expired, please login again.");

                    if($rootScope.IsLoginFromPentaho)
                        window.location = "/pentaho/";
                    else
                        window.location = "#/";

                    $rootScope.$broadcast(Notify.CLOSE_SETTINGS_WINDOW);
                }else{
                    window.alert("Error in settings operation");
                }
            };
            var userCreationError = function (response) {
                if(response.Message === errorMessage){
                    window.alert("Email is already used");
                }else{
                    window.alert("Error in database operation");
                }
            };
            var onUpdateGeneralSettings=function(response){

               // customerSettingsFactory.GetSelectedCustomer().Others.CustomerId
                //isDatasetInfoChanged = true;
               // console.log("customer: "+selectedCustomer.Others.CustomerId)
                trackDataInfoChange();

            };
            var onDeleteUserAccountSuccess=function(response){

            };
            var onResetCustomerSettingsUserPasswordSuccess=function(response){

            };
            var onGetCustomerUsersList=function(response){
                customerUsersList=response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_USER_DATA_READY);
            };
            var onAddOrUpdateUserSuccess=function(response){
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_USER_ADD_OR_UPDATE_SUCCESS);
            };
            var onGetCountryMappingList=function(response){
                countryMappingList=response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_COUNTRY_MAPPING_DATA_READY);
            };
            var onGetRegionMappingList = function(response){
                regionMappingList = response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_REGION_MAPPING_DATA_READY);
            };
            var onGetSiteClusterList = function(response){
                siteClusterList = response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_SITE_CLUSTER_DATA_READY);
            };
            var onGetComparatorMappingSuccess=function(response){
                customerSettingsComparatorList=response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_COMPARATOR_MAPPING_DATA_READY);
            };
            var onSaveComparatorSuccess = function(response){
                trackDataInfoChange();
                //isDatasetInfoChanged = true;
            };
            var onGetDataFilterSettingsSuccess=function(response){
                dataFilterSettingsList=response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_DATA_FILTER_SETTINGS_DATA_READY);

            };
            var onAddOrUpdateDataFilterSettings=function(response){
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_DATAFILTER_ADD_OR_UPDATE_SUCCESS);
                trackDataInfoChange();
                //isDatasetInfoChanged = true;
            };
            var onDeleteDataFilterSuccess = function(response){
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_DATAFILTER_DELETE_SUCCESS);
                trackDataInfoChange();
                //isDatasetInfoChanged = true;
            };
            var onGetIPMappingList = function(response){
                ipMappingList = response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_IP_MAPPING_DATA_READY);
            };
            var onGetShortCodeMappingList = function(response){
                shortCodeMappingList = response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_SHORTCODE_MAPPING_DATA_READY);
            };
            var onAddOrUpdateIPMappingSuccess=function(response){
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_IPMAPPING_ADD_OR_UPDATE_SUCCESS);
            };
            var onDeleteIPMappingSuccess =function(response){

            };

            var onUpdateShortCodeMapping = function(response){
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_SHORT_CODE_UPDATE_SUCCESS);
                trackDataInfoChange();
                //isDatasetInfoChanged = true;

            };
            var onGetDistinctCountryList = function(response){
                distinctCountryList = response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_DISTINCT_COUNTRY_DATA_READY);
            };
            var onGetDistinctCountriesByDate = function(response){
                distinctCountryList = response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_DISTINCT_COUNTRY_BY_DATE_DATA_READY);
            };
            var onAddOrUpdateCountryMappingSuccess = function(response){
                countryMappingList=response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_COUNTRYMAPPING_ADD_UPDATE_SUCCESS);
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_COUNTRY_MAPPING_DATA_READY);
            };
            var onDeleteCountryMappingSuccess = function(response){
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_COUNTRYMAPPING_DELETE_SUCCESS);
                countryMappingList=response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_COUNTRY_MAPPING_DATA_READY);
            };
            var onAddOrUpdateRegionMappingSuccess = function(response){
                regionMappingList=response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_REGIONMAPPING_ADD_UPDATE_SUCCESS);
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_REGION_MAPPING_DATA_READY);
            };
            var onDeleteRegionMappingSuccess = function(response){
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_REGIONMAPPING_DELETE_SUCCESS);
                regionMappingList=response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_REGION_MAPPING_DATA_READY);
            };
            var onAddOrUpdateSiteMappingSuccess = function(response){
                siteClusterList = response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_SITE_CLUSTER_ADD_UPDATE_SUCCESS);
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_SITE_CLUSTER_DATA_READY);
            };
            var onDeleteSiteMappingSuccess = function(response){
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_SITE_CLUSTER_DELETE_SUCCESS);
                siteClusterList = response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_SITE_CLUSTER_DATA_READY);
            };
            var onGetCustomerGeneralSettings = function(response){
                customerGeneralSettings = response;
                $rootScope.$broadcast(Notify.CUSTOMER_GENERAL_SETTINGS_DATA_READY);
            };
            var onAddPredefinedValue = function(response){
                $rootScope.$broadcast(Notify.CUSTOMER_GENERAL_SETTINGS_PREDEFINED_VALUE_ADDED,{data:response});
            };
            var onDeletePredefinedValue = function(response){
                $rootScope.$broadcast(Notify.CUSTOMER_GENERAL_SETTINGS_PREDEFINED_VALUE_DELETED,{data:response});
            };
            var onGetDistinctRegionList = function(response){
                distinctRegionList = response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_DISTINCT_REGION_DATA_READY);
            };
            var onGetDistinctSiteList = function(response){
                distinctSiteList = response;
                $rootScope.$broadcast(Notify.CUSTOMER_SETTINGS_DISTINCT_SITE_DATA_READY);
            };
            function trackDataInfoChange(){
                var loadedCustomer = datasetSelectionFactory.selectedCustomer;
                if(!loadedCustomer || !selectedCustomer.Others){
                    isDatasetInfoChanged = false;
                }
                else{
                    //console.log("loaded cust: "+loadedCustomer.CustomerId+" selected cust: "+selectedCustomer.CustomerId);
                    if(loadedCustomer.CustomerId === selectedCustomer.Others.CustomerId)
                        isDatasetInfoChanged = true;
//                    else
//                        isDatasetInfoChanged = false;
                }

            }

            return{
                UpdateGeneralSettings:function(dataModel,attributeRoute){
                  return  dataService.updateGeneralSettings(dataModel,attributeRoute,onUpdateGeneralSettings,errorFunction);

                },
               GetCustomerUsersList:function(customer){
                    return dataService.getUsersByCustomer(customer,onGetCustomerUsersList,errorFunction);
                },
                CustomerUsersList:function(){
                  return customerUsersList;
                },
                DeleteUserAccount:function(user){
                    return dataService.deleteUserAccount(user,onDeleteUserAccountSuccess,errorFunction);
                },
                AddUpdateUserAccount:function(user,attributeRoute){
                    return dataService.addOrUpdateUser(user,attributeRoute,onAddOrUpdateUserSuccess,userCreationError);
                },
                ResetCustomerSettingsUserPassword:function(user,attRoute){
                    return dataService.resetCustomerSettingsUserPassword(user,attRoute,onResetCustomerSettingsUserPasswordSuccess,errorFunction);
                },
                SetSelectedCustomer:function(customer){
                    if(customer.CustomerId=="GIA"){
                        selectedCustomer.Giarte=customer
                    }
                    else{
                        selectedCustomer.Others=customer;
                    }
                },
                GetSelectedCustomer:function(){
                    return selectedCustomer;
                },
                GetComparatorMapping:function(customer){
                    return dataService.getComparatorMapping(customer,onGetComparatorMappingSuccess,errorFunction);
                },
                GetComparatorMappingCollection:function(){
                    return customerSettingsComparatorList;
                },
                SaveComparatorMappingSettings:function(customer,attributeRoute){
                    dataService.addOrUpdateComparatorMapping(customer,attributeRoute,onSaveComparatorSuccess,errorFunction);
                },
                GetCountryMapping:function(customer){
                    return dataService.getCountryMappingByCustomer(customer,onGetCountryMappingList,errorFunction);
                },
                CountryMappingList:function(){
                    return countryMappingList;
                },
                GetRegionMapping:function(customer){
                    return dataService.getRegionMappingByCustomer(customer,onGetRegionMappingList,errorFunction);
                },
                RegionMappingList:function(){
                    return regionMappingList;
                },
                GetSiteClusters:function(customer){
                    return dataService.getSiteClustersByCustomer(customer,onGetSiteClusterList,errorFunction);
                },
                SiteClusterList:function(){
                    return siteClusterList;
                },
                GetDataFilterSettings:function(customer){
                    return dataService.getDataFilterSettings(customer,onGetDataFilterSettingsSuccess,errorFunction);
                },
                DataFilterSettingsList:function(){
                    return dataFilterSettingsList;
                },
                AddOrUpdateDataFilterSettings:function (customer,attributeRoute){
                    return dataService.updateDataFilterSettings(customer,attributeRoute,onAddOrUpdateDataFilterSettings,errorFunction);
                },
                DeleteDataFilter:function(customer,attributeRoute){
                    return dataService.deleteDataFilter(customer,attributeRoute,onDeleteDataFilterSuccess,errorFunction);
                },
                GetIpMapping:function(customer){
                    return dataService.getIpMappingByCustomer(customer,onGetIPMappingList,errorFunction);
                },
                IpMappingList:function(){
                    return ipMappingList;
                },
                GetShortCodeMapping:function(customer){
                    return dataService.getShortCodeMapping(customer,onGetShortCodeMappingList,errorFunction);
                },
                ShortCodeMappingList:function(){
                    return shortCodeMappingList;
                },
                AddOrUpdateIPMapping:function(customer,attributeRoute){
                    return dataService.addOrUpdateIPMapping(customer,attributeRoute,onAddOrUpdateIPMappingSuccess,errorFunction);
                },
                DeleteIPMapping:function(customer,attributeRoute){
                    return dataService.deleteIPMapping(customer,attributeRoute,onDeleteIPMappingSuccess,errorFunction);
                },
                UpdateShortCodeMapping:function(customer,attributeRoute){
                    return dataService.updateShortCodeMapping(customer,attributeRoute,onUpdateShortCodeMapping,errorFunction);
                },
                GetDistinctCountryList:function(customer){
                    return dataService.getDistinctCountryList(customer,onGetDistinctCountryList,errorFunction);
                },
                GetDistinctCountriesByDate:function(customer){
                    return dataService.getDistinctCountriesByDate(customer,onGetDistinctCountriesByDate,errorFunction);
                },
                DistinctCountryList:function(){
                    return distinctCountryList;
                },
                AddUpdateCountryMapping:function(customer,attributeRoute){
                    return dataService.addUpdateCountryMapping(customer,attributeRoute,onAddOrUpdateCountryMappingSuccess,errorFunction);
                },
                DeleteCountryMapping:function(customer,attributeRoute){
                    return dataService.deleteCountryMapping(customer,attributeRoute,onDeleteCountryMappingSuccess,errorFunction);
                },
                AddUpdateRegionMapping:function(customer,attributeRoute){
                    return dataService.addUpdateRegionMapping(customer,attributeRoute,onAddOrUpdateRegionMappingSuccess,errorFunction);
                },
                DeleteRegionMapping:function(customer,attributeRoute){
                    return dataService.deleteRegionMapping(customer,attributeRoute,onDeleteRegionMappingSuccess,errorFunction);
                },
                AddUpdateSiteCluster:function(customer,attributeRoute){
                    return dataService.addUpdateSiteCluster(customer,attributeRoute,onAddOrUpdateSiteMappingSuccess,errorFunction);
                },
                DeleteSiteCluster:function(customer,attributeRoute){
                    return dataService.deleteSiteCluster(customer,attributeRoute,onDeleteSiteMappingSuccess,errorFunction);
                },
                GetCustomerGeneralSettings:function(customer){
                    return dataService.getCustomerGeneralSettings(customer,onGetCustomerGeneralSettings,errorFunction);
                },
                CustomerGeneralSettings:function(){
                    return customerGeneralSettings;
                },
                AddPredefinedCountryValue:function(data,attributeRoute){
                    return dataService.addPredefinedCountryValue(data,attributeRoute,onAddPredefinedValue,errorFunction);
                },
                DeletePredefinedCountryValue:function(data,attributeRoute){
                    return dataService.deletePredefinedCountryValue(data,attributeRoute,onDeletePredefinedValue,errorFunction);
                },
                GetDistinctRegionList:function(customer){
                    return dataService.getDistinctRegionList(customer,onGetDistinctRegionList,errorFunction);
                },
                DistinctRegionList:function(){
                    return distinctRegionList;
                },
                GetDistinctSiteList:function(customer){
                    return dataService.getDistinctSiteClusterList(customer,onGetDistinctSiteList,errorFunction);
                },
                DistinctSiteList:function(){
                    return distinctSiteList;
                },
                IsDatasetInfoChanged:function(status){
                    isDatasetInfoChanged = status;
                },
                DatasetInfoChangedStatus:function(){
                    return isDatasetInfoChanged;
                }
            };

        }]);
});
