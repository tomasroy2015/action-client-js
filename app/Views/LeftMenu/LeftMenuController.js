"use strict";

define(['application-configuration', 'alertsService', 'dataFactory', 'comparatorFactory', 'datasetSelectionFactory', 'leftMenuSlidingWindowEventNotifyFactory', 'moreSettingsFactory', 'serviceAreaScoreData', 'dataFilterFactory', 'accountFactory'], function (app) {


    app.register.controller('leftMenuController', ['$scope', '$rootScope', '$compile', 'alertsService', 'dataFactory', 'appSettings', 'Notify', 'ComparatorType', 'comparatorFactory', 'datasetSelectionFactory', 'leftMenuSlidingWindowEventNotifyFactory', 'moreSettingsFactory', 'serviceAreaScoreData', '$timeout', 'dataFilterFactory', 'accountFactory', 'UserType',
        function ($scope, $rootScope, $compile, alertsService, dataFactory, appSettings, Notify, ComparatorType, comparatorFactory, datasetSelectionFactory, leftMenuSlidingWindowEventNotifyFactory, moreSettingsFactory, serviceAreaScoreData, $timeout, dataFilterFactory, accountFactory, UserType) {

            $scope.leftMenuSlidingWindowEventNotify = leftMenuSlidingWindowEventNotifyFactory;
            loadInitialData();
            function loadInitialData() {

                var startDate = new Date(new Date(dataFactory.DataSetInfo().fromDate).toLocaleDateString());
                var endDate = new Date(new Date(dataFactory.DataSetInfo().toDate).toLocaleDateString());
                $scope.logoUrl = dataFactory.CustomerGeneralSettings().LogoURL;
                $scope.comparatorSettings = comparatorFactory;
                $scope.moreSettings = moreSettingsFactory;
                $scope.datasetName = datasetSelectionFactory.dataSetName;
                $scope.datasetDaterange = getDataSetDateRangeString(startDate, endDate);
                prepareDataFilterAttributeCollection(dataFactory.CustomAttributeCollection());
                prepareServiceAreaCollection(dataFactory.ServiceAreaCollection());
                prepareServiceAreaScoreDataCollection(dataFactory.ServiceAreaScoreDataCollection());
                $scope.isActivityLogEnable = accountFactory.UserData().UserType == UserType.GIARTE_ADMIN;
                $scope.IsEvaluationBtnDisabled = false;
                $scope.IsDetailsRoleActive = accountFactory.IsDetailsRoleActive();
                /* By default first question selection */
                $timeout(function () {
                    //onSelectFirstServiceAreaQuestion();
                    getEvaluationCount();
                }, 0);
            }

            $scope.getLeftMenuEvaluationCount = function () {
                return (isNaN($scope.noOfRespondent) || angular.isUndefined($scope.noOfRespondent)) ? 0 : $scope.noOfRespondent
            };

            /* Notification for Dataset ready */
            $scope.$on(Notify.DATA_READY, function () {
                loadInitialData();
            });
            /* Notification for reset data after customer settings changed */
            $rootScope.$on(Notify.RELOAD_DATASET_FOR_CUSTOMER_SETTINGS_CHANGED, function(event){
                $rootScope.IsDatasetLoaded = false;
                leftMenuSlidingWindowEventNotifyFactory.setDatasetLoadEvent(false);
                dataFactory.SetResetFilterOrView(true);
                if(dataFactory.IsResetFilterOrView()){
                    dataFactory.DataInfo().gFilter = null;
                    dataFactory.DataInfo().tFilter = null;
                }
                var selectedDataSet = dataFactory.DataInfo();
                dataFactory.LoadDataSet(selectedDataSet);
            });

            /* Notification for Dataset changed event */
            $scope.$on(Notify.DATASET_CHANGED, function () {
                //closeDatasetWindow();
                $scope.logoUrl = dataFactory.CustomerGeneralSettings().LogoURL;

                var fromDate = new Date(new Date(dataFactory.DataSetInfo().fromDate).toLocaleDateString());
                var toDate = new Date(new Date(dataFactory.DataSetInfo().toDate).toLocaleDateString());
                $scope.comparatorSettings = comparatorFactory;
                $scope.datasetName = datasetSelectionFactory.dataSetName;
                $scope.datasetDaterange = getDataSetDateRangeString(fromDate, toDate);

                prepareDataFilterAttributeCollection(dataFactory.CustomAttributeCollection());
                prepareServiceAreaCollection(dataFactory.ServiceAreaCollection());
                prepareServiceAreaScoreDataCollection(dataFactory.ServiceAreaScoreDataCollection());

                /* By default first question selection */
                $timeout(function () {
                    //onSelectFirstServiceAreaQuestion();
                    getEvaluationCount();
                    onServiceAreaDataReady();
                }, 0);
            });

            function getDataSetDateRangeString(startDate, endDate) {
                var newDate = new Date();
                var firstDate;
                var lastDate;
                var firstDayOFCurrentMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
                //First date of current month
                firstDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
                //last datetime of of yesterday
                lastDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());

                if(dataFactory.DataSetInfo().datasetName == "MonthToDate"){
                    if(firstDate.toDateString().toLowerCase().trim() === firstDayOFCurrentMonth.toDateString().toLowerCase().trim()
                        && lastDate.toDateString().toLowerCase().trim() === firstDayOFCurrentMonth.toDateString().toLowerCase().trim())
                    {
                        endDate = dataFactory.DataSetInfo().toDate;
                    }else{
                        endDate = new Date(dataFactory.DataSetInfo().toDate.getFullYear(), dataFactory.DataSetInfo().toDate.getMonth(), dataFactory.DataSetInfo().toDate.getDate()-1);
                    }
                }

                var months = new Array(12);
                months[0] = "Jan";
                months[1] = "Feb";
                months[2] = "Mar";
                months[3] = "Apr";
                months[4] = "May";
                months[5] = "Jun";
                months[6] = "Jul";
                months[7] = "Aug";
                months[8] = "Sep";
                months[9] = "Oct";
                months[10] = "Nov";
                months[11] = "Dec";

                var startDateStr = startDate.getDate() + " " + months[startDate.getMonth()] + " " + startDate.getFullYear();
                var endDateStr = endDate.getDate() + " " + months[endDate.getMonth()] + " " + endDate.getFullYear();
                return startDateStr + " - " + endDateStr;

            }

            function onServiceAreaDataReady() {
                dataFactory.preparedServiceAreaScoreDataCollection();
            }

            $scope.itemClicked = function (selectedItem) {
                //console.log('test click');
                dataFactory.ServiceAreaChanged(selectedItem);
                //factory class data changed
                if (selectedItem.Id == "OS") {
                    prepareServiceAreaScoreDataCollection(dataFactory.ServiceAreaScoreDataCollection());
                } else {
                    prepareServiceAreaScoreDataCollectionOnClick(dataFactory.ServiceAreaScoreDataCollection(), selectedItem);
                }

                /* First item selection */
                onSelectFirstServiceAreaQuestion();
            };
            /**
             * Service area preparation
             * @param data
             */
            function prepareServiceAreaCollection(data) {
                var serviceAreaCollection = data;
                var generalSurveyCollection = _.filter(serviceAreaCollection, function (n) {
                    return n.SurveyType == "NOG" || n.SurveyType == "GEN";
                });

                var triggerSurveyCollection = _.filter(serviceAreaCollection, function (n) {
                    return n.SurveyType == "TCK";
                });

                $scope.generalSurveyCollection = _.sortByOrder(generalSurveyCollection, 'SortOrder', true);
                $scope.triggerSurveyCollection = _.sortByOrder(triggerSurveyCollection, 'SortOrder', true);
                serviceAreaScoreData.SetGeneralSurveyCollection($scope.generalSurveyCollection);
                serviceAreaScoreData.SetTriggerSurveyCollection($scope.triggerSurveyCollection);
            }

            /**
             * Custom attributes preparation
             * @param data
             */
            function prepareDataFilterAttributeCollection(data) {

                var customAttributeCollection = data;

                /* Grouping filter collection */
                var categoryType = [];
                var preparedCategorizedAttributeColl = _.groupBy(customAttributeCollection, function (item) {
                    //categoryType.push({name: item.Type});
                    var key = {};
                    if (item.Type === 0) {
                        key = 'GEOGRAPHY';
                        if (!_.findKey(categoryType, {name: key})) {
                            categoryType.push({name: key, type: item.Type});
                        }
                        return key;
                    }
                    else if (item.Type === 1) {
                        key = 'ORGANIZATION';
                        if (!_.findKey(categoryType, {name: key})) {
                            categoryType.push({name: key, type: item.Type});
                        }
                        return key;
                    }
                    else if (item.Type === 2) {
                        key = 'TICKETS';
                        if (!_.findKey(categoryType, {name: key})) {
                            categoryType.push({name: key, type: item.Type});
                        }
                        return key;
                    }
                    else if (item.Type === 3) {
                        key = 'OTHER';
                        if (!_.findKey(categoryType, {name: key})) {
                            categoryType.push({name: key, type: item.Type});
                        }
                        return key;
                    }

                    //if (item.Type === 0) return 'GEOGRAPHY';
                    //else if (item.Type === 1) return 'ORGANIZATION';
                    //else if (item.Type === 2) return 'TICKETS';
                    //else if (item.Type === 3) return "OTHER";
                });

                /* Sorting grouped filter collection */
                _.forEach(preparedCategorizedAttributeColl, function (n, key) {
                    //groupedFilterColl[key] = _.sortByOrder(n, 'DisplayOrder', true);

                    //Top level attribute finding [Oct 13-2015]
                    var isFoundTopLevelAttr = false;
                    var topLevelAttr = _.find(n, {IsTopLevel: true});
                    if (topLevelAttr) {
                        isFoundTopLevelAttr = true;
                    }

                    var sortedColl = _.sortByOrder(n, 'DisplayOrder', true);
                    var catType = _.findKey(categoryType, {name: key});
                    preparedCategorizedAttributeColl[key] = _.assign({}, {
                        type: catType,
                        name: key,
                        items: sortedColl,
                        isExpand: false,
                        isTCKDisabled: false,
                        hasTopLevelAttribute: isFoundTopLevelAttr
                    });
                });

                $scope.categorizedAttributeColl = _.sortByOrder(preparedCategorizedAttributeColl, 'type', true);
            }

            function prepareServiceAreaScoreDataCollection(data) {
                var serviceAreaScoreDataCollection = data;
                var combinedQuestionList = [];
                var ticketQuestionList = [];
                var generalScoreDataCollection = _.filter(serviceAreaScoreDataCollection, function (n) {
                    return n.SurveyType == "NOG" || n.SurveyType == "GEN";
                });
                var ticketScoreDataCollection = _.filter(serviceAreaScoreDataCollection, function (n) {
                    return n.Id == "TCK" || n.Id == "SES";
                });
                var indexCount = 0;
                if (generalScoreDataCollection.length > 0) {
                    combinedQuestionList[indexCount++] = _.assign({}, {
                        QuestionId: generalScoreDataCollection[0].Id,
                        QuestionText: generalScoreDataCollection[0].Name,
                        Score: generalScoreDataCollection[0].Score,
                        TotalResponse: generalScoreDataCollection[0].TotalResponse,
                        PositiveResponse: generalScoreDataCollection[0].PositiveResponse,
                        NegativeResponse: generalScoreDataCollection[0].NegativeResponse,
                        Comparator: generalScoreDataCollection[0].Comparator,
                        DoubleTargetComparator: generalScoreDataCollection[0].DoubleTargetComparator,
                        IncludeInGroupScore: false,
                        QuestionType: appSettings.QUESTION_TYPE_GROUP
                    });

                    //$scope.generalScoreDataCollection = _.sortByOrder(generalScoreDataCollection, 'SortOrder', true);
                    //$scope.ticketScoreDataCollection = _.sortByOrder(ticketScoreDataCollection, 'SortOrder', true);

                    _.forEach(generalScoreDataCollection[0].QuestionScores, function (n, key) {
                        var temp = _.assign({}, {QuestionType: appSettings.QUESTION_TYPE_REGULAR}, n);
                        combinedQuestionList.push(temp);
                        indexCount++;
                    });
                }
                if (ticketScoreDataCollection.length > 0) {
                    combinedQuestionList[indexCount++] = _.assign({}, {
                        QuestionId: ticketScoreDataCollection[0].Id,
                        QuestionText: ticketScoreDataCollection[0].Name,
                        Score: ticketScoreDataCollection[0].Score,
                        TotalResponse: ticketScoreDataCollection[0].TotalResponse,
                        PositiveResponse: ticketScoreDataCollection[0].PositiveResponse,
                        NegativeResponse: ticketScoreDataCollection[0].NegativeResponse,
                        Comparator: ticketScoreDataCollection[0].Comparator,
                        DoubleTargetComparator: ticketScoreDataCollection[0].DoubleTargetComparator,
                        IncludeInGroupScore: false,
                        QuestionType: appSettings.QUESTION_TYPE_GROUP
                    });
                    _.forEach(ticketScoreDataCollection[0].QuestionScores, function (n, key) {
                        var temp = _.assign({}, {QuestionType: appSettings.QUESTION_TYPE_REGULAR}, n);
                        combinedQuestionList.push(temp);
                        indexCount++;
                    });
                }
                //$scope.ticketScoreDataCollection = ticketQuestionList;
                $scope.combinedScoreDataCollection = combinedQuestionList;
            }

            function prepareServiceAreaScoreDataCollectionOnClick(data, item) {
                var serviceAreaScoreDataCollection = data;
                var combinedQuestionList = [];

                var scoreDataCollection = _.filter(serviceAreaScoreDataCollection, function (n) {
                    return n.Id == item.Id;
                });

                _.forEach(scoreDataCollection[0].QuestionScores, function (n, key) {
                    var temp = _.assign({}, {QuestionType: appSettings.QUESTION_TYPE_REGULAR}, n);
                    combinedQuestionList.push(temp);
                });

                $scope.combinedScoreDataCollection = combinedQuestionList;
                //$timeout(function () {
                //    onSelectFirstServiceAreaQuestion();
                //}, 0);
            }

            /* Datafilter expand/collapse functionality */
            $scope.isdatafilterCollapsed = true;

            $scope.expandCollapsedDataFilterPanel = function () {
                $scope.isdatafilterCollapsed = !$scope.isdatafilterCollapsed;
                _.forEach($scope.categorizedAttributeColl, function (item, key) {
                    item.isExpand = false;
                });
            };
            /* dataset selection section
             ======================================================*/
            $scope.datasetIsCollapsed = true;
            $scope.datasetSelected = false;

            $scope.datasetSelectionExapansion = function () {
                $scope.datasetIsCollapsed = !$scope.datasetIsCollapsed;
                if ($scope.datasetSelected) {
                    $('#dataset-selection').addClass('dataset-selection').removeClass('dataset-selection-selected');
                    //$scope.datasetSelected = false;
                }
            };

            var datasetPanelWidth;
            $scope.datasetSelected_Handler = function () {
                //Closing Other Opened Window
                onCloseSlideInWindows(WindowOpened.DataSetSelection = false);

                $scope.datasetSelected = !$scope.datasetSelected;
                var topPadding = 45;
                datasetPanelWidth = $('#datsetContainer').width();

                $('#datsetContainer.slide-out').css('top', topPadding + 'px');

                if ($scope.datasetSelected) {
                    datasetSelectionFactory.setResetCheckbox(false);
                    $('#dataset-selection').addClass('dataset-selection-selected').removeClass('dataset-selection');
                    $('#datsetContainer.slide-out').animate({left: 253}, 500, "linear");
                    InitializeDataSet();
                } else {
                    $('#dataset-selection').addClass('dataset-selection').removeClass('dataset-selection-selected');
                    $('#datsetContainer.slide-out').animate({left: -datasetPanelWidth - 253}, 500, "linear");

                }

                var dataInfo = dataFactory.DataInfo();
                var customer = _.find(datasetSelectionFactory.customers, function (n) {
                    return n.CustomerId === dataInfo.customerID;
                });
                datasetSelectionFactory.selectedCustomer = customer;
            };
            $("#datsetContainer .close-slide-in").click(function () {
                onCloseDatasetSelectionWindow();
            });

            function onCloseDatasetSelectionWindow() {
                $scope.datasetSelected = false;
                $('#dataset-selection').addClass('dataset-selection').removeClass('dataset-selection-selected');
                $('#datsetContainer.slide-out').animate({left: -datasetPanelWidth - 253}, 500, "linear");
            }

            function InitializeDataSet(){
                var dataInfo = dataFactory.DataSetInfo();
                datasetSelectionFactory.selectedValue = dataInfo.datasetName;
                datasetSelectionFactory.selectedCustomer = dataInfo.selectedCustomer;
                datasetSelectionFactory.selectedMonth = dataInfo.selectedMonth;
                datasetSelectionFactory.selectedQuarter = dataInfo.selectedQuarter;
                datasetSelectionFactory.FromDate = dataInfo.fromDate;
                datasetSelectionFactory.ToDate = dataInfo.toDate;
                if(datasetSelectionFactory.selectedValue.toLowerCase() == "daterange") {
                    datasetSelectionFactory.dtpValueFromDate = dataInfo.fromDate;
                    datasetSelectionFactory.dtpValueToDate = dataInfo.toDate;
                }
                else{
                    datasetSelectionFactory.dtpValueFromDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
                    datasetSelectionFactory.dtpValueToDate = new Date(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1) - 1);
                }
                datasetSelectionFactory.LastSixMonth =  dataInfo.LastSixMonth;
                datasetSelectionFactory.QuarterColl =  dataInfo.QuarterColl;
            }
            /* Full scorecard button selection handler
             ======================================================*/
            $scope.isFullScorecardWindowSlideIn = false;
            var containerWidth;
            $(".ac-btn-full-scorecard").click(function (e) {
                //Closing Other Opened Window
                onCloseSlideInWindows(WindowOpened.FullScorecard = false);
                $scope.isFullScorecardWindowSlideIn = !$scope.isFullScorecardWindowSlideIn;

                $('.full-scorecard-content-container').scrollTop(0);
                $('.full-scorecard-content-container').scrollLeft(0);

                var topPadding = 50;
                containerWidth = $('#fullScorecardWindowContainer').width();
                //console.log(containerWidth);

                $('#fullScorecardWindowContainer.slide-out').css('top', topPadding + 'px');

                if ($scope.isFullScorecardWindowSlideIn) {
                    $('#fullScorecardWindowContainer.slide-out').animate({left: 253}, 500, "linear", function () {
                        $('.full-scorecard-body-wrapper').removeClass('ease-out-effect').addClass('ease-in-effect');
                    });
                    //$('.full-scorecard-content-container').animate({opacity:1},1500,"linear");

                }
                else {
                    $('#fullScorecardWindowContainer.slide-out').animate({left: -containerWidth - 253}, 500, "linear");
                    //$('.full-scorecard-content-container').animate({opacity:0},1500,"linear");
                    $('.full-scorecard-body-wrapper').removeClass('ease-in-effect').addClass('ease-out-effect');
                }
            });

            $("#fullScorecardWindowContainer .close-slide-in").click(function () {
                onCloseFullScorecardWindow();
            });


            /* Close full scorecard window */
            function onCloseFullScorecardWindow() {
                $scope.isFullScorecardWindowSlideIn = false;
                $('.full-scorecard-btn-container .ac-btn-full-scorecard').removeClass('active');
                $('#fullScorecardWindowContainer.slide-out').animate({left: -containerWidth - 253}, 500, "linear");
                //$('.full-scorecard-content-container').animate({opacity:0},1500,"linear");
                $('.full-scorecard-body-wrapper').removeClass('ease-in-effect').addClass('ease-out-effect');
            }


            /* Evaluation button selection handler
             ======================================================*/
            $scope.evaluationIsCollapsed = true;
            $scope.evaluationBtnSelected = false;
            $scope.evaluationSectionExapansion = function () {
                $scope.evaluationIsCollapsed = !$scope.evaluationIsCollapsed;
                if ($scope.evaluationBtnSelected) {
                    $('#btn-evaluation').addClass('btn-arrow-left-menu').removeClass('btn-arrow-left-menu-selected');
                    //$scope.evaluationBtnSelected = false;
                }
            };

            var evaluationBtnEvent;
            var evaluationContainerWidth;
            $scope.evaluationBtn_Handler = function (e) {
                if ($scope.IsEvaluationBtnDisabled) return;
                //Closing Other Opened Window
                onCloseSlideInWindows(WindowOpened.Evaluation = false);
                $scope.evaluationBtnSelected = !$scope.evaluationBtnSelected;
                evaluationBtnEvent = e;
                //var topPadding = e.pageY - 215 - 160;
                var topPadding = (e.pageY - 215 - 160) < 53 ? (e.pageY - 215 - 160) : 53;
                evaluationContainerWidth = $('#leftMenuEvaluationContainer').width();
                $('#leftMenuEvaluationContainer.slide-out').css('top', topPadding + 'px');
                if ($scope.evaluationBtnSelected) {
                    $('#leftMenuEvaluationContainer.slide-out').animate({left: 253}, 500, 'linear');
                    $('#btn-evaluation').addClass('btn-arrow-left-menu-selected').removeClass('btn-arrow-left-menu');
                    $rootScope.$broadcast('showEvaluation');
//                    var htmlContent=$('#leftMenuEvaluationContainer');
//                    htmlContent.load('Views/LeftMenu.Evaluations/EvaluationTemplate.html');
//                    $compile(htmlContent.contents())($scope);

                } else {
                    $rootScope.$broadcast('closeEvaluation');
                    $('#btn-evaluation').addClass('btn-arrow-left-menu').removeClass('btn-arrow-left-menu-selected');
                    $('#leftMenuEvaluationContainer.slide-out').animate({left: -evaluationContainerWidth - 253}, 500, 'linear');
                }
            };
            function onCloseEvaluationWindow() {
                $scope.evaluationBtnSelected = false;
                $rootScope.$broadcast('closeEvaluation');
                $('#btn-evaluation').addClass('btn-arrow-left-menu').removeClass('btn-arrow-left-menu-selected');
                $('#leftMenuEvaluationContainer.slide-out').animate({left: -evaluationContainerWidth - 253}, 500, "linear");
            }

            /* Setting button selection section
             ======================================================*/
            $scope.settingsIsCollapsed = true;
            $scope.compareWithBtnSelected = false;

            $scope.settingsSectionExapansion = function () {
                $scope.settingsIsCollapsed = !$scope.settingsIsCollapsed;
                if ($scope.compareWithBtnSelected) {
                    $('#btn-compare-with').addClass('btn-arrow-left-menu').removeClass('btn-arrow-left-menu-selected');
                    //$scope.compareWithBtnSelected = false;
                }
            };

            var compareBtnEvent;
            var compareContainerWidth;
            $scope.compareWithBtn_Handler = function (e) {
                //Closing Other Opened Window
                onCloseSlideInWindows(WindowOpened.CompareWith = false);

                $scope.compareWithBtnSelected = !$scope.compareWithBtnSelected;
                compareBtnEvent = e;
                var topPadding = e.pageY - 215 - 160;
                /* position - component height - offset */
                compareContainerWidth = $('#compareWithSettingsContainer').width();
                $('#compareWithSettingsContainer.slide-out').css('top', topPadding + 'px');

                if ($scope.compareWithBtnSelected) {
                    $('#btn-compare-with').addClass('btn-arrow-left-menu-selected').removeClass('btn-arrow-left-menu');
//                $('#compareWithSettingsContainer').addClass('settings-float-right').removeClass('settings-float-left');
                    $('#compareWithSettingsContainer.slide-out').animate({left: 253}, 500, "linear");

                } else {
                    $('#btn-compare-with').addClass('btn-arrow-left-menu').removeClass('btn-arrow-left-menu-selected');
//                $('#compareWithSettingsContainer').addClass('settings-float-left').removeClass('settings-float-right');
                    $('#compareWithSettingsContainer.slide-out').animate({left: -compareContainerWidth - 253}, 500, "linear");

                }
            };

            $("#compareWithSettingsContainer .close-slide-in").click(function () {
                onCloseCompareWithWindow();
            });

            function onCloseCompareWithWindow() {
                $scope.compareWithBtnSelected = false;
                $('#btn-compare-with').addClass('btn-arrow-left-menu').removeClass('btn-arrow-left-menu-selected');
                $('#compareWithSettingsContainer.slide-out').animate({left: -compareContainerWidth - 253}, 500, "linear");
            }

            /* Evaluation button selection handler
             ======================================================*/
            $scope.logsPanelIsCollapsed = true;
            $scope.activityLogBtnSelected = false;

            $scope.activityLogSectionExapansion = function () {
                $scope.logsPanelIsCollapsed = !$scope.logsPanelIsCollapsed;
                if ($scope.activityLogBtnSelected) {
                    $('#btn-activity-log').addClass('btn-arrow-left-menu').removeClass('btn-arrow-left-menu-selected');
                    //$scope.activityLogBtnSelected = false;
                }
            };

            $scope.activityLogBtn_Handler = function () {
                //Closing Other Opened Window
                onCloseSlideInWindows(WindowOpened.ActivityLog = false);

                $scope.activityLogBtnSelected = !$scope.activityLogBtnSelected;
                if ($scope.activityLogBtnSelected) {
                    $('#btn-activity-log').addClass('btn-arrow-left-menu-selected').removeClass('btn-arrow-left-menu');
                } else {
                    $('#btn-activity-log').addClass('btn-arrow-left-menu').removeClass('btn-arrow-left-menu-selected');
                }
            };

            /*More Setting button selection section
             ======================================================*/
            $scope.moreSettingsIsCollapsed = true;
            $scope.moreSettingsBtnSelected = false;

            $scope.moreSettingsSectionExapansion = function () {
                $scope.moreSettingsIsCollapsed = !$scope.moreSettingsIsCollapsed;
                if ($scope.moreSettingsBtnSelected) {
                    $scope.moreSettingsBtnSelected = false;
                }
            };

            var moreSettingsBtnEvent;
            var moreSettingsWidth;
            $scope.moreSettingsBtn_Handler = function (e) {
                //Closing Other Opened Window
                onCloseSlideInWindows(WindowOpened.MoreSettings = false);

                $scope.moreSettingsBtnSelected = !$scope.moreSettingsBtnSelected;
                moreSettingsBtnEvent = e;
                var topPadding = e.pageY - 215 - 185;
                /* position - component height - offset */
                moreSettingsWidth = $('#compareWithSettingsContainer').width();
                $('#moreSettingsContainer.slide-out').css('top', topPadding + 'px');

                if ($scope.moreSettingsBtnSelected) {
                    $('#moreSettingsContainer.slide-out').animate({left: 253}, 500, "linear");

                } else {
                    $('#moreSettingsContainer.slide-out').animate({left: -moreSettingsWidth - 253}, 500, "linear");

                }
            };

            $("#moreSettingsContainer .close-slide-in").click(function () {
                onCloseMoreSettingsWindow();
            });

            function onCloseMoreSettingsWindow() {
                $scope.moreSettingsBtnSelected = false;
                $('.more-settings-btn-container .btn-more-settings').removeClass('active');
                $('#moreSettingsContainer.slide-out').animate({left: -moreSettingsWidth - 253}, 500, "linear");
            }

            /* Close the sliding window section
             ======================================================*/
            function closeDatasetWindow() {
                $scope.datasetSelected_Handler();
            }

            function closeCompareSettingsWindow(evt) {
                $scope.compareWithBtn_Handler(evt);
            }

            function closeMoreSettingsWindow(evt) {
                $scope.moreSettingsBtn_Handler(evt);
                $scope.moreSettingsBtnSelected = false;
                $('.more-settings-btn-container .btn-more-settings').removeClass('active');
            }

            $scope.$watch(function () {
                return $scope.leftMenuSlidingWindowEventNotify.getDatasetLoadEvent() || $scope.leftMenuSlidingWindowEventNotify.getCompareSettingsOkBtnEvent() || $scope.leftMenuSlidingWindowEventNotify.getMoreSettingsOkBtnEvent();
            }, function (val) {
                if ($scope.leftMenuSlidingWindowEventNotify.getDatasetLoadEvent()) {
                    closeDatasetWindow();
                    $scope.leftMenuSlidingWindowEventNotify.setDatasetLoadEvent(false);
                } else if ($scope.leftMenuSlidingWindowEventNotify.getCompareSettingsOkBtnEvent()) {
                    closeCompareSettingsWindow(compareBtnEvent);
                    $scope.leftMenuSlidingWindowEventNotify.setCompareSettingsOkBtnEvent(false);
                }
                else if ($scope.leftMenuSlidingWindowEventNotify.getMoreSettingsOkBtnEvent()) {
                    closeMoreSettingsWindow(moreSettingsBtnEvent);
                    $scope.leftMenuSlidingWindowEventNotify.setMoreSettingsOkBtnEvent(false);
                }
            });

            /* Service area score item click Handler
             ======================================================*/
            $scope.serviceAreaScoreItemClick = function (evt) {
                var curItem = '#' + evt.currentTarget.id;
                $(curItem).addClass('selectedQuestionItem').siblings().removeClass('selectedQuestionItem');
                var innerDiv = "#" + evt.currentTarget.firstElementChild.id;
                $(innerDiv).addClass('selectedQuestionListItemDiv');
                var prevSlected_li = $("#selectabl > li > div[id^='div-'].selectedQuestionListItemDiv").not(innerDiv);
                prevSlected_li.removeClass('selectedQuestionListItemDiv').addClass('questionListItemDiv');
            };

            /* By default first question selection
             ======================================================*/
            function onSelectFirstServiceAreaQuestion() {
                var allQuestions = $("#selectabl > li");
                allQuestions.removeClass('selectedQuestionItem');

                var allQuestionInnerDiv = allQuestions.children();
                allQuestionInnerDiv.removeClass('selectedQuestionListItemDiv').addClass('questionListItemDiv');
                //console.log('onSelectFirstServiceAreaQuestion...');

                var firstQuestion = $("#selectabl > li").first();
                firstQuestion.addClass('selectedQuestionItem');
                var firstQuestionInnerDiv = firstQuestion.children();
                firstQuestionInnerDiv.addClass('selectedQuestionListItemDiv');
            }

            /* Data Filter window event handling section
             ======================================================*/
            $scope.onAttibuteClicked = function (event) {
                //Closing Other Opened Window
                onCloseSlideInWindows(WindowOpened.DataFilter = false);
                if (event.data.isDataFilterWindowOpen === true) {
                    dataFilterFactory.SetLeftMenuAttributeClickedEvent(true);
                    dataFilterFactory.SetSelectedAttributeIndex(event.data.Index);
                }
            };

            /* Datafilter window close event */
            $scope.DataFilterControl = {};
            $scope.DataFilterControl.isResetFilterBtnDisabled = true;
            $scope.DataFilterControl.AppliedDataFilterCollection = dataFilterFactory.GetAppliedDataFilterCollection();

            function onCloseDataFilterWindow() {
                $scope.DataFilterControl.closeDataFilterWindowHandler();
            }

            //Top level Data Filter Oct 14-2015
            function onCloseTopLevelDataFilterWindow() {
                $scope.DataFilterControl.closeTopLevelDataFilterWindowHandler();
            }

            /* Opened Window Closing Handler   [24th July -2015]
             ======================================================*/
            angular.element(document).on('click', function (evt) {
                if ((evt.target.parentElement && evt.target.parentElement.className === 'left-menu-scroll-container') ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'menu-component-container') ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'accordion-panel-container') ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'left-menu-main-container') ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'dataset-container') ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'logo-container') ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'threshold-container') ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'service-area-container') ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'accordion-panel-container') ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'questionContainerDiv') ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'service-area-questions-container') ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'btn-group') ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'accordion-toggle') ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'scorebar-mainDiv' && evt.target.offsetParent && (evt.target.offsetParent.className !== 'ac-list-group-item-scorebar' || evt.target.offsetParent.className !== 'left-menu-evaluation-header')) ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'questionContainerDiv') ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'logout-right-arrow-container') ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'app-settings') ||
                    (evt.target.parentElement && evt.target.parentElement.className === 'help-circle') ||
                    (evt.target.parentElement && evt.target.parentElement.className.length && !evt.target.parentElement.className.match(/\bng-\b/) && $("."+evt.target.parentElement.className).parents(".summary-container").length > 0)  ||
                    //(evt.target.parentElement && evt.target.parentElement.className.length && !evt.target.parentElement.className.match(/\bng-isolate-scope\b/) && $("." + evt.target.parentElement.className).parent(".summary-container").length > 0) ||
                    (evt.target.parentElement && evt.target.parentElement.className.length && evt.target.parentElement.className.match(/\bexpand-collapse-label\b/)) ||
                    (evt.target.parentElement && evt.target.parentElement.parentElement && evt.target.parentElement.parentElement.className === 'scorebar-mainDiv' && evt.target.offsetParent && evt.target.offsetParent.className !== 'ac-list-group-item-scorebar') ||
                    //(evt.target.parentElement && evt.target.parentElement.parentElement && evt.target.parentElement.parentElement.className === 'scorebar-mainDiv' && evt.target.offsetParent && evt.target.offsetParent.className !== 'ac-list-group-item-scorebar' && evt.target.offsetParent.className !== 'left-menu-evaluation-header') ||
                    (evt.target.parentElement && evt.target.parentElement.parentElement && evt.target.parentElement.parentElement.className === 'questionListItemDiv') ||
                    (evt.target.parentElement && evt.target.parentElement.parentElement && evt.target.parentElement.parentElement.className === 'accordion-panel-container') ||
                    (evt.target.parentElement && evt.target.parentElement.parentElement && evt.target.parentElement.parentElement.className === 'threshold-container') ||
                    (evt.target.parentElement && evt.target.parentElement.parentElement && evt.target.parentElement.parentElement.className === 'map-container') ||
                    (evt.target.parentElement && evt.target.parentElement.offsetParent && evt.target.parentElement.offsetParent.className === 'col-md-9 right-content') ||
                    (evt.target && evt.target.parentElement && evt.target.parentElement.parentElement &&  evt.target.parentElement.parentElement.offsetParent && evt.target.parentElement.parentElement.offsetParent.id === 'grid1')||
                    ($(evt.target).offsetParent() && $(evt.target).offsetParent().parent() && $(evt.target).offsetParent().parent().parent() && $(evt.target).offsetParent().parent().parent().parent().parent() && $(evt.target).offsetParent().parent().parent().parent().parent().length > 0 && $(evt.target).offsetParent().parent().parent().parent().parent()[0].id === 'grid1')||
                    evt.target.className === 'menu-component-container' ||
                    evt.target.className === 'col-md-3.left-menu' ||
                    evt.target.className === 'service-area-container' ||
                    (evt.target && evt.target.className.length && evt.target.className.match(/\bexpand-collapse-label\b/)) ||
                    evt.target.className === 'logo' ||
                    evt.target.className === 'more-settings-btn-container' ||
                    evt.target.className === 'compare-with-container' ||
                    evt.target.className === 'accordion-panel-container' ||
                    evt.target.className === 'question' ||
                    evt.target.className === 'btn-group' ||
                    evt.target.className === 'col-md-3 left-menu' ||
                    evt.target.className === 'threshold-container' ||
                    evt.target.className === 'scorebar-mainDiv' ||
                    //(evt.target.className === 'scorebar-mainDiv' && evt.target.offsetParent && evt.target.offsetParent.className !== 'ac-list-group-item-scorebar' && evt.target.offsetParent.className !== 'left-menu-evaluation-header') ||
                    evt.target.className === 'row content-page-header' ||
                    evt.target.className === 'view-by-attribute-container-div-parent' ||
                    evt.target.className === 'view-by-attribute-container-div' ||
                    evt.target.className === 'help-circle-container' ||
                    evt.target.className === 'logout-container' ||
                    (evt.target.className && evt.target.className.length && evt.target.className.match('/\bapp-settings-icon\b/')) ||
                    (evt.target.offsetParent && evt.target.offsetParent.className === 'row content-page-header') ||
                    (evt.target.offsetParent && evt.target.offsetParent.className === 'col-md-9 right-content') ||
                    (evt.target.offsetParent && evt.target.offsetParent.className.match(/\b.listview-container\b/)) ||
                    (evt.target.offsetParent === null && evt.target.id === 'list-view-wrapper') ||
                    evt.target.id === 'serviceArea-generalSurvey' ||
                    evt.target.id === 'serviceArea-triggerSurvey' ||
                    evt.target.id === 'attributeItemsMainDIv' ||
                    (evt.target.id === '' && evt.target.offsetParent && $("." + evt.target.offsetParent.className).parent(".listview-container").length > 0) ||
                    (evt.target.id !== '' && evt.target.offsetParent && $("." + evt.target.offsetParent.className).parent(".listview-container").length > 0) ||
                        //(evt.target.offsetParent && $("."+evt.target.offsetParent.className).parents(".summary-popup-body").length > 0) ||
                    (evt.target.offsetParent && $("." + evt.target.offsetParent.className).parents(".header-data-div").length > 0) ||
                    (evt.target.parentElement && evt.target.parentElement.id === 'headerTab') ||
                    (evt.target.parentElement && evt.target.parentElement.parentElement && evt.target.parentElement.parentElement.id === 'headerTab') ||
                    (evt.target.parentElement && evt.target.parentElement.parentElement && evt.target.parentElement.parentElement.id === 'mapContainer') ||
                    evt.target.className === 'left-menu-evaluation-arrow-closer close-slide-in' ||
                    evt.target.className === 'fa fa-caret-left' ||
                    evt.target.className === 'btn-fold' ||
                    (evt.target.className && evt.target.className.length && evt.target.className.match(/\bbtn-fold-icon\b/)) ||
                    (evt.target.className && evt.target.className.length && evt.target.className.match(/\bdiv-header-attribute-type\b/)) ||
                    (evt.target.className && evt.target.className.length && !evt.target.className.match(/\bSVGAnimatedString\b/) && $("." + evt.target.className).parent(".listview-container").length > 0) ||
                    //(evt.target.className && $("." + evt.target.className).parent(".listview-container").length > 0) ||
                    (evt.target && evt.target.className.length && evt.target.className.match(/\bui-grid-viewport\b/) && $(".ui-grid-viewport").parent(".listview-container").length > 0) ||
                    (evt.target.offsetParent && evt.target.offsetParent.className.length && evt.target.offsetParent.className.match(/\bshow-popup\b/) && $(".show-popup").parents(".map-view-container").length > 0)
                //(evt.target.classList && $("."+evt.target.classList[0]).parents(".listview-container").length > 0)
                ) {
                    //Oct 25-2015
                    if(evt.target && evt.target.offsetParent &&  evt.target.offsetParent.className.length && evt.target.offsetParent.className.match(/\bleft-menu-evaluation-header\b/)) {
                        return false;
                    }
                    //Closing full scorecard window
                    if ($scope.isFullScorecardWindowSlideIn) {
                        var parentDiv = [];
                        if (evt.target.offsetParent) {
                            parentDiv = $("." + evt.target.offsetParent.className).parents(".full-scorecard-container");
                        }
                        if (parentDiv && parentDiv.length == 0) {
                            onCloseFullScorecardWindow();
                        }
                    }

                    //Closing comparewith window
                    if ($scope.compareWithBtnSelected) {
                        onCloseCompareWithWindow();
                    }

                    //Closing moresettings window
                    if ($scope.moreSettingsBtnSelected) {
                        onCloseMoreSettingsWindow();
                    }

                    //Closing dataset selection window
                    if ($scope.datasetSelected) {
                        onCloseDatasetSelectionWindow();
                    }

                    //Closinge datafilter window
                    if ($scope.DataFilterControl.isDataFilterWindowOpen()) {
                        onCloseDataFilterWindow();
                    }

                    //For Top level
                    if ($scope.DataFilterControl.isTopLevelDataFilterWindowOpen()) {
                        onCloseTopLevelDataFilterWindow();
                    }

                    //Closing Evaluation window
                    if ($scope.evaluationBtnSelected) {
                        onCloseEvaluationWindow();
                    }
                }
            });

            //Constants For Window Closing
            var WindowOpened = {
                FullScorecard: true,
                CompareWith: true,
                MoreSettings: true,
                DataSetSelection: true,
                DataFilter: true,
                ActivityLog: true,
                Evaluation: true,
                ResetSettings: function () {
                    this.FullScorecard = true;
                    this.CompareWith = true;
                    this.MoreSettings = true;
                    this.DataSetSelection = true;
                    this.DataFilter = true;
                    this.ActivityLog = true;
                    this.Evaluation = true;
                }
            };

            function onCloseSlideInWindows(notClose) {
                //Closing full scorecard window
                if (WindowOpened.FullScorecard && $scope.isFullScorecardWindowSlideIn) {
                    onCloseFullScorecardWindow();
                }

                //Closing comparewith window
                if (WindowOpened.CompareWith && $scope.compareWithBtnSelected) {
                    onCloseCompareWithWindow();
                }

                //Closing moresettings window
                if (WindowOpened.MoreSettings && $scope.moreSettingsBtnSelected) {
                    onCloseMoreSettingsWindow();
                }

                //Closing dataset selection window
                if (WindowOpened.DataSetSelection && $scope.datasetSelected) {
                    onCloseDatasetSelectionWindow();
                }

                //Closinge datafilter window
                if (WindowOpened.DataFilter && $scope.DataFilterControl.isDataFilterWindowOpen()) {
                    onCloseDataFilterWindow();
                }

                //For Top level Data filter closing
                if (WindowOpened.DataFilter && $scope.DataFilterControl.isTopLevelDataFilterWindowOpen()) {
                    onCloseTopLevelDataFilterWindow();
                }

                //Closing Evaluation window
                if (WindowOpened.Evaluation && $scope.evaluationBtnSelected) {
                    onCloseEvaluationWindow();
                }

                WindowOpened.ResetSettings();
            }

            $scope.$on(Notify.SERVICE_AREA_CHANGED, function (event, response) {
                //$scope.selectedServiceArea = dataFactory.GetSelectedServiceArea();
                getEvaluationCount();
            });
            $scope.$on(Notify.DATA_FILTER_APPLIED, function () {
                getEvaluationCount();
            });
            function getEvaluationCount() {
                var oServiceAreaScoreDataCollection = dataFactory.ServiceAreaScoreDataCollection();
                var serviceAreaId = dataFactory.GetSelectedServiceArea().Id;
                var sa = _.find(oServiceAreaScoreDataCollection, function (item) {
                    return item.Id === serviceAreaId;
                });

                if (serviceAreaId === "SES") {
                    $scope.noOfRespondent = _.result(sa.Ses, 'TotalResponse');
                }
                else {
                    $scope.noOfRespondent = _.result(sa, 'Respondent');
                }
            }

            /* Up/Down Button Scrolling Section
             ======================================================*/
            //angular.element(document).ready(function () {
            //   var div = angular.element('div.left-menu-scroll-container');
            //
            //    var totalHeight =  parseInt(div.css("height"), 10);
            //    var y = 0;
            //
            //});
            $scope.isShowScrollBtn = false;
            function checkScrollbar() {
                if ($('.left-menu-scroll-container').hasScrollBar()) {
                    $scope.isShowScrollBtn = true;
                } else {
                    $scope.isShowScrollBtn = false;
                }
            }

            $(document).ready(function () {
                //$('#myElement').simplebar();

                var totalHeight = parseInt($(".left-menu-scroll-container").css("height"), 10);
                var y = 0;

                $(".btn-up-scroll").click(function () {
                    totalHeight = parseInt($(".left-menu-scroll-container").css("height"), 10);
                    var div = $(".left-menu-scroll-container");
                    //console.log(div[0].scrollHeight - div.scrollTop());
                    //console.log(totalHeight);

                    if (div.scrollTop() == 0) return;
                    y -= 20;
                    $(".left-menu-scroll-container").scrollTop(y);

                    //console.log('up y: ' + y);
                    //
                    //if (div[0].scrollHeight - div.scrollTop() == totalHeight) {
                    //    alert("Reached the bottom!");
                    //    alert(div.scrollTop());
                    //}
                    //else if (div.scrollTop() === 0) {
                    //    alert("Reached the top!");
                    //}

                });
                $(".btn-down-scroll").click(function () {
                    totalHeight = parseInt($(".left-menu-scroll-container").css("height"), 10);
                    //var div = $("div");
                    //console.log(div[0].scrollHeight - div.scrollTop());
                    //console.log(totalHeight);

                    //if(y === 100) return;

                    var div = $(".left-menu-scroll-container");
                    if (div[0].scrollHeight - div.scrollTop() == totalHeight) return;
                    y += 20;
                    $(".left-menu-scroll-container").scrollTop(y);
                    //console.log('down y: ' + y);
                    //if (div[0].scrollHeight - div.scrollTop() == totalHeight) {
                    //    alert("Reached the bottom!");
                    //}
                    //else if (div.scrollTop() === 0) {
                    //    alert("Reached the top!");
                    //}

                });


                $(".left-menu-scroll-container").scroll(function () {
                    //var div = $(".left-menu-scroll-container");
                    //console.log(div[0].scrollHeight - div.scrollTop());
                    //console.log(totalHeight);
                    //console.log('ScrollTop:' + div.scrollTop());
                    //
                    //if (div[0].scrollHeight - div.scrollTop() == totalHeight) {
                    //    alert("Reached the bottom!");
                    //}
                    //else if (div.scrollTop() === 0) {
                    //    alert("Reached the top!");
                    //
                    //}
                });

            });


            (function ($) {
                $.fn.hasScrollBar = function () {
                    return this.get(0).scrollHeight > this.height();
                }
            })(jQuery);

            $scope.$on('resize', function (event) {
                checkScrollbar();
            });

            $scope.DataFilterControl.onResetBtnClick = function () {
                dataFilterFactory.SetDataFilterResetClickedEvent(true);
            };

            //DataFilter apply button click event
            $scope.$watch(function () {
                return dataFilterFactory.GetDataFilterApplyBtnClickedEvent();
            }, function (newVal) {
                if (newVal) {
                    //Closinge datafilter window
                    if ($scope.DataFilterControl.isDataFilterWindowOpen()) {
                        onCloseDataFilterWindow();
                        dataFilterFactory.SetDataFilterApplyBtnClickedEvent(false);
                    }
                    //For Top Level Data filter Closing
                    if ($scope.DataFilterControl.isTopLevelDataFilterWindowOpen()) {
                        onCloseTopLevelDataFilterWindow();
                        dataFilterFactory.SetDataFilterApplyBtnClickedEvent(false);
                    }
                }
            });//End

            //Check applied filter collection for applied attribute count
            $scope.$watchCollection(function () {
                return dataFilterFactory.GetAppliedDataFilterCollection();
            }, function (newVal) {
                $scope.DataFilterControl.AppliedDataFilterCollection = newVal;
                if (newVal && newVal.length > 0) {
                    $scope.DataFilterControl.isResetFilterBtnDisabled = false;
                } else {
                    $scope.DataFilterControl.isResetFilterBtnDisabled = true;
                }
            });//End

            //Left Menu Tickets enable/disable based on selected service area selected
            $scope.$watch(function () {
                return dataFactory.GetSelectedServiceArea();
            }, function (newVal) {
                if (newVal) {
                    _.forEach($scope.categorizedAttributeColl, function (item, key) {
                        if (item.type === '2' && newVal.SurveyType !== 'TCK') {
                            item.isTCKDisabled = true;
                            item.isExpand = false;
                        } else {
                            item.isTCKDisabled = false;
                        }
                    });

                    $scope.IsEvaluationBtnDisabled = (newVal.Id === 'TCK');
                }
            });//End

            $scope.$on('listViewHeaderClick', function () {
                onCloseSlideInWindows();
            });
            $scope.dfCount = function () {
                var appliedFilterData = dataFilterFactory.GetAppliedDataFilterCollection();
                return appliedFilterData ? appliedFilterData.length : 0;
            };

            //Top Level filter [Oct15-2015]
            $scope.$on(Notify.TOP_LEVEL_FILTER_DATA_READY, function (event) {
                var appliedTopLevelFilteredCollection = dataFactory.GetTopLevelFilteredCollection();
                var categoryType = _.groupBy(_.pluck(appliedTopLevelFilteredCollection, 'Type'), function (n) {
                    return n;
                });

                var catKeys= _.keysIn(categoryType);

                console.log($scope.categorizedAttributeColl);

                if (catKeys && catKeys.length === 1) {
                    _.forEach($scope.categorizedAttributeColl, function (attribute) {
                        if (attribute.type === catKeys[0]) {
                            _.forEach(attribute.items, function (item) {
                                if(item.IsTopLevel === false){
                                    item.AttributeCount = getTopLevelAppliedAttributeCountByIndex(item.Index);
                                }
                            });
                            return false;
                        }
                    });
                }
                //dataFilterFactory.SetSelectedAttributeIndex(-1);
                console.log($scope.categorizedAttributeColl);

                //if(appliedTopLevelFilteredCollection && appliedTopLevelFilteredCollection.length > 0){
                //    if ($scope.SeletectedTopLevelAttribute && $scope.SeletectedTopLevelAttribute.IsTopLevel === true) {
                //
                //    }
                //}
            });
            function getTopLevelAppliedAttributeCountByIndex(index) {
                var appliedTopLevelFilteredCollection = dataFactory.GetTopLevelFilteredCollection();
                if (appliedTopLevelFilteredCollection && appliedTopLevelFilteredCollection.length > 0) {
                    var findItem = _.find(appliedTopLevelFilteredCollection, {Index: index});
                    return findItem ? findItem.AttributeCount : 0;
                }
                return 0;
            }

            //End of Top Level filter [Oct15-2015]


        }]);//
});
