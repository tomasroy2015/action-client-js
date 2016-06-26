"use strict";

define(['application-configuration','alertsService','dataFactory','accountFactory','lodash','ng-table',
    'comparatorFactory','moreSettingsFactory','serviceAreaScoreData','fullScorecardDataFactory','ui-grid-unstable','ViewByAttributeDataFactory'], function (app) {

    app.register.controller('listViewController', ['$scope', '$rootScope','$timeout', '$compile', 'alertsService', 'dataFactory', 'accountFactory',
        '$filter', 'ngTableParams', '$window', 'Notify', 'datasetSelectionFactory', 'comparatorFactory',
        'moreSettingsFactory', 'serviceAreaScoreData', 'fullScorecardDataFactory', 'attributeScoreSummaryData',
        'uiGridConstants','uiGridTreeViewConstants','ViewByAttributeDataFactory', function ($scope, $rootScope,$timeout, $compile, alertsService, dataFactory, accountFactory, $filter, ngTableParams, $window, Notify, datasetSelectionFactory, comparatorFactory, moreSettingsFactory, serviceAreaScoreData,
                                              fullScorecardDataFactory, attributeScoreSummaryData, uiGridConstants,uiGridTreeViewConstants,ViewByAttributeDataFactory) {
            var selectedServiceAreaId = "", selectedQuestionId ="", isInitializingData = false;
            $scope.attributeItemColl;
            $scope.dataSuccess = false;
            $scope.IsOSSelected = false;
            $scope.IsSESSelected = false;
            $scope.IsTCKSelected = false;
            $scope.selectedServiceAreaScoreDataColl;
            var mainSelectedServiceAreaScoreDataColl;
            $scope.defaultAttr = "";
            $scope.isNeedToShowListSummary = false;
            $scope.attributeData = {};
            $scope.attributeIndex = -1;
            $scope.attributeValue = [];
            $scope.evaluationDataCollection = [];
            $scope.fromView = "listview";
            var selectedAttribute;
            $scope.defaultImgSrc;
            $scope.hoverImgSrc;
            $scope.isExpandable = false;
            $scope.columnSortOrder = "";
            $scope.selectedColumnName;
            $scope.columnsGrd=[];
            $scope.minEvaluation = 0;
            $scope.listItemIconSrc="";
            $scope.listViewPopUp = {};
            $scope.allGrpExp=false;
            //
            $scope.ngClassVar = "default-collapsed-view";
            /*list Font-Awesome declaration*/
            var orgIcon="fa fa-users fa-2x";
            var geoIcon="fa fa-globe fa-2x";
            var tckIcon="fa fa-exclamation-triangle fa-2x";
            var otherIcon="fa fa-dot-circle-o fa-2x";
            $scope.noDataAvailable="";
            var isAllGrpExpandExplictily = false;
            var serviceAreaQuestionCount = 0;
           // var isAllGrpExpandForServiceAreaQuestionChange = false;
            var isListViewSummaryPopupExpanded = false;
            var isListViewLeftMenuExist = true;

            $scope.init = function(){
                isListViewLeftMenuExist = !$scope.$parent.isFoldOut;
                $scope.ngClassVar = isListViewLeftMenuExist ? "default-collapsed-view" : "full-screen-collapsed-view";
            }
            $scope.gridScope = {
                rowHover: function (row) {
                    //row.isSelected ? row.isSelected = false : row.isSelected = true;
                    //console.log("inside row hover...");
                    //$scope.listItemIconSrc = $scope.hoverImgSrc;
                },
                rowHoverOut: function (row) {
                   // $scope.listItemIconSrc = $scope.defaultImgSrc;
                   // console.log("inside row hoverOut...");
                },
                rowClick: function (row,rowRenderIndex) {
                    $scope.rowSelection_Handler(row.entity);
                    //console.log("grid click");
                },
                getIndex:function (name,entity){
                   var data = entity.ServiceAreaScoreDataCollection[0].QuestionScores;
                   for(var i=0;i<data.length;i++)
                   {
                       if(data[i].QuestionId==name)
                           return i;
                   }
                },

                isCollapseable:function(row){

                  var result= ( ( $scope.gridApi.grid.options.showTreeExpandNoChildren && row.treeLevel > -1 )
                      || ( row.treeNode.children && row.treeNode.children.length > 0 ) )
                      && row.treeNode.state === 'expanded';
                    return result;
                },
                isExpandable:function(row){

                    var result= ( ( $scope.gridApi.grid.options.showTreeExpandNoChildren && row.treeLevel > -1 )
                        || ( row.treeNode.children && row.treeNode.children.length > 0 ) )
                        && row.treeNode.state === 'collapsed';
                    //console.log("+"+result);
                    return result;
                },
                getGrpItemCountTxt:function(item){
                    if(item){
                        if(item.GrpItemsScoreDataColl)
                        {
                            return "("+item.GrpItemsScoreDataColl.length+")";
                        }
                        else
                        return "";
                    }
                    else{
                        return "";
                    }
                },
                listViewHeaderClick: function() {
                    $rootScope.$broadcast('listViewHeaderClick');
                }
            }
            $scope.uiGridConfig = {
                rowHeight: 40,
                enableSorting: true,
                rowSelectionHeader: false,
                enableFullRowSelection: true,
                enableRowSelection: false,
                multiSelect: false,
                showTreeExpandNoChildren: false,
                treeRowHeaderBaseWidth:40,
                showTreeRowHeader:false,
                enableGridMenu: false,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    $scope.gridApi.grid.options.enableHorizontalScrollbar=0;
                    $scope.gridApi.core.on.sortChanged($scope, function (grid, sort) {
                        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
                        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);

                    });
                    $scope.gridApi.grid.registerRowsProcessor( $scope.evaluationFilter, 200);
                },
                //columnDefs: $scope.columnsGrd,
                //data: gridData,
                rowTemplate: 'Views/ngUIGrid/GridRowTemplate.html'
            };
            $timeout(function(){
                initController();
            },100)
            /*sorting algoithm for grid*/
            function sortByNameAsc(item1, item2) {
               // console.log("inside sort name function : sort order :" + $scope.columnSortOrder);
                var name1 = item1.toLocaleLowerCase();
                var name2 = item2.toLocaleLowerCase();

                if (name1 < name2)
                    return -1;
                else if (name1 > name2)
                    return 1;
                else
                    return 0;

            }

            function sortByRespondentAsc(item1, item2) {
                var respondent1 = item1;
                var respondent2 = item2;

                if (respondent1 < respondent2)
                    return -1;
                else if (respondent1 > respondent2)
                    return 1;
                else
                    return 0;

            }

            function sortByScoreBarScore(scoreComparator1, scoreComparator2) {
                var score1 = scoreComparator1.Score;
                var score2 = scoreComparator2.Score;

                if ($scope.columnSortOrder == "asc") {
                    if (isNaN(score1))
                        score1 = 1000;
                    if (isNaN(score2))
                        score2 = 1000;
                }
                else {
                    if (isNaN(score1))
                        score1 = -1000;
                    if (isNaN(score2))
                        score2 = -1000;
                }
                if (score1 < score2)
                    return -1;
                else if (score1 > score2)
                    return 1;
                else
                    return 0;
            }
            function sortByIndividualServiceAreaScore(item1, item2) {
                var selectedQuestionIndex ;
                for(var i=0;i<item1.length;i++)
                {
                    if(item1[i].QuestionId==$scope.selectedColumnName)
                    {
                        selectedQuestionIndex = i;
                        break;
                    }
                }
                var questionScore1 = item1[selectedQuestionIndex].Score;
                var questionScore2 = item2[selectedQuestionIndex].Score;
                if ($scope.columnSortOrder == "asc") {
                    if (isNaN(questionScore1))
                        questionScore1 = 1000;
                    if (isNaN(questionScore2))
                        questionScore2 = 1000;
                }
                else {
                    if (isNaN(questionScore1))
                        questionScore1 = -1000;
                    if (isNaN(questionScore2))
                        questionScore2 = -1000;
                }

                if (questionScore1 < questionScore2)
                    return -1;
                else if (questionScore1 > questionScore2)
                    return 1;
                else
                    return 0;

            }

            function initController(){
                selectedAttribute = getDefaultSelectedAttribute();
                ViewByAttributeDataFactory.prepareViewByAttributeData();
                $scope.attributeItemColl = ViewByAttributeDataFactory.getPreparedViewByAttributeData();
                $scope.defaultAttr = selectedAttribute.Label;
                isInitializingData = true;
                setListViewMinEvaluations();
                //prepareSelectedAttributeServiceAreaData();
                getListViewData();
                //getViewByAttribute();
            }
            function getDefaultSelectedAttribute() {
                var customerGeneralSettings = dataFactory.CustomerGeneralSettings();
                var customAttributeCollection = dataFactory.CustomAttributeCollection();
                var listViewDefaultAttribute = dataFactory.GetListViewSelectedAttribute();
                //var defaultListViewAttributeIndex = customerGeneralSettings.DefaultListViewAttributeIndex;
                var defaultListViewAttributeLabel = _.result(_.findWhere(customAttributeCollection, {'Index': listViewDefaultAttribute.Index}), 'Label');

                return {
                    Label: defaultListViewAttributeLabel,
                    Index: listViewDefaultAttribute.Index,
                    Type: listViewDefaultAttribute.Type
                }
            }

            function setListItemIcon(type) {
                switch (type) {
                    case 0:
                        //grpGeo
                        $scope.defaultImgSrc = geoIcon;
                        //$scope.hoverImgSrc = "Content/images/listview/geo-attribute-hover-icon.png";
                        break;

                    case 1:
                        //grpOrganization
                        $scope.defaultImgSrc = orgIcon;
                       // $scope.hoverImgSrc = "Content/images/listview/organization-attribute-hover-icon.png";
                        break;
                    case 2:
                        //grpTicket
                        $scope.defaultImgSrc = tckIcon;
                       // $scope.hoverImgSrc = "Content/images/listview/triggered-attribute-hover-icon.png";
                        break;
                    case 3:
                        //grpOthers
                        $scope.defaultImgSrc = otherIcon;
                        //$scope.hoverImgSrc = "Content/images/listview/client-specific-attribute-hover-icon.png";
                        break;
                }
            }
            function setListViewMinEvaluations() {
                var customAttributeCollection = dataFactory.CustomerGeneralSettings();
                $scope.minEvaluation = customAttributeCollection.DefaultListViewMinEvaluations;
            }

//            $scope.groupItemClick = function (item, $index, $event) {
//                var tbodyId = "#tbody-" + $index;
//                $(tbodyId + ' tr.toggleRow').toggle();
//                $scope.isExpandable = !$scope.isExpandable;
//                $event.preventDefault();
//                $event.stopPropagation();
//
//            }
            $scope.onCheckBoxChange = function () {
                console.log("status : "+$scope.allGrpExp);
                //$scope.isExpandable = !$scope.isExpandable;
                isAllGrpExpandExplictily = $scope.allGrpExp;
                if($scope.allGrpExp)
                    $scope.gridApi.treeBase.expandAllRows();
                else
                    $scope.gridApi.treeBase.collapseAllRows();
            };
            $scope.toggleRow = function(row ){
                $scope.gridApi.treeBase.toggleRowTreeState(row);
                isAllGrpExpandExplictily = false;
            };

            $scope.applyFilterEnterKeyPressHandler = function (keyEvent) {
                var PRESS_ENTER_BUTTON = 13;
                explicitlyExpandAllGrp();

                if (keyEvent.which === PRESS_ENTER_BUTTON) {
                    $scope.gridApi.grid.refresh();
                }
            }

            $scope.resetFilterClickHandler = function () {
                $scope.minEvaluation = 0;
                $scope.gridApi.grid.refresh();
            }

            $scope.applyFilterClickHandler = function () {
                $scope.gridApi.grid.refresh();
            }
            $scope.evaluationFilter = function( renderableRows ){
                var minEvaluation = parseInt($scope.minEvaluation);
                if(isNaN(minEvaluation))
                    minEvaluation = 0;
                var grpCount=0;
                var expandedGrpCounter=0;
                _.forEach(renderableRows,function(row){
                    row.visible = row.entity.ServiceAreaScoreDataCollection[0].ItemRespondent >= minEvaluation || (row.entity.IsChildItem && row.entity.GroupRespondent >= minEvaluation)
                     if( row.visible && row.entity.IsGroup ){
                        grpCount++;
                        if(row.treeNode){
                          if(row.treeNode.state === 'expanded'){
                            expandedGrpCounter++;
                        }
                         else{
                              if(isAllGrpExpandExplictily)
                              {
                                  $scope.gridApi.treeBase.toggleRowTreeState(row);
                                  expandedGrpCounter++;
                              }
                          }
                        }
                    }
                })

                if(grpCount>0){
                    $scope.allGrpExpandDisable=false;
                    if(grpCount==expandedGrpCounter){
                        $scope.allGrpExp=true;
                    }
                    else{
                        $scope.allGrpExp=false;
                    }
                }
                else{
                    $scope.allGrpExpandDisable=true;
                    //$scope.allGrpExp=false;
                }
                if($scope.allGrpExp)
                isAllGrpExpandExplictily = true;
                //console.log("status :" +isAllGrpExpandExplictily);
                return renderableRows;
            };

            function applyFilterByMinEvaluation(minEvaluation) {
                var filterColl = mainSelectedServiceAreaScoreDataColl.filter(filterByMinEvaluation);

                function filterByMinEvaluation(value) {
                    return value.ServiceAreaScoreDataCollection[0].ItemRespondent >= minEvaluation;
                }

                $scope.selectedServiceAreaScoreDataColl = filterColl;
                //console.log("mail coll length: "+mainSelectedServiceAreaScoreDataColl.length+" filter coll:"+$scope.selectedServiceAreaScoreDataColl.length);
                setListView();
            }
            //$scope.$on(Notify.DATA_READY, function () {
            //    ViewByAttributeDataFactory.prepareViewByAttributeData();
            //    prepareSelectedAttributeServiceAreaData();
            //});
            //
            $scope.$on("listviewActiveDeactivate", function (event, data) {
                if(data.isActivate){
                    if (isListViewSummaryPopupExpanded) {
                        $scope.ngClassVar = isListViewLeftMenuExist ? "default-expanded-view" : "full-screen-expanded-view";
                    } else {
                        $scope.ngClassVar = isListViewLeftMenuExist ? "default-collapsed-view" : "full-screen-collapsed-view";
                    }
                }
            });
            $scope.$on(Notify.LEFT_MENU_FOLD_BUTTON_CLICK, function(event, args){
                isListViewLeftMenuExist = !isListViewLeftMenuExist;
                if(args.activeTab === 'listview') {
                    if (isListViewSummaryPopupExpanded) {
                        $scope.ngClassVar = isListViewLeftMenuExist ? "default-expanded-view" : "full-screen-expanded-view";
                    } else {
                        $scope.ngClassVar = isListViewLeftMenuExist ? "default-collapsed-view" : "full-screen-collapsed-view";
                    }
                }
            });
            $scope.$on(Notify.DATASET_CHANGED, function (event) {
                isInitializingData = true;
                ViewByAttributeDataFactory.prepareViewByAttributeData();
                prepareSelectedAttributeServiceAreaData();
                if(dataFactory.IsResetFilterOrView()){
                    setListViewMinEvaluations();
                }
            });

            $scope.$on(Notify.SERVICE_AREA_CHANGED, function (event, response) {
                explicitlyExpandAllGrp();

                $scope.selectedServiceArea = dataFactory.GetSelectedServiceArea();
                selectedServiceAreaId = $scope.selectedServiceArea.Id;
                selectedQuestionId = dataFactory.GetSelectedQuestion() ? dataFactory.GetSelectedQuestion().ID : "";
                handleListViewData();
                getViewByAttribute();
            });
            $scope.$on(Notify.DATA_FILTER_APPLIED, function () {
                explicitlyExpandAllGrp();
                handleListViewData();
                isInitializingData = true;
                //getViewByAttribute();

            });
            $scope.$on(Notify.DATAFILTER_GROUP_CREATED, function () {
                explicitlyExpandAllGrp();
                handleListViewData();
                //getViewByAttribute();
            });
            $scope.$on(Notify.SERVICE_AREA_QUESTION_CHANGED, function (event, response) {
                explicitlyExpandAllGrp();
                selectedQuestionId = dataFactory.GetSelectedQuestion() ? dataFactory.GetSelectedQuestion().ID : "";
                handleListViewData();
            });
            $scope.summaryPopupCloseHandler = function(events){
                var element = document.getElementById("list-view-summary");
                $scope.isNeedToShowMapSummary = false;
                if (element) {
                    angular.element(element).remove();
                    $scope.ngClassVar = isListViewLeftMenuExist ? "default-collapsed-view": "full-screen-collapsed-view";
                }
            };
            $scope.expandCollapseClickHandler = function(isExpanded){
                isListViewSummaryPopupExpanded = isExpanded;
                if(isListViewSummaryPopupExpanded) {
                    $scope.ngClassVar = isListViewLeftMenuExist ? "default-expanded-view expand-details" : "full-screen-expanded-view expand-details";
                }else{
                    $scope.ngClassVar = isListViewLeftMenuExist ? "default-collapsed-view collapse-details": "full-screen-collapsed-view collapse-details";
                }
            }
            function expandAllListRow(){
                $scope.gridApi.treeBase.expandAllRows();
            }
            function collapseAllListRow(){
                $scope.gridApi.treeBase.collapseAllRows();
            }

            function handleListViewData(){
                var attDataCollection = dataFactory.GetAtributeScoreDataCollectionWithFilter();
                var query = _.find(attDataCollection, function (n) {
                    return n.AttributeIndex == selectedAttribute.Index;
                })

                if (!query) {
                    prepareSelectedAttributeServiceAreaData();
                }
                else if(query.ScoreDataCollection) {
                    loadServiceAreaData(query.ScoreDataCollection);
                }
                else{
                    $scope.selectedServiceAreaScoreDataColl = [];
                    $scope.uiGridConfig.data =  $scope.selectedServiceAreaScoreDataColl;
                    $scope.gridApi.grid.refresh();
                    if($scope.uiGridConfig.data.length<1)
                    {
                        $scope.noDataAvailable="No data available";
                    }
                }

            };
            $scope.$on(Notify.COMPARATOR_TYPE_CHANGED, function (event) {
                updateListViewData();

            });
            $scope.$on(Notify.COMPARATOR_COLOR_CHANGED, function (event) {
                updateListViewData();
            });

            var updateListViewData = function(){
                var attDataCollection = dataFactory.GetAtributeScoreDataCollectionWithFilter();

                var query = _.find(attDataCollection, function (n) {
                    return n.AttributeIndex == selectedAttribute.Index;
                })
                if (!angular.isUndefined(query) && !angular.isUndefined(query.ScoreDataCollection)) {
                    loadServiceAreaData(query.ScoreDataCollection);
                }

            };

            $scope.$on(Notify.ATTRIBUTE_WITH_FILTER_DATA_READY, function (event) {
                explicitlyExpandAllGrp();
                $scope.selectedServiceArea = dataFactory.GetSelectedServiceArea();

                selectedServiceAreaId = $scope.selectedServiceArea.Id;
                selectedQuestionId = dataFactory.GetSelectedQuestion() ? dataFactory.GetSelectedQuestion().ID : "";

                var attDataCollection = dataFactory.GetAtributeScoreDataCollectionWithFilter();

                var query = _.filter(attDataCollection, function (n) {
                    return n.AttributeIndex == selectedAttribute.Index;
                })
                if (query && query.length > 0) {
                    loadServiceAreaData(query[0].ScoreDataCollection);
                }
                if(isInitializingData){
                    getViewByAttribute();
                    isInitializingData = false;
                }
            });

            function explicitlyExpandAllGrp(){
                if($scope.allGrpExp){
                    isAllGrpExpandExplictily = true;
                }
                else{
                    isAllGrpExpandExplictily = false;
                }
            }

            function loadServiceAreaData(serviceAreaScoreDataColl) {
                prepareServiceAreaData(serviceAreaScoreDataColl);
                //bind data in listview
                setListView();
            }
            function getListViewData(){
                $scope.selectedServiceArea = dataFactory.GetSelectedServiceArea();
                selectedServiceAreaId = $scope.selectedServiceArea.Id;
                selectedQuestionId = dataFactory.GetSelectedQuestion() ? dataFactory.GetSelectedQuestion().ID : "";
                var attDataCollection = dataFactory.GetAtributeScoreDataCollectionWithFilter();
                var query = _.filter(attDataCollection, function (n) {
                    return n.AttributeIndex ==  selectedAttribute.Index;
                })
                if (query && query.length > 0) {
                    var attScoreData = query[0];

                    if (attScoreData.IsAttributeScoreDataNull()) {
                        prepareSelectedAttributeServiceAreaData();
                    }
                    else {
                        loadServiceAreaData(attScoreData.ScoreDataCollection);
                    }

                }
                else {
                    prepareSelectedAttributeServiceAreaData();
                }
            }
            function prepareSelectedAttributeServiceAreaData() {
                var requestParam = attributeRequestParam(selectedAttribute);
                dataFactory.GetSelectedAttributeScoreDataWithFilter(requestParam);
            }

            /*attribute change event listener */
            $scope.serviceAreaAttributeItemChangeListener = function (attr) {
                explicitlyExpandAllGrp();
                selectedAttribute = {Label: attr.Label, Index: attr.Index, Type: attr.Type};
                dataFactory.SetListViewSelectedAttribute(selectedAttribute);

                var attDataCollection = dataFactory.GetAtributeScoreDataCollectionWithFilter();
                var query = _.filter(attDataCollection, function (n) {
                    return n.AttributeIndex == attr.Index;
                })
                if (query && query.length > 0) {
                    var attScoreData = query[0];

                    if (attScoreData.IsAttributeScoreDataNull()) {
                        prepareSelectedAttributeServiceAreaData();
                    }
                    else {
                        loadServiceAreaData(attScoreData.ScoreDataCollection);
                    }

                }
                else {
                    prepareSelectedAttributeServiceAreaData();
                }
            };
            function attributeRequestParam(attr) {
                var applicationDataInfo = dataFactory.DataInfo();
                var selectedSurveyType = dataFactory.GetSelectedServiceAreaSurveyType();

                return{
                    sessionID: applicationDataInfo.sessionID,
                    customerID: applicationDataInfo.customerID,
                    fromDate: applicationDataInfo.fromDate,
                    toDate: applicationDataInfo.toDate,
                    attributeIndex: attr.Index,
                    surveyType: selectedSurveyType
                }
            };
           function getSESScoreComparator(serviceAreaItem){
               if(serviceAreaItem.Ses){
                   var comparatorValue=comparatorFactory.GetScoreItemComparator(serviceAreaItem.Ses.QuestionId);
                   return{
                       Score:serviceAreaItem.Ses.Score,
                       ComparatorValue:comparatorValue,
                       DoubleTarget:comparatorFactory.GetDoubleTarget(serviceAreaItem.Ses.QuestionId),
                       ComparatorColorCode:dataFactory.GetScoreColor(serviceAreaItem.Ses.Score, comparatorValue)
                   }
               }
               else
               return null;
           }
           function prepareServiceAreaData(serviceAreaScoreDataColl) {

                $scope.selectedServiceAreaScoreDataColl = getSelectedServiceAreaData(serviceAreaScoreDataColl);
                $scope.IsOSSelected = (selectedServiceAreaId == "OS") ? true : false;
                $scope.IsSESSelected = (selectedServiceAreaId == "SES") ? true : false;
                $scope.IsTCKSelected = (selectedServiceAreaId == "TCK") ? true : false;

                //console.log("OS: " + $scope.IsOSSelected + " SES: " + $scope.IsSESSelected + " TCK: " + $scope.IsTCKSelected);
                function getSelectedServiceAreaData(attributeScoreDataColl) {

                    var listViewServiceAreaItemColl = [];
                    for (var i = 0; i < attributeScoreDataColl.length; i++) {
                        //here need to filter main collection by selected service area collection.
                        var serviceAreaColl = attributeScoreDataColl[i].ServiceAreaScoreDataCollection;
                        for (var j = 0; j < serviceAreaColl.length; j++) {
                            var serviceAreaItem = serviceAreaColl[j];
                            //console.log("selected service area id: "+selectedServiceAreaId+" service data id: "+serviceAreaItem.Id);
                            if (serviceAreaItem.Id == selectedServiceAreaId && serviceAreaItem.Respondent > 0) {
                                serviceAreaItem.ItemRespondent = serviceAreaItem.Respondent;
                                //console.log("selected service area id: "+selectedServiceAreaId);
                                var scoreComparatorValue = comparatorFactory.GetScoreItemComparator(serviceAreaItem.Id);
                                var doubleTarget = comparatorFactory.GetDoubleTarget(serviceAreaItem.Id);
                                var listViewServiceAreaItem = {
                                    Id: attributeScoreDataColl[i].Id,
                                    Name: attributeScoreDataColl[i].Name,
                                    AttributeData: attributeScoreDataColl[i],
                                    ScoreComparator: {
                                        Score: serviceAreaItem.Score,
                                        ComparatorValue: scoreComparatorValue,
                                        DoubleTarget:doubleTarget,
                                        ComparatorColorCode: dataFactory.GetScoreColor(serviceAreaItem.Score, scoreComparatorValue,serviceAreaItem.Id === "OS")
                                    },
                                    ColorSettings: moreSettingsFactory.GetSelectedColorSet(),
                                    ServiceAreaScoreDataCollection: [],
                                    IsOSSelected: false,
                                    IsChildItem:false,
                                    SESScoreComparator:getSESScoreComparator(serviceAreaItem)
                                };

                                for (var qIndex = 0; qIndex < serviceAreaItem.QuestionScores.length; qIndex++) {
                                    var item = serviceAreaItem.QuestionScores[qIndex];
                                    // var colorSettings = moreSettingsFactory.GetSelectedColorSet();
                                    var comparatorValue = comparatorFactory.GetScoreItemComparator(item.QuestionId);
                                    var comparatorColor = dataFactory.GetScoreColor(item.Score, comparatorValue);
                                    var scoreComparatorColor = {ScoreComparatorValue: comparatorValue, ColorCode: comparatorColor};
                                    //add new property ScoreSettings
                                    serviceAreaItem.QuestionScores[qIndex].ScoreComparatorColor = scoreComparatorColor;
                                    // var item2 = serviceAreaItem.QuestionScores[qIndex];
                                    if(selectedQuestionId == item.QuestionId){
                                        serviceAreaItem.ItemRespondent = item.TotalResponse;
                                        listViewServiceAreaItem.ScoreComparator = {
                                            Score: item.Score,
                                            ComparatorValue: comparatorValue,
                                            ComparatorColorCode: comparatorColor
                                        }
                                    }
                                }
                                listViewServiceAreaItem.IsOSSelected = (serviceAreaItem.Id == "OS") ? true : false;
                                listViewServiceAreaItem.ServiceAreaScoreDataCollection.push(serviceAreaItem);

                                //Defining the tree level
                                listViewServiceAreaItem.$$treeLevel = 0;
                                listViewServiceAreaItemColl.push(listViewServiceAreaItem);

                                /*list group data prepare*/
                                if (attributeScoreDataColl[i].hasOwnProperty("IsGroup")) {
                                    var childItemColl = [];
                                    var grpColl = attributeScoreDataColl[i].GroupItemsScoreDataCollection;
                                    for (var cIndex = 0; cIndex < grpColl.length; cIndex++) {
                                        var cServiceAreaColl = grpColl[cIndex].ServiceAreaScoreDataCollection;
                                        for (var cIndex2 = 0; cIndex2 < cServiceAreaColl.length; cIndex2++) {
                                            var cServiceAreaItem = cServiceAreaColl[cIndex2];
                                            if (cServiceAreaItem.Id == selectedServiceAreaId && cServiceAreaItem.Respondent > 0) {
                                                cServiceAreaItem.ItemRespondent = cServiceAreaItem.Respondent;
                                                var cScoreComparatorValue = comparatorFactory.GetScoreItemComparator(cServiceAreaItem.Id);
                                                var cDoubleTarget = comparatorFactory.GetDoubleTarget(serviceAreaItem.Id);
                                                var cListViewServiceAreaItem = {
                                                    Id: grpColl[cIndex].Id,
                                                    Name: grpColl[cIndex].Name,
                                                    AttributeData: grpColl[cIndex],
                                                    ScoreComparator: {
                                                        Score: cServiceAreaItem.Score,
                                                        ComparatorValue: cScoreComparatorValue,
                                                        DoubleTarget:cDoubleTarget,
                                                        ComparatorColorCode: dataFactory.GetScoreColor(cServiceAreaItem.Score, cScoreComparatorValue,cServiceAreaItem.Id === "OS")
                                                    },
                                                    ColorSettings: moreSettingsFactory.GetSelectedColorSet(),
                                                    ServiceAreaScoreDataCollection: [],
                                                    IsOSSelected: false,
                                                    IsChildItem:true,
                                                    GroupRespondent:listViewServiceAreaItem.ServiceAreaScoreDataCollection[0].ItemRespondent,
                                                    SESScoreComparator:getSESScoreComparator(cServiceAreaItem)
                                                };
                                                for (var cqIndex = 0; cqIndex < cServiceAreaItem.QuestionScores.length; cqIndex++) {
                                                    var cItem = cServiceAreaItem.QuestionScores[cqIndex];

                                                    var comparatorValue = comparatorFactory.GetScoreItemComparator(cItem.QuestionId);
                                                    var comparatorColor = dataFactory.GetScoreColor(cItem.Score, comparatorValue);
                                                    var scoreComparatorColor = {ScoreComparatorValue: comparatorValue, ColorCode: comparatorColor};

                                                    //add new property ScoreSettings
                                                    cServiceAreaItem.QuestionScores[cqIndex].ScoreComparatorColor = scoreComparatorColor;
                                                    if(selectedQuestionId == cItem.QuestionId){
                                                        cServiceAreaItem.ItemRespondent = cItem.TotalResponse;
                                                        cListViewServiceAreaItem.ScoreComparator = {
                                                            Score: cItem.Score,
                                                            ComparatorValue: comparatorValue,
                                                            ComparatorColorCode: comparatorColor
                                                        }
                                                    }
                                                    // var item2 = serviceAreaItem.QuestionScores[qIndex];
                                                }
                                                cListViewServiceAreaItem.IsOSSelected = (cServiceAreaItem.Id == "OS") ? true : false;
                                                cListViewServiceAreaItem.ServiceAreaScoreDataCollection.push(cServiceAreaItem);
                                                childItemColl.push(cListViewServiceAreaItem);
                                                //Adding the child as a free item in the grid.
                                                //Tree level will handle this
                                                listViewServiceAreaItemColl.push(cListViewServiceAreaItem);
                                                break;

                                            }
                                        }
                                        listViewServiceAreaItem.GrpItemsScoreDataColl = childItemColl;
                                        listViewServiceAreaItem.IsGroup = true;
                                    }
                                }

                                break;
                            }
                        }
                    }
                    $scope.selectedServiceAreaScoreDataColl = listViewServiceAreaItemColl;

                    return listViewServiceAreaItemColl;
                };

            }

            function setListView() {
                setNG_Ui_Grid();
               // console.log("list view data source length:" + $scope.selectedServiceAreaScoreDataColl.length);
                setListItemIcon(selectedAttribute.Type);
                $scope.listItemIconSrc = $scope.defaultImgSrc;
            }
            function setNG_Ui_Grid() {
              setResetGridColumn();
              $scope.uiGridConfig.data = $scope.selectedServiceAreaScoreDataColl;
              $scope.gridApi.grid.refresh();
                /*commented by tanvir
                in angular-ui grid it is not possible to change column width after grid build in first time ie by changing
                columnDefs[columnIndex].width. but the api $scope.gridApi.grid.getColumn('columnName') return a column object.
                changes width of this object width will reflect in view ie UI.
                 */
                var questionColumnWidth = serviceAreaQuestionCount * 31 +40;
                var questionColumn = $scope.gridApi.grid.getColumn('ServiceAreaQuestionColumn');

                if(!isIndividualServiceAreaColumnShowInGrid()){
                    if(!questionColumn)
                    {
                        var index = 0;
                        var isColumnFound = false;
                        for(var i=0;i<$scope.uiGridConfig.columnDefs.length;i++){
                            if($scope.uiGridConfig.columnDefs[i].displayName === 'QUESTIONS'){
                                isColumnFound = true;
                                break;
                            }
                            index++;
                        }
                        if(isColumnFound){
                            if(questionColumnWidth <100){
                                $scope.uiGridConfig.columnDefs[index].width = 100;
                            }
                            else{
                                $scope.uiGridConfig.columnDefs[index].width = questionColumnWidth;
                            }
                        }
                    }
                    if(questionColumn){
                        if(questionColumnWidth <100){
                            questionColumn.width=100;
                        }
                        else{
                            questionColumn.width=questionColumnWidth;
                        }
                    }
                }


              if($scope.uiGridConfig.data.length<1)
              {
                  $scope.noDataAvailable="No data available";
              }
            }
            function isIndividualServiceAreaColumnShowInGrid(){
                return (($scope.IsOSSelected || $scope.IsSESSelected || $scope.IsTCKSelected) && !($scope.selectedServiceAreaScoreDataColl[0] === null))
            }

            function setResetGridColumn(){
                $scope.columnsGrd= $scope.uiGridConfig.columnDefs

                while($scope.columnsGrd && $scope.columnsGrd.length > 0) {
                    $scope.columnsGrd.pop();

                }
                var isSESScoreAvailable=false;
                serviceAreaQuestionCount=0;
                if($scope.selectedServiceAreaScoreDataColl){
                    for(var index=0;index<$scope.selectedServiceAreaScoreDataColl.length;index++){
                        var item=$scope.selectedServiceAreaScoreDataColl[index];

                        if(serviceAreaQuestionCount==0){
                            serviceAreaQuestionCount=item.ServiceAreaScoreDataCollection[0].QuestionScores.length;
                            //console.log("question count :"+serviceAreaQuestionCount);
                        }

                        if(item.SESScoreComparator && item.ServiceAreaScoreDataCollection[0].Id !== "SES"){
                            isSESScoreAvailable=true;
                            break;
                        }
                    }
                }

                var dummyGridColumn = {
                    field:'dummyField',
                    displayName:'',
                    enableSorting: false,
                    headerCellTemplate: 'Views/ngUIGrid/HeaderTemplates/EvaluationColumnHeaderTemplate.html',
                    cellTemplate: ''
                };

                var respondentGridColumn= {
                    field: 'ServiceAreaScoreDataCollection[0].ItemRespondent',
                    displayName: 'EVALUATIONS',
                    enableSorting: true,
                    minWidth: 100,
                    maxWidth: 100,
                    headerCellTemplate: 'Views/ngUIGrid/HeaderTemplates/EvaluationColumnHeaderTemplate.html',
                    cellTemplate: 'Views/ngUIGrid/CellTemplates/EvaluationColumnCellTemplate.html',
                    sortingAlgorithm: sortByRespondentAsc,
                    sort: {
                        direction: uiGridConstants.DESC,
                        priority: 0
                    },
                    headerCellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                        $scope.columnSortOrder = "";
                        if (col.sort.direction) {
                            $scope.columnSortOrder = col.sort.direction;

                        }
                    }
                };
                var nameGridColumn={
                    field: 'Name',
                    displayName:'NAME',
                    cellTemplate: 'Views/ngUIGrid/CellTemplates/NameColumnCellTemplate.html',
                    headerCellTemplate: 'Views/ngUIGrid/HeaderTemplates/HeaderTemplate.html',
                    sortingAlgorithm: sortByNameAsc,
                    headerCellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                        if (col.sort.direction) {
                            $scope.columnSortOrder = "";
                            $scope.columnSortOrder = col.sort.direction;

                        }
                    },
                    minWidth: 100
                }
                var scoreGridColumn={
                    field: 'ScoreComparator',
                    displayName:  $scope.IsSESSelected?'IT SERVICE EFFORT SCORE':'SCORE',
                    //width:200,
                    headerCellTemplate: 'Views/ngUIGrid/HeaderTemplates/HeaderTemplate.html',
                    cellTemplate: 'Views/ngUIGrid/CellTemplates/ScoreColumnCellTemplate.html',
                    sortingAlgorithm: sortByScoreBarScore,
                    headerCellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                        if (col.sort.direction) {
                            $scope.columnSortOrder = "";
                            $scope.columnSortOrder = col.sort.direction;

                        }
                    }
                }
                var sesScoreGridColumn={
                    field: 'SESScoreComparator',
                    displayName: 'IT SES',
                    //width:200,
                    headerCellTemplate: 'Views/ngUIGrid/HeaderTemplates/HeaderTemplate.html',
                    cellTemplate: 'Views/ngUIGrid/CellTemplates/SESScoreColumnCellTemplate.html',
                    sortingAlgorithm: sortByScoreBarScore,
                    headerCellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                        if (col.sort.direction) {
                            $scope.columnSortOrder = "";
                            $scope.columnSortOrder = col.sort.direction;

                        }
                    }
                }
                if(isIndividualServiceAreaColumnShowInGrid())
                {
                    if($scope.IsTCKSelected)
                    {
                        nameGridColumn.width="40%";
                        nameGridColumn.minWidth= 100;
                    }
                    else{
                        scoreGridColumn.width=220;
                    }
                }
                else{
                    //nameGridColumn.width="18%";
                    nameGridColumn.minWidth=100;
                    scoreGridColumn.width=190;
                    sesScoreGridColumn.width=190;
                }

                $scope.columnsGrd.push(nameGridColumn);
                if(!$scope.IsTCKSelected)
                    $scope.columnsGrd.push(scoreGridColumn);


                if (isIndividualServiceAreaColumnShowInGrid())
                {
                    if($scope.selectedServiceAreaScoreDataColl.length > 0){
                        var selectedServiceAreaItem = $scope.selectedServiceAreaScoreDataColl[0];
                        var questions = selectedServiceAreaItem.ServiceAreaScoreDataCollection[0].QuestionScores;
                        for(var i=0;i<questions.length;i++)
                        {
                            //var columnName= questions[i].QuestionId;
                            var columnName = dataFactory.GetServiceAreaShortCode(questions[i].QuestionId);
                            var column={
                                field: 'ServiceAreaScoreDataCollection[0].QuestionScores',
                                displayName: columnName,
                                width:53,
                                serviceAreaId:questions[i].QuestionId,
                                cellTemplate:'Views/ngUIGrid/CellTemplates/IndividualServiceAreaQuestionScore.html',
                                headerCellTemplate: 'Views/ngUIGrid/HeaderTemplates/HeaderTemplate.html',
                                sortingAlgorithm: sortByIndividualServiceAreaScore,
                                headerCellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                                    if (col.sort.direction) {
                                        $scope.columnSortOrder = "";
                                        $scope.selectedColumnName="";
                                        $scope.columnSortOrder = col.sort.direction;
                                        $scope.selectedColumnName = col.colDef.serviceAreaId;
                                        //console.log("inside header CellClass name, sort order :"+ $scope.columnSortOrder );
                                    }
                                }};
                            $scope.columnsGrd.push(column);
                        }
                    }
                }
                else {
                    var column = {
                        name:'ServiceAreaQuestionColumn',
                        field: 'ServiceAreaScoreDataCollection[0].QuestionScores',
                        displayName: 'QUESTIONS',
                        //cellTemplate: 'Views/ngUIGrid/CellTemplates/ServiceAreaQuestionsScoreColumnCellTemplate.html',
                        cellTemplate:'<div class="grid-tooltip"> <div class="ui-grid-cell-contents">'+
                        '<div style="width: 100% !important;">'+
                        '<ul ng-repeat="q in row.entity.ServiceAreaScoreDataCollection[0].QuestionScores"'+
                        'style="display: inline;padding: 0px;margin: 0px">'+
                        '<li class="horizontal"><action-question-score question-item="q"></action-question-score>'+
                        ' </li></ul></div></div></div>',
                        headerCellTemplate: 'Views/ngUIGrid/HeaderTemplates/HeaderTemplate.html',
                        enableSorting: false
                    };
                    //console.log("question column width :"+column.width);
                    $scope.columnsGrd.push(column);
                }
                if(isSESScoreAvailable)
                {
                    $scope.columnsGrd.push(sesScoreGridColumn);
                }
                if(isIndividualServiceAreaColumnShowInGrid()){
                    $scope.columnsGrd.push(dummyGridColumn);
                }
                $scope.columnsGrd.push(respondentGridColumn);
                $scope.uiGridConfig.columnDefs = $scope.columnsGrd;
            }



            //grid row click handler
            $scope.rowSelection_Handler = function (data) {
                if(!document.getElementById("list-view-summary")) {
                    $scope.fromView = "listview";
                    $scope.isNeedToShowListSummary = true;
                    $scope.attributeData = data.AttributeData;
                    $scope.attributeIndex = selectedAttribute.Index;
                    $scope.titleImage = $scope.listItemIconSrc;
                    $scope.ngClassVar += ' open-popup-animation';
                    angular.element(document.getElementById('parentDiv')).append($compile("<div id='list-view-summary' ng-class='ngClassVar' ng-show='isNeedToShowListSummary' class='show-popup'>" +
                        "<action-attribute-score-summary id='list-view-attribute-summary'" +
                        "from-view='fromView' attribute-index='attributeIndex' attribute-value='attributeValue'" +
                        "title-image='titleImage' evaluation-data-collection='evaluationDataCollection' attribute-data='attributeData'" +
                        "control='listViewPopUp' on-summary-popup-close='summaryPopupCloseHandler($event)' on-expand-collapse-click='expandCollapseClickHandler(isExpanded)'></action-attribute-score-summary></div>")($scope));
                    //$scope.listViewPopUp.openSummaryView(data.AttributeData);
                }
            };

            $scope.$on(Notify.ATTRIBUTE_EVALUATION_FROM_LIST_READY, function (event,response) {
                if(angular.isUndefined(response)) return;
                $scope.evaluationDataCollection = response.data;
            });

            $scope.onViewByAttributeClicked = function(){

            };
            function getViewByAttribute(){
                var sAttributeCount =  dataFactory.GetSelectedServiceAreaAttributeCount()
                if(sAttributeCount && sAttributeCount.length > 0){
                    setViewAttribute(sAttributeCount);
                }
                else{
                    var requestData = attributeRequestParam(selectedAttribute);
                    requestData.selectedServiceId = selectedServiceAreaId;
                    dataFactory.LoadSelectedServiceAreaAttributeCount(requestData)
                }
            };
            function setViewAttribute(attributeCounts){
                var attList = ViewByAttributeDataFactory.getPreparedViewByAttributeData();
                _.forEach(attList, function(n,key){
                    _.forEach(n.Items, function (p,key){
                        var countItem = _.find(attributeCounts, function (m){
                            return m.Index == p.Index;
                        });
                        p.AttributeCount = countItem ? countItem.Count:0;
                    })
                });
                $timeout(function (){
                    $scope.attributeItemColl = attList;
                    $scope.dataSuccess = true;
                    $scope.defaultAttr = selectedAttribute.Label;
                },0);
            };
            $scope.$on(Notify.SERVICE_AREA_ATTRIBUTE_COUNT_DATA_READY, function (event) {
                var sAttributeCount =  dataFactory.GetSelectedServiceAreaAttributeCount()
                setViewAttribute(sAttributeCount);
            });

            //sep22-2015 shahin
            //$scope.gridScope.testHeadeClick = function(){
            //    console.log('text.....');
            //}
            //angular.element('.ui-grid-cell-contents').on('click', function (evt) {
            //    console.log(evt);
            //});



        }])//
});
