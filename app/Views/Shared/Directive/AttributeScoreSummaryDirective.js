"use strict";
define(['application-configuration','lodash'], function (app) {

    app.register.directive('actionAttributeScoreSummary',['$timeout','Notify','moreSettingsFactory','dataFactory','attributeScoreSummaryData','appSettings','accountFactory','UserType','dataFilterFactory',
        function ($timeout,Notify,moreSettingsFactory,dataFactory,attributeScoreSummaryData,appSettings,accountFactory,UserType,dataFilterFactory) {

            return {
                restrict: 'AE',
                scope   : {
                    fromView:"=",
                    titleImage:"=",
                    attributeIndex:"=",
                    attributeValue:"=",
                    evaluationDataCollection:"=",
                    control:"=",
                    attributeData:"=",
                    onSummaryPopupClose:'&',
                    onExpandCollapseClick:'&'
                },
                link    : function (scope,el,attrs) {
                    var selectedServiceAreaID = "";
                    var selectedQuestion = {};
                    var serviceAreaViewScoreDataCollection = [];
                    var screenWidth;
                    var screenHeight;
                    scope.Respondents = 0;
                    scope.colorSet = {};
                    scope.ticketSummaryData = {};
                    scope.scorecardSelected = true;
                    scope.evaluationSelected = false;
                    scope.isDetailsActive = false;
                    scope.isDetailsState = false;
                    scope.isSummaryState = true;
                    scope.isOSSelected = true;
                    scope.isSESSelected = false;
                    scope.isTCKSelected = false;
                    scope.selectedAttributeQuestionId = "";
                    scope.fullScorecardData = {};
                    //scope.attributeData = {};
                    scope.QuestionScoreData = {};
                    var isTranslationSelected = false;
                    scope.remarksColumnInfo = {};
                    scope.isCustomerUser = false;
                    init();
                    scope.control.openSummaryView = function(data){
                        scope.isCustomerUser = accountFactory.UserData().UserType == UserType.END_USER;
                        scope.attributeData = data;
                        if(scope.fromView == "listview"){
                            $('#list-view-summary').addClass('show-popup open-popup-animation').removeClass('hide-popup');
                            $('#list-view-wrapper').css({"display":'block'});
                        }else if(scope.fromView == "mapview"){
                            $('#map-view-summary').addClass('show-popup open-popup-animation').removeClass('hide-popup');
                        }
                        selectedServiceAreaID = dataFactory.SelectedServiceAreaId();
                        selectedQuestion = dataFactory.GetSelectedQuestion();
                        //scope.selectedAttributeQuestionId = selectedQuestion != null ? selectedQuestion.ID : selectedServiceAreaID;
                        serviceAreaViewScoreDataCollection = dataFactory.PrepareAttributeSeriveAreaViewScoreData(scope.attributeData.ServiceAreaScoreDataCollection);
                        scope.attributeValue = scope.attributeData.Id;
                        scope.summaryTitle = scope.attributeData.Name;
                        scope.generalSurveyCollection = function(){
                            return _.filter(dataFactory.ServiceAreaCollection(), function(n){
                                return n.SurveyType == "GEN" || n.SurveyType == "NOG";
                            });
                        }();
                        scope.triggerSurveyCollection =  function(){
                            var tmp =  _.filter(dataFactory.ServiceAreaScoreDataCollection(), function(n){
                                return n.SurveyType == "TCK";
                            });
                            return _.sortByOrder(tmp,"SortOrder",true);
                        }();
                        initializeScoreData();
                    };
                    function init(){
                        scope.isCustomerUser = accountFactory.UserData().UserType == UserType.END_USER;
                        selectedServiceAreaID = dataFactory.SelectedServiceAreaId();
                        selectedQuestion = dataFactory.GetSelectedQuestion();
                        scope.selectedAttributeQuestionId = selectedServiceAreaID;
                        serviceAreaViewScoreDataCollection = dataFactory.PrepareAttributeSeriveAreaViewScoreData(scope.attributeData.ServiceAreaScoreDataCollection);
                        scope.attributeValue = scope.attributeData.Id;
                        scope.summaryTitle = scope.attributeData.Name;
                        scope.generalSurveyCollection = function(){
                            return _.filter(dataFactory.ServiceAreaCollection(), function(n){
                                return n.SurveyType == "GEN" || n.SurveyType == "NOG";
                            });
                        }();
                        scope.triggerSurveyCollection =  function(){
                            var tmp =  _.filter(dataFactory.ServiceAreaScoreDataCollection(), function(n){
                                return n.SurveyType == "TCK";
                            });
                            return _.sortByOrder(tmp,"SortOrder",true);
                        }();
                        initializeScoreData();
                    };
                    function initializeScoreData(){
//                        screenWidth =window.screen.availWidth;// $(window).width();
//                        screenHeight =window.screen.availHeight;//$(window).height();
                        isTranslationSelected = dataFactory.CustomerGeneralSettings().HasTranslation;
                        var elem = "#"+el[0].parentElement.id;
                        //$(elem).css({"width":'274px',"height":'auto'});//added 29.7.2015
                        var selectedArrow = $(elem).find('#selected-summary-arrow');
                        $(selectedArrow).addClass('score-summary-arrow-selected').removeClass('evaluation-summary-arrow-selected');
                        scope.scorecardSelected = true;
                        scope.evaluationSelected = false;
                        scope.isDetailsActive = accountFactory.IsDetailsRoleActive();
                        setSelectedServiceArea(selectedServiceAreaID);
                    }
                    scope.scorecard_selected = function(evt){
                        var elem = "#"+el[0].parentElement.id;
                        var selectedArrow = $(elem).find('#selected-summary-arrow');
                        $(selectedArrow).addClass('score-summary-arrow-selected').removeClass('evaluation-summary-arrow-selected');
                        scope.scorecardSelected = true;
                        scope.evaluationSelected = false;

                        if(scope.isDetailsState){
                            scope.fullScorecardData= dataFactory.preparedFullScorecardDataCollection(serviceAreaViewScoreDataCollection);
                        }
                        setSelectedServiceArea(selectedServiceAreaID);
                    };
                    scope.evaluation_selected = function(evt){
                        var elem = "#"+el[0].parentElement.id;
                        var selectedArrow = $(elem).find('#selected-summary-arrow');
                        $(selectedArrow).addClass('evaluation-summary-arrow-selected').removeClass('score-summary-arrow-selected');
                        if(scope.isSummaryState){
                            scope.scorecardSelected = false;
                            scope.evaluationSelected = true;
                        }else{
                            scope.evaluationDataCollection = [];
                            scope.scorecardSelected = false;
                            scope.evaluationSelected = true;
                            attributeScoreSummaryData.setSelectedView(el[0].id);
                            var requestParam = {};
                            requestParam = createEvaluationParameter(requestParam);
                            dataFactory.GetAttributeEvaluations(requestParam);
                        }
                       setSelectedServiceArea(selectedServiceAreaID)
                    };
                    scope.questionItemClick = function (selectedQuestion) {
                        scope.selectedAttributeQuestionId = selectedQuestion.QuestionId;
                    };
                    scope.questionItemDblClick = function (selectedQuestion){
                        if(selectedQuestion.IsGroup || selectedQuestion.QuestionId.indexOf("_") >= 0)
                            return;

                        selectedQuestion.Id = selectedQuestion.QuestionId;
                        selectedServiceAreaID = selectedQuestion.Id;
                        setSelectedServiceArea(selectedQuestion.Id);
                    };

                    scope.close_summary = function(event){
                        scope.ticketSummaryData = {};
                        scope.scorecardSelected = true;
                        scope.evaluationSelected = false;
                        scope.isDetailsState = false;
                        scope.isSummaryState = true;
                        scope.isOSSelected = true;
                        scope.isSESSelected = false;
                        scope.isTCKSelected = false;

                        if(scope.fromView == 'mapview'){
                            //$('#map-view-summary').addClass('hide-popup').removeClass('show-popup open-popup-animation');
                            //$('#map-view-summary').addClass('hide-popup').removeClass('show-popup');
                            //$('#map-view-summary').removeClass('expand-details').removeClass('collapse-details');
                            //
                            //var mapArrow = $('#map-view-summary').find('#selected-summary-arrow');
                            //$(mapArrow).addClass('score-summary-arrow-selected').removeClass('evaluation-summary-arrow-selected');
                            //
                            //var summayElement = $('#map-view-summary').find('#summary-service-area-container,#summary-container,#btn-view-details,#summary-popup-footer');
                            //$(summayElement).addClass('show-summary-content').removeClass('hide-summary-content');
                            scope.onSummaryPopupClose(event);
                        }else if(scope.fromView == 'listview'){
                            //$('#list-view-summary').addClass('hide-popup').removeClass('show-popup open-popup-animation');
                            //$('#list-view-summary').addClass('hide-popup').removeClass('show-popup');
                            //$('#list-view-summary').removeClass('expand-details').removeClass('collapse-details');
                            //
                            //var listArrow = $('#list-view-summary').find('#selected-summary-arrow');
                            //$(listArrow).addClass('score-summary-arrow-selected').removeClass('evaluation-summary-arrow-selected');
                            //$('#list-view-wrapper').css({"display":'none'});
                            //
                            //var summayElement = $('#list-view-summary').find('#summary-service-area-container,#summary-container,#btn-view-details,#summary-popup-footer');
                            //$(summayElement).addClass('show-summary-content').removeClass('hide-summary-content');
                            scope.onSummaryPopupClose(event);
                        }

                    };

                    scope.viewDetails_click_Handler = function(event){
                        var requestParam= {};
                        scope.isDetailsState = true;
                        scope.isSummaryState = false;
                        var elem = "#"+el[0].parentElement.id;
                        $(elem).addClass('expand-details').removeClass('collapse-details');

                        var arrow = $(elem).find('#selected-summary-arrow');
                        var summaryElement = $(elem).find('#summary-service-area-container,#summary-container,#btn-view-details,#summary-popup-footer');
                        $(summaryElement).addClass('hide-summary-content show-by-animation').removeClass('show-summary-content');

                        if(scope.scorecardSelected) {
                            $(arrow).addClass('score-summary-arrow-selected').removeClass('evaluation-summary-arrow-selected');
                            scope.scorecardSelected = true;
                            scope.evaluationSelected = false;
                            scope.fullScorecardData= dataFactory.preparedFullScorecardDataCollection(serviceAreaViewScoreDataCollection);
                            setFullScorecardDetails();
                        }else {
                            scope.evaluationDataCollection = [];
                            $(arrow).addClass('evaluation-summary-arrow-selected').removeClass('score-summary-arrow-selected');
                            scope.scorecardSelected = false;
                            scope.evaluationSelected = true;
                            attributeScoreSummaryData.setSelectedView(el[0].id);


                            requestParam = createEvaluationParameter(requestParam);
                            dataFactory.GetAttributeEvaluations(requestParam);
                        }
                        scope.onExpandCollapseClick({isExpanded:true});
                        //expandWindow(elem);//added 29.7.2015
                    };
                    function setFullScorecardDetails(){
                        $timeout(function () {
                            scope.$apply(calculateFullScorecardContainer());
                        }, 0);
                    }
                    function calculateFullScorecardContainer() {
                        if(angular.isUndefined(scope.fullScorecardData)) return;

                        if(scope.fullScorecardData.generalSurveyData && scope.fullScorecardData.triggerSurveyData) {
                            var gen = scope.fullScorecardData.generalSurveyData.length;
                            var trig = scope.fullScorecardData.triggerSurveyData.length;

                            var contentWidth = 0;
                            if (gen >= trig) {
                                contentWidth = (298 * gen) + (15 * (gen - 1)) + 15 + 'px';
                            } else {
                                contentWidth = (298 * trig) + (15 * (trig - 1)) + 15 + 'px';
                            }

                            $('div.general-survey-wrapper,div.trigger-survey-wrapper').css({
                                width: contentWidth.toString()
                            });
                        } else if(scope.fullScorecardData.generalSurveyData){
                            var gen = scope.fullScorecardData.generalSurveyData.length;
                            var contentWidth = 0;
                            contentWidth = (298 * gen) + (15 * (gen - 1)) + 15 + 'px';

                            $('div.general-survey-wrapper').css({
                                width: contentWidth.toString()
                            });
                        } else if(scope.fullScorecardData.triggerSurveyData){
                            var gen = scope.fullScorecardData.triggerSurveyData.length;
                            var contentWidth = 0;
                            contentWidth = (298 * gen) + (15 * (gen - 1)) + 15 + 'px';

                            $('div.trigger-survey-wrapper').css({
                                width: contentWidth.toString()
                            });
                        }
                    }
                    function expandWindow(elem){
                        $(elem).css({
                            "transition-property": 'width,height',
                            "transition-duration": '0.25s',
                            "transition-timing-function": 'ease-in',
                            "width": (screenWidth - 285).toString()+'px',
                            "height":(screenHeight - 100).toString()+'px'});
                    }
                    function collapseWindow(elem){
                        $(elem).css({
                            "transition-property": 'width,height,min-height',
                            "transition-duration": '0.25s',
                            "transition-timing-function": 'ease-in',
                            "width": '274px',
                            "height":'auto',
                            "min-height":'500px'});
                    }
                    scope.viewEvaluation_click_Handler = function(event){
                        var requestParam= {};
                        scope.evaluationDataCollection = [];
                        scope.isDetailsState = true;
                        scope.isSummaryState = false;
                        scope.scorecardSelected = false;
                        scope.evaluationSelected = true;

                        var elem = "#"+el[0].parentElement.id;
                        $(elem).addClass('expand-details').removeClass('collapse-details');
                        //
                        //var arrow = $(elem).find('#selected-summary-arrow');
                        //$(arrow).addClass('evaluation-summary-arrow-selected').removeClass('score-summary-arrow-selected');
                        //
                        //var summaryElement = $(elem).find('#summary-service-area-container,#summary-container,#btn-view-details,#summary-popup-footer');
                        //$(summaryElement).addClass('hide-summary-content show-by-animation').removeClass('show-summary-content');

                        attributeScoreSummaryData.setSelectedView(el[0].id);
                        requestParam = createEvaluationParameter(requestParam);
                        dataFactory.GetAttributeEvaluations(requestParam);
                        //expandWindow(elem);//added 29.7.2015
                        scope.onExpandCollapseClick({isExpanded:true});
                    };
                    scope.translationSelectionEvent = function (type) {
                        isTranslationSelected = type === 2;
                    };
                    scope.download_evaluation = function(){
                        var requestParameter = getEvaluationsRequestParam();
                        var url = addParameterToURL(requestParameter,appSettings.API_BASE_URL+"EvaluationDataTemplate.aspx");
                        window.location.href =  url;
                    };
                    function formatDate(date) {
                        date = new Date(date);

                        var day = ('0' + date.getDate()).slice(-2);
                        var month = ('0' + (date.getMonth() + 1)).slice(-2);
                        var year = date.getFullYear();

                        return year + '-' + month + '-' + day;
                    }

                    function addParameterToURL(requestParameter,_url){
                        var hasAdditionalRemarks = scope.remarksColumnInfo.RemarksAdd != "";
                        var filterData = "";
                        var appliedFilterData = dataFilterFactory.GetAppliedDataFilterCollection();
                        var param = "sessionId="+requestParameter.sessionID;
                        param += "&customerId=" +requestParameter.customerID;
                        param += "&fromDate=" +requestParameter.fromDate.toString();
                        param += "&toDate=" +requestParameter.toDate.toString();
                        param += "&surveyType=" +requestParameter.surveyType;
                        param += "&serviceAreaId="+selectedServiceAreaID;
                        param += "&isAttributeEvaluation="+"true";
                        param += "&hasTranslation=" + (isTranslationSelected ? "YES" : "NO");
                        param += "&hasAdditionalRemarks=" + (hasAdditionalRemarks ? "YES" : "NO");
                        if(appliedFilterData && appliedFilterData.length > 0){
                            appliedFilterData = _.sortBy(appliedFilterData, function(x) {return x.Type;});
                            filterData = "";
                            _.forEach(appliedFilterData,function(n){
                                var dollarIndex = filterData.lastIndexOf("$");
                                if(dollarIndex && dollarIndex > -1){
                                    filterData = filterData.slice(0,filterData.length - 1);
                                    filterData += "/";
                                }
                                filterData += n.Index.toString()+"$";
                                _.forEach(n.Ids,function(i){
                                    filterData += i.toString()+"$";
                                });
                            });
                        }
                        param += "&allFilters="+(filterData);
                        param += "&generalFilter="+((dataFactory.DataInfo().gFilter == null) ? "" : dataFactory.DataInfo().gFilter);
                        param += "&ticketFilter="+((dataFactory.DataInfo().tFilter == null) ? "" : dataFactory.DataInfo().tFilter);
                        param += "&attributeIndex="+ scope.attributeIndex.toString();
                        param += "&attributeValues="+ scope.attributeValue;

                        _url += (_url.split('?')[1] ? '&':'?') + param;
                        return _url;
                    }
                    function getEvaluationsRequestParam() {
                        var applicationDataInfo = dataFactory.DataInfo();
                        var selectedSurveyType = GetSelectedServiceAreaSurveyType();
                        scope.selectedServiceAreaType = selectedSurveyType;
                        scope.customAttributeCollection = dataFactory.CustomAttributeCollection();
                        return{
                            sessionID: accountFactory.UserData().SessionId,
                            customerID: applicationDataInfo.customerID,
                            fromDate: applicationDataInfo.fromDate,
                            toDate: applicationDataInfo.toDate,
                            surveyType: surveyTypeConverter(selectedSurveyType)
                        }
                    }
                    function GetSelectedServiceAreaSurveyType() {
                        return _.result(_.findWhere(scope.attributeData.ServiceAreaScoreDataCollection, {'Id': selectedServiceAreaID}), 'SurveyType');
                    }
                    function surveyTypeConverter(type) {
                        return  type == "NOG" ? "GEN" : type;
                    }
                    scope.backToSummary_click_Handler = function(){
                        scope.isDetailsState = false;
                        scope.isSummaryState = true;

                        var elem = "#"+el[0].parentElement.id;
                        //var arrow = $(elem).find('#selected-summary-arrow');
                        var summaryElement = $(elem).find('#summary-service-area-container,#summary-container,#btn-view-details,#summary-popup-footer');
                        $(elem).addClass('collapse-details').removeClass('expand-details');
                       // collapseWindow(elem); //added 29.7.2015
                        if(scope.scorecardSelected) {
                            //$(arrow).addClass('score-summary-arrow-selected').removeClass('evaluation-summary-arrow-selected');
                            $(summaryElement).addClass('show-summary-content show-by-animation').removeClass('hide-summary-content');
                        }else {
                            //$(arrow).addClass('evaluation-summary-arrow-selected').removeClass('score-summary-arrow-selected');
                            $(summaryElement).addClass('show-summary-content show-by-animation').removeClass('hide-summary-content');
                        }
                        scope.onExpandCollapseClick({isExpanded:false});
                    };
                    scope.scoreBar_Clicked = function (selectedItem) {
                        if(angular.isUndefined(selectedItem)) return;

                        selectedQuestion = null;
                        selectedServiceAreaID = selectedItem.Id;
                        setSelectedServiceArea(selectedServiceAreaID);
                    };
                    function setSelectedServiceArea(selectedServiceAreaID){
                        if(selectedServiceAreaID === "") return;
                        serviceAreaViewScoreDataCollection = dataFactory.PrepareAttributeSeriveAreaViewScoreData(scope.attributeData.ServiceAreaScoreDataCollection);
                        scope.remarksColumnInfo = dataFactory.AttributeEvaluationRemarksInfo(selectedServiceAreaID);
                        scope.selectedServiceAreaType =  GetSelectedServiceAreaSurveyType();
                        scope.customAttributeCollection = dataFactory.CustomAttributeCollection();
                        scope.selectedAttributeScore = dataFactory.getSelectedAttributeServiceAreaViewDataById(serviceAreaViewScoreDataCollection,selectedServiceAreaID);
                        scope.evaluationSummary = attributeScoreSummaryData.getEvaluationSummaryData(scope.attributeData.ServiceAreaScoreDataCollection,scope.selectedAttributeScore,selectedServiceAreaID);
                        if(selectedServiceAreaID == "OS") {
                            scope.isOSSelected = true;
                            scope.isSESSelected = false;
                            scope.isTCKSelected = false;
                            scope.QuestionScoreData = _.find(scope.evaluationSummary, function (n) {
                                                      return n.QuestionId == ('OS' || 'NOG');
                                                });
                            scope.QuestionScoreData.ShortCode = "SAT";
                            getRespondents(serviceAreaViewScoreDataCollection,selectedServiceAreaID);
                        }else if(selectedServiceAreaID == "SES"){
                            scope.isSESSelected = true;
                            scope.isOSSelected = false;
                            scope.isTCKSelected = false;
                            scope.QuestionScoreData = dataFactory.GetSelectedAttributeSESFrequency(scope.attributeData.ServiceAreaScoreDataCollection);
                            var sesData = _.find(scope.evaluationSummary, function (n) {
                                                     return n.QuestionId == 'SES';
                                               });

                            scope.QuestionScoreData.NoOfRespondent =  scope.QuestionScoreData.Respondent;
                            scope.QuestionScoreData.ScoreColor = sesData.ScoreColor;
                            scope.QuestionScoreData.QuestionText = sesData.QuestionText;
                            scope.QuestionScoreData.ShortCode = "SES";
                            scope.QuestionScoreData.Comparator = 'NaN';
                            getRespondents(scope.attributeData.ServiceAreaScoreDataCollection,selectedServiceAreaID);
                        }else if(selectedServiceAreaID == "TCK"){
                            scope.isSESSelected = false;
                            scope.isTCKSelected = true;
                            scope.isOSSelected = false;

                            if(scope.evaluationSelected && scope.isSummaryState){
                                var temp = _.filter(serviceAreaViewScoreDataCollection,function(n){
                                                  return n.SurveyType == 'TCK' && n.Id != 'TCK';
                                            });
                                scope.ticketSummaryData = temp;
                            }
                            scope.QuestionScoreData.QuestionText = "Tickets";
                            getRespondents(serviceAreaViewScoreDataCollection,selectedServiceAreaID);
                        }else{
                            scope.isSESSelected = false;
                            scope.isTCKSelected = false;
                            scope.isOSSelected = false;
                            if(!angular.isUndefined(scope.selectedAttributeScore)){
                                getSesScoreData(scope.selectedAttributeScore);
                                scope.QuestionScoreData.QuestionText = scope.selectedAttributeScore[0].QuestionText;
                            }
                            getRespondents(serviceAreaViewScoreDataCollection,selectedServiceAreaID);
                        }
                        scope.selectedAttributeQuestionId = (selectedQuestion != null && selectedQuestion.ID.indexOf('SES') < 0) ? selectedQuestion.ID : selectedServiceAreaID;
                        attributeScoreSummaryData.setSelectedServiceAreaId(selectedServiceAreaID);
                        SetFrequencyColor();

                    }
                    function getRespondents(data,id){
                        var obj = _.find(data, function (n) {
                            return n.Id == id;
                        });
                        if(id == "SES"){
                            scope.Respondents = (obj && obj.Ses) ? obj.Ses.TotalResponse : 0;
                        }else{
                            scope.Respondents = (obj && obj.NoOfRespondent) ? obj.NoOfRespondent : 0;
                        }

                       return  scope.Respondents;
                    }
                    scope.$on(Notify.DATASET_CHANGED, function () {
                        scope.close_summary();
                    });
                    scope.$on(Notify.DATA_READY, function () {
                        scope.close_summary();
                    });
                    scope.$on(Notify.DATA_FILTER_APPLIED, function () {
                        scope.close_summary();
                    });
                    scope.$on(Notify.COMPARATOR_TYPE_CHANGED, function () {
                        if(angular.isUndefined(scope.attributeData) || scope.attributeData.length <= 0)
                            return;

                        serviceAreaViewScoreDataCollection = dataFactory.PrepareAttributeSeriveAreaViewScoreData(scope.attributeData.ServiceAreaScoreDataCollection);
                        scope.fullScorecardData= dataFactory.preparedFullScorecardDataCollection(serviceAreaViewScoreDataCollection);
                        setSelectedServiceArea(attributeScoreSummaryData.getSelectedServiceAreaId());
                    });
                    scope.$on(Notify.COMPARATOR_COLOR_CHANGED, function () {
                        if(angular.isUndefined(scope.attributeData) || scope.attributeData.length <= 0)
                            return;

                        SetFrequencyColor();
                        serviceAreaViewScoreDataCollection = dataFactory.PrepareAttributeSeriveAreaViewScoreData(scope.attributeData.ServiceAreaScoreDataCollection);
                        scope.fullScorecardData= dataFactory.preparedFullScorecardDataCollection(serviceAreaViewScoreDataCollection);
                        setSelectedServiceArea(attributeScoreSummaryData.getSelectedServiceAreaId());
                    });

                   function getSesScoreData(selectedAttributeScore){
                        var ses = _.find(selectedAttributeScore,function(n){
                            return n.QuestionId.indexOf('SES') >= 0;
                        });
                        if(ses){
                            selectedAttributeScore.HasSES = true;
                            selectedAttributeScore.Ses = ses;
                        }else{
                            selectedAttributeScore.HasSES = false;
                            selectedAttributeScore.Ses = ses;
                        }
                    }

                    function SetFrequencyColor(){
                        scope.colorSet = moreSettingsFactory.GetSelectedColorSet();
                        $('.negative-label').css({"background-color":scope.colorSet.FarFromTarget});
                        $('.positive-label').css({"background-color":scope.colorSet.OnTarget});
                    }
                    function createEvaluationParameter(requestParam){
                        var selectedSurveyType = GetSelectedServiceAreaSurveyType();

                        requestParam.sessionId = dataFactory.DataInfo().sessionID;
                        requestParam.customerId = dataFactory.DataInfo().customerID;
                        requestParam.fromDate = dataFactory.DataInfo().fromDate;
                        requestParam.toDate = dataFactory.DataInfo().toDate;
                        requestParam.selectedAttributeIndex = scope.attributeIndex;
                        requestParam.cAValues = scope.attributeValue;
                        requestParam.surveyType = surveyTypeConverter(selectedSurveyType);
                        requestParam.selectedServiceAreaId = selectedServiceAreaID;

                        return requestParam;
                    }
                },
                templateUrl:'Views/Shared/Template/AttributeScoreSummaryTemplate.html'
            };

        }]);

});