
define(['application-configuration','dataFactory','alertsService','accountFactory','datasetSelectionFactory','customerSettingsController'], function (app) {
    app.register.controller('datasetController', ['$scope', '$rootScope','$filter','dataFactory','alertsService','accountFactory','Notify','datasetSelectionFactory','appSettings','$modal','UserType',
        function ($scope,$rootScope,$filter,dataFactory,alertsService, accountFactory,Notify,datasetSelectionFactory,appSettings,$modal,UserType) {
            $rootScope.closeAlert = alertsService.closeAlert;
            $rootScope.alerts = [];

            //april 18-2015
            $scope.customer = {};
            $scope.currentuser = null;
            $scope.FromDate =null;
            $scope.ToDate = null;
            $scope.dtpValueFromDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
            $scope.dtpValueToDate = new Date(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1) - 1);
            $scope.customerID = null;
            $scope.selectedCustomer = null;
            $scope.sessionID = null;
            //$scope.isNeedToShowLoading = false;
            $scope.selectedValue = "MonthToDate";
            $scope.selectedMonth = null;
            $scope.selectedQuarter = null;
            $scope.customerID = null;
            $scope.LastSixMonth = [{Name:"",startDate:new Date(),endDate:new Date()}];
            $scope.QuarterColl = [{Name:"",startDate:new Date(),endDate:new Date()}];
            $scope.Version = appSettings.APPLICATION_VERSION;

            $scope.IsLoginFromPentaho = $rootScope.IsLoginFromPentaho;

            $scope.initializeController = function(){
                var month = ['January', 'February', 'March', 'April', 'May', 'June',
                             'July', 'August', 'September', 'October', 'November', 'December'];

                $rootScope.isNeedToShowLoading = false;
                $scope.currentuser = accountFactory.UserData();
                $scope.sessionID = $scope.currentuser.SessionId;
                $scope.ClientLabel =  $scope.currentuser.UserToCustomers.length > 1 ? "SELECT CLIENT" :"CLIENT :";
                $scope.isMultipleCustomer = $scope.currentuser.UserToCustomers.length > 1;
                $scope.getMonthSelectionData(month);
                $scope.getQuarterSelectionData();
            };

            $scope.getMonthSelectionData = function(month){
                /* old code
                    var newDate = new Date();
                    var firstDate = new Date(newDate.getFullYear(), newDate.getMonth() - 6, 1); //First date of the last sixth month
                    var lastDate = new Date((new Date(firstDate.getFullYear(), firstDate.getMonth() + 1, 1)) - 1); //last date of the last sixth month

                    $scope.LastSixMonth.pop();
                    $scope.LastSixMonth.push({Name:month[firstDate.getMonth()]+" - "+ firstDate.getFullYear().toString(),startDate:firstDate,endDate:lastDate});

                    for ( var i = 1; i < 6; i++){
                        var fDate = new Date(firstDate.getFullYear(), firstDate.getMonth() + i, 1);
                        var lDate = new Date((new Date(fDate.getFullYear(), fDate.getMonth() + 1, 1)) - 1);
                        $scope.LastSixMonth.push({Name: month[fDate.getMonth()]+" - "+ fDate.getFullYear().toString(),startDate:fDate,endDate:lDate});
                    }
                */

                var newDate = new Date();
                var firstDate = new Date(newDate.getFullYear(), newDate.getMonth() - 1, 1); //First date of the last month
                var lastDate = new Date((new Date(firstDate.getFullYear(), firstDate.getMonth() + 1, 1)) - 1); //last date of the last month

                $scope.LastSixMonth.pop();
                $scope.LastSixMonth.push({Name:month[firstDate.getMonth()]+" - "+ firstDate.getFullYear().toString(),startDate:firstDate,endDate:lastDate});

                for ( var i = 1; i < 6; i++){
                    var fDate = new Date(firstDate.getFullYear(), firstDate.getMonth() - i, 1);
                    var lDate = new Date((new Date(fDate.getFullYear(), fDate.getMonth() + 1, 1)) - 1);
                    $scope.LastSixMonth.push({Name: month[fDate.getMonth()]+" - "+ fDate.getFullYear().toString(),startDate:fDate,endDate:lDate});
                }
            };

            $scope.getQuarterSelectionData = function(){
                var count = 1,quarterName = "";
                var subtractMonth;
                var newDate = new Date();

                var firstDate = new Date(); //first date of current month
                var lastDate = new Date();
                var monthCount = new Date().getMonth() + 1;

                if((monthCount - 1)%3 == 0){
                    firstDate = new Date(newDate.getFullYear(), newDate.getMonth() - 3, 1);
                    lastDate = new Date((new Date(firstDate.getFullYear(), firstDate.getMonth() + 3, 1)) - 1);
                }
                else{
                    if(monthCount > 3){subtractMonth = new Date().getMonth();}
                    if(monthCount > 7){subtractMonth = new Date().getMonth() - 3;}
                    if(monthCount > 9){ subtractMonth = new Date().getMonth() - 6;}
                    if(monthCount <= 3){subtractMonth = 3 + new Date().getMonth();}

                    firstDate = new Date(newDate.getFullYear(), newDate.getMonth() - subtractMonth, 1);
                    lastDate = new Date((new Date(firstDate.getFullYear(), firstDate.getMonth() + 3, 1)) - 1);
                }

                $scope.QuarterColl.pop();
                $scope.QuarterColl.push({Name:getQuarterName(lastDate),startDate:firstDate,endDate:lastDate});

                for ( var i = 3; i < 12; i = i+3) {
                    var fDate = new Date(firstDate.getFullYear(), firstDate.getMonth() - i, 1);
                    var lDate = new Date((new Date(fDate.getFullYear(), fDate.getMonth() + 3, 1)) - 1);
                    $scope.QuarterColl.push({Name: getQuarterName(lDate), startDate: fDate, endDate: lDate});
                    count++;
                }
            };

            function getQuarterName(lastDate){
                var quarterName = "";
                var lastMonth = lastDate.getMonth();
                switch(lastMonth){
                    case 2:
                        quarterName="1st Quarter - "+lastDate.getFullYear().toString();
                        break;
                    case 5:
                        quarterName="2nd Quarter - "+lastDate.getFullYear().toString();
                        break;
                    case 8:
                        quarterName="3rd Quarter - "+lastDate.getFullYear().toString();
                        break;
                    case 11:
                        quarterName="4th Quarter - "+lastDate.getFullYear().toString();
                        break;
                }
                return quarterName;
            }
            $scope.getCustomerDataSet = function () {
                $rootScope.IsDatasetLoaded = false;
                $scope.customerID = $scope.selectedCustomer.CustomerId;

                if(!$scope.isInputValidated())
                    return;

                $rootScope.isNeedToShowLoading = true;
                $rootScope.loadTitle = "Loading dataset";
                $scope.createDateRange();
                var dataSet = $scope.createParameter();
                dataFactory.LoadDataSet(dataSet);
            };



            $scope.$on(Notify.DATA_READY, function(event){
                $rootScope.isNeedToShowLoading = false;
                window.location = "#/Main";
            });

            $scope.customerChanged = function(){
                $scope.customerID = $scope.selectedCustomer.CustomerId;
            };

            $scope.createDateRange = function(){
                var newDate = new Date();
                var firstDate;
                var lastDate;
                var firstDayOFCurrentMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);

                switch ($scope.selectedValue) {
                    case "MonthToDate":
                        //First date of current month
                        firstDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
                        //last datetime of of yesterday
                        lastDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
                        //Added 1 Oct 2015
                        if(firstDate.toDateString().toLowerCase().trim() === firstDayOFCurrentMonth.toDateString().toLowerCase().trim()
                            && lastDate.toDateString().toLowerCase().trim() === firstDayOFCurrentMonth.toDateString().toLowerCase().trim())
                        {
                            firstDate = new Date(newDate.getFullYear(), newDate.getMonth() - 1, 1); //First date of the last month
                            lastDate = new Date((new Date(firstDate.getFullYear(), firstDate.getMonth() + 1, 1)) - 1); //last date of the last month
                        }
                        //end
                        $scope.FromDate = firstDate;
                        $scope.ToDate = lastDate;
                        break;
                    case "Month":
                        $scope.FromDate = $scope.selectedMonth.startDate;
                        $scope.ToDate = $scope.selectedMonth.endDate;
                        break;
                    case "Quarter":
                        $scope.FromDate = $scope.selectedQuarter.startDate;
                        $scope.ToDate = $scope.selectedQuarter.endDate;
                        break;
                    case "DateRange":
                        $scope.FromDate = $scope.dtpValueFromDate;
                        $scope.ToDate = $scope.dtpValueToDate;
                        break;
                    default:
                        $scope.FromDate = null;
                        $scope.ToDate = null;
                        break;
                }
            };
            $scope.isInputValidated = function()
            {
                var isValid = true;

                if($scope.selectedValue === "DateRange") {
                    isValid = $scope.isValidDateRange();
                }

                return isValid
            };

            $scope.createParameter = function(){
                var params = {
                     sessionID: $scope.sessionID,
                    customerID: $scope.customerID,
//                    fromDate:new Date(Date.UTC( $scope.FromDate.getFullYear(), $scope.FromDate.getMonth(), $scope.FromDate.getDate())),
//                    toDate:new Date(Date.UTC( $scope.ToDate.getFullYear(), $scope.ToDate.getMonth(), $scope.ToDate.getDate()))

                    fromDate: $filter('date')($scope.FromDate, 'yyyy-MM-dd HH:mm:ss'),
                      toDate:  $filter('date')(new Date($scope.ToDate.getTime()-999), 'yyyy-MM-dd HH:mm:ss')
                };

                createSelectedDataSet();

                return params;
            };

            $scope.isValidInput = function(){
                var isValid = true;
                if( $scope.selectedValue === null)
                {
                    alert("Please select a criteria ");
                    isValid = false;
                    return isValid;
                }
                return isValid
            };

            $scope.isValidDateRange = function(){
                var isValid = true;

                if($scope.dtpValueFromDate === null || $scope.dtpValueToDate === null) {
                    alert("Please select a daterange");
                    isValid = false;
                    return isValid;
                }
                if(typeof $scope.dtpValueFromDate === "undefined" || typeof $scope.dtpValueToDate === "undefined") {
                    alert("Please select a valid daterange");
                    isValid = false;
                    return isValid;
                }
                if($scope.dtpValueFromDate >  $scope.dtpValueToDate) {
                    alert("Please select a valid daterange");
                    isValid = false;
                    return isValid;
                }

                return isValid
            };

            var setSelectedDataset = function(){
                var selDataset = {
                    sessionID: $scope.sessionID,
                    customerID: $scope.customerID,
                    datasetName: $scope.selectedValue,
                    selectedCustomer: $scope.selectedCustomer,
                    customers:$scope.currentuser.UserToCustomers,
                    selectedMonth: $scope.selectedMonth,
                    selectedQuarter: $scope.selectedQuarter,
                    fromDate:$scope.FromDate,
                    toDate: $scope.ToDate,
                    LastSixMonth: $scope.LastSixMonth,
                    QuarterColl: $scope.QuarterColl
                };
                return selDataset;
            };

            var createSelectedDataSet = function(){
                var dataset = setSelectedDataset();
                datasetSelectionFactory.setSelectedDataset(dataset);
                dataFactory.SetDataSetInfo(dataset);
            };
            /* log out */
            $scope.logoutData = function () {
                $rootScope.IsloggedOut = false;
                $rootScope.isNeedToShowLoading = true;
                $rootScope.loadTitle = "Log out";
                var user = accountFactory.UserData();
                accountFactory.LogOut(user);
            };
            $scope.$on(Notify.LOGOUT_SUCCESSFUL, function(event){
                window.location = "#/";
                $rootScope.isNeedToShowLoading = false;
            });
            $scope.dataSet_Checked = function(value){
                $scope.selectedValue = value.toString();
            };
            $scope.settings_clickHandler=function($event){

                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'Views/CustomerSettings/CustomerSettingsTemplate.html',
                    controller: 'customerSettingsController',
                    size: 'lg',
                    resolve: {
                        items: function () {
                            return "parent controlller data";
                        }
                    }, keyboard: false,
                    backdrop: 'static'
                });

                modalInstance.result.then(function (selectedItem) {
                    $scope.selected = selectedItem;
                }, function () {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            };







//            $scope.logoutCompleted = function (response) {
//                window.location = "#/";
//                $scope.isNeedToShowLoading = false;
//            };
//
//            $scope.logoutError = function (response) {
//                alertsService.RenderErrorMessage(response.ReturnMessage);
//            };
        }]);
});