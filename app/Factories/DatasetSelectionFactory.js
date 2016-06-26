define(['application-configuration', 'ajaxService','dataFactory','accountFactory','leftMenuSlidingWindowEventNotifyFactory'], function (app) {

    app.register.factory('datasetSelectionFactory', ['$rootScope', '$http','$filter', 'ajaxService','dataFactory','accountFactory','leftMenuSlidingWindowEventNotifyFactory','UserType','Notify',
        function ($rootScope, $http,$filter, ajaxService,dataFactory,accountFactory,leftMenuSlidingWindowEventNotifyFactory,UserType,Notify) {
        var datasetFactory = {};
        var selectedCustomerID = "";
        datasetFactory.customers = {};
        datasetFactory.currentuser = null;
        datasetFactory.FromDate =null;
        datasetFactory.ToDate = null;
        datasetFactory.customerID = null;
        datasetFactory.sessionID = null;
        datasetFactory.dataSetName = "";
        datasetFactory.resetFilterOrView = false;
        initializeDataset();

        function initializeDataset(){
            /*For By pass Login page ; If use for Pentaho plz uncomment */
            if($rootScope.IsLoginFromPentaho === true)
                accountFactory.SetUserData($rootScope.UserData);
            $rootScope.isNeedToShowLoading = false;
            datasetFactory.currentuser = accountFactory.UserData();
            datasetFactory.sessionID = datasetFactory.currentuser.SessionId;
            datasetFactory.isMultipleCustomer = datasetFactory.currentuser.UserToCustomers.length > 1 ;
        }

        $rootScope.$on(Notify.LOGOUT_SUCCESSFUL, function(event){
                if(!angular.isUndefined(datasetFactory.selectedCustomer)){
                    delete datasetFactory.selectedCustomer;
                }
        });

        datasetFactory.changeDataSet = function () {
            leftMenuSlidingWindowEventNotifyFactory.setDatasetLoadEvent(true);
            $rootScope.IsDatasetLoaded = false;
            datasetFactory.customerID = datasetFactory.selectedCustomer.CustomerId;

            if(!isInputValidated())
                return;

            $rootScope.isNeedToShowLoading = true;
            $rootScope.loadTitle = "Loading dataset";
            datasetFactory.dataSetName = getDataSetName(datasetFactory);
            createDateRange();
            var dataSet = createParameter();

            if(selectedCustomerID === dataSet.customerID){
                dataFactory.ChangeDataSet(dataSet);
            }else{
                selectedCustomerID = dataSet.customerID;
                dataFactory.LoadDataSet(dataSet);
                dataFactory.SetResetFilterOrView(true);
            }
        };

        datasetFactory.customerChanged = function(){
                datasetFactory.customerID = datasetFactory.selectedCustomer.CustomerId;
        };

        function createDateRange(){
            var newDate = new Date();
            var firstDate;
            var lastDate;
            var firstDayOFCurrentMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);

            switch (datasetFactory.selectedValue) {
                case "MonthToDate":
                    //First date of current month
                    firstDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
                    //Yesterday date
                    lastDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
                    //Added 14 Oct 2015
                    if(firstDate.toDateString().toLowerCase().trim() === firstDayOFCurrentMonth.toDateString().toLowerCase().trim()
                        && lastDate.toDateString().toLowerCase().trim() === firstDayOFCurrentMonth.toDateString().toLowerCase().trim())
                    {
                        firstDate = new Date(newDate.getFullYear(), newDate.getMonth() - 1, 1); //First date of the last month
                        lastDate = new Date((new Date(firstDate.getFullYear(), firstDate.getMonth() + 1, 1)) - 1); //last date of the last month
                    }
                    //end
                    datasetFactory.FromDate = firstDate;
                    datasetFactory.ToDate = lastDate;
                    break;
                case "Month":
                    datasetFactory.FromDate = datasetFactory.selectedMonth.startDate;
                    datasetFactory.ToDate = datasetFactory.selectedMonth.endDate;
                    break;
                case "Quarter":
                    datasetFactory.FromDate = datasetFactory.selectedQuarter.startDate;
                    datasetFactory.ToDate = datasetFactory.selectedQuarter.endDate;
                    break;
                case "DateRange":
                    datasetFactory.FromDate = datasetFactory.dtpValueFromDate;
                    datasetFactory.ToDate = datasetFactory.dtpValueToDate;
                    break;
                default:
                    datasetFactory.FromDate = null;
                    datasetFactory.ToDate = null;
                    break;
            }
        }
        function isInputValidated()
        {
            var isValid = true;

            if(datasetFactory.selectedValue === "DateRange") {
                isValid = isValidDateRange();
            }

            return isValid;
        }

        function createParameter(){
            setSelectedDataset();
            var params = {
                sessionID: accountFactory.UserData().SessionId,
                customerID: datasetFactory.customerID,
                fromDate: $filter('date')(datasetFactory.FromDate, 'yyyy-MM-dd HH:mm:ss'),
                toDate:  $filter('date')(new Date(datasetFactory.ToDate.getTime()-999), 'yyyy-MM-dd HH:mm:ss')
            };
            datasetFactory.FromDate = params.fromDate;
            datasetFactory.ToDate = params.toDate;
            return params;
        }
        function setSelectedDataset(){
            var selDataset = {
                sessionID: datasetFactory.currentuser.SessionId,
                customerID: datasetFactory.selectedCustomer.CustomerId,
                datasetName: datasetFactory.selectedValue,
                selectedCustomer: datasetFactory.selectedCustomer,
                customers: datasetFactory.UserToCustomers,
                selectedMonth: datasetFactory.selectedMonth,
                selectedQuarter: datasetFactory.selectedQuarter,
                fromDate: datasetFactory.FromDate,
                toDate: datasetFactory.ToDate,
                LastSixMonth: datasetFactory.LastSixMonth,
                QuarterColl: datasetFactory.QuarterColl
            };
            dataFactory.SetDataSetInfo(selDataset);
        }
        function isValidInput(){
            var isValid = true;
            if( datasetFactory.selectedValue === null)
            {
                alert("Please select a criteria ");
                isValid = false;
                return isValid;
            }
            return isValid;
        }

        function isValidDateRange(){
            var isValid = true;

            if(datasetFactory.dtpValueFromDate === null || datasetFactory.dtpValueToDate === null) {
                alert("Please select a DateRange");
                isValid = false;
                return isValid;
            }
            if(typeof datasetFactory.dtpValueFromDate === "undefined" || typeof datasetFactory.dtpValueToDate === "undefined") {
                alert("Please select a valid DateRange");
                isValid = false;
                return isValid;
            }
            if(datasetFactory.dtpValueFromDate >  datasetFactory.dtpValueToDate) {
                alert("Please select a valid DateRange");
                isValid = false;
                return isValid;
            }

            return isValid
        }
        datasetFactory.selDataSet_Checked = function(value){
            datasetFactory.selectedValue = value.toString();
        };
        datasetFactory.setSelectedDataset = function(dataset){
            selectedCustomerID = dataset.selectedCustomer.CustomerId;
            datasetFactory.selectedValue = dataset.datasetName;
            datasetFactory.selectedCustomer = dataset.selectedCustomer;
            datasetFactory.selectedMonth = dataset.selectedMonth;
            datasetFactory.selectedQuarter = dataset.selectedQuarter;
            datasetFactory.customers = dataset.customers;
            datasetFactory.FromDate = dataset.fromDate;
            datasetFactory.ToDate = dataset.toDate;

            if(datasetFactory.selectedValue.toLowerCase() == "daterange") {
                datasetFactory.dtpValueFromDate = dataset.fromDate;
                datasetFactory.dtpValueToDate = dataset.toDate;
            }
            else{
                datasetFactory.dtpValueFromDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
                datasetFactory.dtpValueToDate = new Date(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1) - 1);
            }
            datasetFactory.isMultipleCustomer = accountFactory.UserData().UserToCustomers.length > 1;
            datasetFactory.LastSixMonth =  dataset.LastSixMonth;
            datasetFactory.QuarterColl =  dataset.QuarterColl;
            datasetFactory.dataSetName = getDataSetName(datasetFactory);
        };

        function getDataSetName(dataset){
            var datasetName = "";
            switch(dataset.selectedValue.toLowerCase().trim()){
                case "monthtodate":
                    datasetName = "CURRENT MONTH";
                    break;
                case "month":
                    datasetName = dataset.selectedMonth.Name.toUpperCase();
                    break;
                case "quarter":
                    datasetName = dataset.selectedQuarter.Name.toUpperCase();
                    break;
                case "daterange":
                    datasetName = "CUSTOM DATE";
                    break;
            }
            return datasetName;
        }
        datasetFactory.setResetCheckbox = function(value){
            datasetFactory.resetFilterOrView = value;
            dataFactory.SetResetFilterOrView(value);
        };
        datasetFactory.reset_clickHandler = function(){
            datasetFactory.resetFilterOrView = !datasetFactory.resetFilterOrView;
            dataFactory.SetResetFilterOrView(datasetFactory.resetFilterOrView);
        };
        return datasetFactory;
    }]);
});

