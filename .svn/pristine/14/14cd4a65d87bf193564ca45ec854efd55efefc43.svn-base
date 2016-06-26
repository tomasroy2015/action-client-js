
"use strict";

define(['application-configuration','ui-grid-unstable','lodash','evaluationTruncatedToolTip'], function (app) {

    app.register.directive('actionEvaluations', ['uiGridConstants','$timeout', '$modal', '$interval', function (uiGridConstants,$timeout, $modal, $interval) {
        return {
            restrict: 'AE',
            scope:{
                evaluationCollection:'=',
                selectedServiceAreaId:'=',
                selectedServiceAreaType:'=',
                selectedServiceAreaName:'=',
                hasTranslation:'=',
                onItemClick:'&',
                translationSelectionListener: '&',
                customAttributeCollection:'=',
                remarksColumnInfo:'='
            },

            link:function (scope, el, attrs) {
                scope.isShow = true;

                el.on('$destroy', function () {
                    //console.log("destroy calling....");
                    scope.$destroy();
                });
                scope.evaluationGridScope = {
                    rowHover: function (row) {

                    },
                    rowHoverOut: function (row) {

                    },
                    rowClick: function (row,rowRenderIndex) {
                       var selectedRowData=row.entity;
                        scope.selectedRespondentId = row.entity.RespondentId;
                        scope.IsRemarksLangSame = row.entity.IsRemarksLangSame;
                        scope.IsAdditionalRemarksLangSame = row.entity.IsRemarksAddLangSame;
                        scope.visibleEvaluationData = _.select(scope.gridApi.grid.rows, function(item){
                            return item.visible > 0;
                        });
                        var modalInstance = $modal.open({
                            animation: true,
                            template: '<div class="evaluation-summary-container"><action-evaluation-summary data="visibleEvaluationData" current-respondent-id="selectedRespondentId" selected-service-area-name="selectedServiceAreaName" selected-service-area-type="selectedServiceAreaType" has-translation="hasTranslation" selected-language-index="transCheckIndex" custom-attribute-collection="customAttributeCollection" remarks-info="remarksColumnInfo" is-remarks-lang-same="IsRemarksLangSame" is-additional-remarks-lang-same="IsAdditionalRemarksLangSame" close-evaluation-summary="closeEvaluationSummary($event)"></action-evaluation-summary></div>',
                            size: 'lg',
                            scope: scope
                        });

                        modalInstance.result.then(function (selectedItem) {
                            scope.selected = selectedItem;
                        });
                        scope.closeEvaluationSummary = function(event){
                            modalInstance.dismiss('Cancel');
                            //event.preventDefault();
                            //event.stopPropagation();
                        }
                    },
                    answerColMinWidth : function(){
                        //console.log("its working...");
                        return maxAnsArrayItemCount;
                    }
                }
                /*
                 columnVirtualizationThreshold: 10
                 rowHeight: 40
                 scrollDebounce: 300
                 scrollThreshold: 4
                 virtualizationThreshold: 20
                 wheelScrollThrottle: 70
                 */
                function getGridRowHeight(){
                    if( scope.transCheckIndex == 3)
                    return 80;
                    else
                    return 40;
                }
                function getVirtualizationThreshold(){
                    if( scope.transCheckIndex == 3)
                        return 800;
                    else
                        return 50;
                   // return 700;
                }
                function getExcessRows(data){
                    if(data && data.length>10)
                    //return data.length/2;
                    {
                        if( scope.transCheckIndex == 3)
                        return 400;
                        else
                        return 40;
                    }
                    else
                    return 0;
                }
                scope.columnSortOrder = "";
                scope.selectedColumnName;
                scope.columnsGrd=[];
                scope.commentedOnlyVal = false;
                //if the translation is enabled the default language is english otherwise original
                scope.transCheckIndex = scope.hasTranslation ? 2 : 1;
                scope.filterString = "";

                var answerColumnWidth=0;
                var maxAnsArrayItemCount=0;

                scope.evaluationUiGridConfig = {
                    rowHeight: getGridRowHeight(),
                    showGridFooter: true,
                    enableSorting: true,
                    rowSelectionHeader: false,
                    enableFullRowSelection: true,
                    enableRowSelection: true,
                    multiSelect: false,
                    showTreeRowHeader:false,
                    enableRowHeaderSelection: false,
                    enableGridMenu: false,
                    //columnVirtualizationThreshold: 10,
                    //virtualizationThreshold: getVirtualizationThreshold(),
                    //excessRows:100,
                    onRegisterApi: function (gridApi) {
                        scope.gridApi = gridApi;
                        scope.gridApi.grid.options.enableHorizontalScrollbar=0;
                        scope.gridApi.core.on.sortChanged(scope, function (grid, sort) {
                            scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
                            scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
                        });
                        scope.gridApi.grid.registerRowsProcessor( scope.evaluationFilter, 200);
                    },
                    rowTemplate: 'Views/Shared/Template/Evaluation/EvaluationUIGrid/EvaluationGridRowTemplate.html',
                    gridFooterTemplate:'Views/Shared/Template/Evaluation/EvaluationUIGrid/EvaluationGridFooterTemplate.html'
                };
                scope.$watch(function(scope){return scope.evaluationCollection},function(newValue,oldValue){
                    if(angular.isUndefined(newValue) || newValue.length<1) {
                        scope.evaluationUiGridConfig.data = [];
                        scope.gridApi.grid.refresh();
                        return;
                    }

                    setEvaluationUIGrid(newValue);
                },true)
                function setEvaluationUIGrid(newValue){

                    maxAnsArrayItemCount=0;
                    _.forEach(newValue, function(item){
                        if(item.Answers){
                            maxAnsArrayItemCount = Math.max(item.Answers.length,maxAnsArrayItemCount);
                        }
                    })
                    var colData = newValue[0].Answers;
                    setResetUIGridColumn(colData);
                    $timeout(function(){
                        scope.evaluationUiGridConfig.data=newValue;
                        scope.evaluationUiGridConfig.rowHeight=getGridRowHeight();
                        scope.evaluationUiGridConfig.excessRows=getExcessRows(newValue);
                        //scope.evaluationUiGridConfig.virtualizationThreshold=getVirtualizationThreshold();
                        if(!angular.isUndefined(scope.gridApi))
                        scope.gridApi.grid.buildColumns();
                        scope.gridApi.grid.updateCanvasHeight();
                        scope.gridApi.grid.queueGridRefresh();
                        scope.gridApi.grid.refresh();
                    },1000)

                }
                function setResetUIGridColumn(colData){
                    while(scope.columnsGrd && scope.columnsGrd.length > 0) {
                        scope.columnsGrd.pop();
                    }

                    var widthPercentage=Math.ceil((30/8)* colData.length);
                    var widthStr=widthPercentage+"%";

                    //maxAnsArrayItemCount = maxAnsArrayItemCount*40;

                    if(maxAnsArrayItemCount<2){
                        maxAnsArrayItemCount=80;
                    }
                    else{
                        maxAnsArrayItemCount = maxAnsArrayItemCount*31;
                    }

                   // console.log(widthStr);
                    var answersGridColumn={
                        colColl:colData,
                        field:getSelectedTranslatedAnswerType(scope.transCheckIndex),
                        displayName:'SCORES',
                        enableSorting: false,
                        minWidth:80,
                        width: maxAnsArrayItemCount,
                        cellTemplate:getAnswerCellTemplateURI(scope.transCheckIndex),
                        headerCellTemplate:'Views/Shared/Template/Evaluation/EvaluationUIGrid/HeaderTemplates/AnswerColumnHeaderTemplate.html'
                    }
                    var commentsGridColumn= {
                        field: getSelectedTranslatedRemarksType(scope.transCheckIndex),
                        displayName: scope.remarksColumnInfo.Remarks,
                        enableSorting: true,
                        headerCellTemplate: 'Views/Shared/Template/Evaluation/EvaluationUIGrid/HeaderTemplates/HeaderTemplate.html',
                        cellTemplate: getRemarksCellTemplateURI(scope.transCheckIndex)
                    };
                    var additionalRemarksGridColumn= {
                        field: getSelectedAdditionalTranslatedRemarksType(scope.transCheckIndex),
                        displayName: scope.remarksColumnInfo.RemarksAdd,
                        enableSorting: true,
                        headerCellTemplate: 'Views/Shared/Template/Evaluation/EvaluationUIGrid/HeaderTemplates/HeaderTemplate.html',
                        cellTemplate: getAdditionalRemarksCellTemplateURI(scope.transCheckIndex)
                    };

                    if(scope.remarksColumnInfo.Remarks!=""){
                        scope.columnsGrd.push(commentsGridColumn);
                    }
                    if(scope.remarksColumnInfo.RemarksAdd!=""){
                        scope.columnsGrd.push(additionalRemarksGridColumn);
                    }
                    scope.columnsGrd.push(answersGridColumn);
                    scope.evaluationUiGridConfig.columnDefs = scope.columnsGrd;
                }
                scope.onEvaluationItemClick = function(selectedItem){
                    scope.onItemClick({selectedEvaluation:selectedItem});
                };
                //scope.onFilterButtonClick = function(inputText){
                //    scope.onFilterClick({filterString:inputText})
                //};evaluationUiGridConfig.data
                scope.getVisibleRowCount = function(){
                    if(scope.gridApi){
                        var remarksCount =  _.select(scope.gridApi.grid.rows, function(n){
                            return n.visible > 0;
                        });
                        return remarksCount.length;
                    }
                };
                scope.getRemarksCount = function(){
                  if(scope.gridApi){
                      var remarksCount =  _.select(scope.gridApi.grid.rows, function(n){
                          return /*n.visible && */((n.entity.Remarks && n.entity.Remarks.length) > 0 || (n.entity.RemarksAdd && n.entity.RemarksAdd.length > 0));
                      });
                      return remarksCount.length;
                  }
                };
                scope.onEvaluationFilterClick = function(){
                    scope.gridApi.grid.refresh();
                };
                scope.evaluationFilter = function( renderableRows ){
                   _.forEach(renderableRows, function( row, key ) {
                       if(scope.commentedOnlyVal || (scope.filterString && scope.filterString.length > 0)) {
                           if(scope.transCheckIndex == 3){
                               row.visible = ((row.entity.Remarks && row.entity.Remarks.length > 0) || (row.entity.RemarksAdd && row.entity.RemarksAdd.length > 0)) && (evaluateFilterString(row.entity.BothEvaluationData, scope.filterString) || evaluateFilterString(row.entity.BothEvaluationData, scope.filterString));
                           }else {
                               row.visible = ((row.entity.Remarks && row.entity.Remarks.length > 0) || (row.entity.RemarksAdd && row.entity.RemarksAdd.length > 0)) && evaluateFilterString(row.entity, scope.filterString);
                           }
                       } else{
                           row.visible = true;
                       }
                    });
                   // console.log(scope.getRemarksCount());
                    return renderableRows;
                };
                scope.onTranslationCheck = function($event){
                    var checkBoxId  = $event.target.id;
                    var prevTransIndex = scope.transCheckIndex;

                    if(checkBoxId == 'chkOriginal'){
                        scope.transCheckIndex = 1;
                        //scope.evaluationUiGridConfig.rowHeight=40;
                    } else if(checkBoxId == 'chkTranslated'){
                        scope.transCheckIndex = 2;
                        //scope.evaluationUiGridConfig.rowHeight=40;
                    } else if(checkBoxId == 'chkBoth'){
                        scope.transCheckIndex = 3;
                        //scope.evaluationUiGridConfig.rowHeight=80;
                        /*temporary return code*/
                        //return;
                    }
                    if(prevTransIndex === scope.transCheckIndex) {
                        $event.target.checked = true;
                        return;
                    }
                    scope.translationSelectionListener({type: scope.transCheckIndex});

                    showEvaluationForSelectedTranslation();
                }

                function showEvaluationForSelectedTranslation(){
                    var data = scope.evaluationUiGridConfig.data;
                    setEvaluationUIGrid(data)
                }
                function getSelectedTranslatedRemarksType(translationId)
                {
                    var type="";
                    if(translationId==1)
                    type="Remarks";
                    else if(translationId==2)
                    type="RemarksEng";
                    else if(translationId==3)
                    type="BothEvaluationData";
                    return type;
                }
                function getSelectedAdditionalTranslatedRemarksType(translationId)
                {
                    var type="";
                    if(translationId==1)
                        type="RemarksAdd";
                    else if(translationId==2)
                        type="RemarksAddEng";
                    else if(translationId==3)
                        type="BothEvaluationData";
                    return type;
                }
                function getSelectedTranslatedAnswerType(translationId)
                {
                    return translationId==3?"BothEvaluationData.Answers":"Answers";
                }
                function getRemarksCellTemplateURI(translationId)
                {
                    var uri="";
                    if(translationId==1)
                        uri="Views/Shared/Template/Evaluation/EvaluationUIGrid/CellTemplates/CommentsColumnCellTemplate.html";
                    else if(translationId==2)
                        uri="Views/Shared/Template/Evaluation/EvaluationUIGrid/CellTemplates/TranslatedCommentsColumnCellTemplate.html";
                    else if(translationId==3){
                        uri="Views/Shared/Template/Evaluation/EvaluationUIGrid/CellTemplates/BothCommentsCellTemplate.html";
                    }
                    return uri;
                }
                function getAdditionalRemarksCellTemplateURI(translationId)
                {
                    var uri="";
                    if(translationId==1)
                        uri="Views/Shared/Template/Evaluation/EvaluationUIGrid/CellTemplates/AdditionalRemarksColumnCellTemplate.html";
                    else if(translationId==2)
                        uri="Views/Shared/Template/Evaluation/EvaluationUIGrid/CellTemplates/TranslatedAdditionalRemarksColumnCellTemplate.html";
                    else if(translationId==3){
                        uri="Views/Shared/Template/Evaluation/EvaluationUIGrid/CellTemplates/BothAdditionalRemarksCellTemplate.html";
                    }
                    return uri;
                }

                function getAnswerCellTemplateURI(translationId){
                    var uri="";
                    if((translationId==1)||(translationId==2))
                        uri="Views/Shared/Template/Evaluation/EvaluationUIGrid/CellTemplates/AnswerColumnCellTemplate.html";
                    /*else if(translationId==2)
                        uri="Views/LeftMenu.Evaluations/EvaluationUIGrid/CellTemplates/AnswerColumnCellTemplate.html";*/
                    else if(translationId==3){
                        //console.log("both  selected..");
                        uri="Views/Shared/Template/Evaluation/EvaluationUIGrid/CellTemplates/BothAnswerColumnCellTemplate.html";
                    }
                    return uri;
                }
                function evaluateFilterString(currentEvaluation, filterString){
                    if(!filterString || filterString.length <= 0){
                        return true;
                    }
                    //var remarksRegular = scope.transCheckIndex == 3 ? currentEvaluation.Remarks + ' ' +  currentEvaluation.RemarksEng : scope.transCheckIndex === 1 ? currentEvaluation.Remarks : currentEvaluation.RemarksEng;
                    //var remarksAdditional = scope.transCheckIndex == 3 ? currentEvaluation.RemarksAdd + ' ' +  currentEvaluation.RemarksAddEng  : scope.transCheckIndex === 1 ? currentEvaluation.RemarksAdd : currentEvaluation.RemarksAddEng;

                    var remarksRegular = scope.hasTranslation ? currentEvaluation.Remarks + ' ' +  currentEvaluation.RemarksEng : currentEvaluation.Remarks;
                    var remarksAdditional = scope.hasTranslation ? currentEvaluation.RemarksAdd + ' ' +  currentEvaluation.RemarksAddEng  : currentEvaluation.RemarksAdd;

                    var filterArrayOfAnd = filterString.split("AND");
                    if(filterArrayOfAnd.length > 1){
                        var filterMatched = true;
                        var i = 0;
                        for(; i < filterArrayOfAnd.length; i++){
                            if(remarksRegular && remarksRegular.length > 0 && remarksRegular.toLowerCase().indexOf(filterArrayOfAnd[i].toLowerCase()) < 0 && remarksAdditional && remarksAdditional.length > 0 && remarksAdditional.toLowerCase().indexOf(filterArrayOfAnd[i].toLowerCase()) < 0){
                                filterMatched = false;
                                break;
                            }
                        }
                        return filterMatched;
                    } else {
                        var filterArrayOfOr = filterString.split("OR");
                        if(filterArrayOfOr.length > 1) {
                            var filterMatched = false;
                            var i = 0;
                            for(; i < filterArrayOfOr.length; i++){
                                if((remarksRegular && remarksRegular.length > 0 && remarksRegular.toLowerCase().indexOf(filterArrayOfOr[i].toLowerCase()) > -1) || (remarksAdditional && remarksAdditional.length > 0 && remarksAdditional.toLowerCase().indexOf(filterArrayOfOr[i].toLowerCase()) > -1)){
                                    filterMatched = true;
                                    break;
                                }
                            }
                            return filterMatched;
                        }else{
                            return (remarksRegular && remarksRegular.length > 0 && remarksRegular.toLowerCase().indexOf(filterString.toLowerCase()) > -1) || (remarksAdditional && remarksAdditional.length > 0 && remarksAdditional.toLowerCase().indexOf(filterString.toLowerCase()) > -1);
                        }
                    }
                }
                scope.resetFilter = function(){
                    scope.filterString = '';
                    scope.gridApi.grid.refresh();
                }
            },
            templateUrl: 'Views/Shared/Template/Evaluation/ServiceAreaEvaluationsTemplate.html'
        };
    }]);

});