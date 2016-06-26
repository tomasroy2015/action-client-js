define(['application-configuration','dataFactory'], function (app) {

    app.register.factory('attributeScoreSummaryData', ['$rootScope','dataFactory','Notify','comparatorFactory','dataService',
        function ($rootScope, dataFactory,Notify,comparatorFactory,dataService) {
            var attributeScoreSummaryData = {};
            var selectedAttributeData = {};
            var selectedServiceArea = {};
            var serviceAreaData = {};
            var evaluationsDetails = {};
            var evaluationDataCollection = [];
            var selectedServiceAreaId = "";
            var selectedViewId = "";
            return {
                getAttributeScoreSummaryData:function(attData){
                    attributeScoreSummaryData = prepareAllScoreSummaryData(attData);
                    return attributeScoreSummaryData;
                },
                getSelectedAttributeScoreSummaryData:function(attData){
                    var data = attData;
                    var  selectedAttrColl = _.filter(data, function (n) {
                        return n.Id == selectedServiceArea.Id;
                    });

                    selectedAttributeData = selectedAttrColl[0];
                    return  selectedAttributeData;
                },
                getSelectedAttributeData:function(attData){
                    selectedAttributeData = prepareSelectedAttributeData(attData);
                    return  selectedAttributeData;
                },
                getScaleFrequencyData:function (data,quesScales){
                    return prepareFrequencyData(data,quesScales);
                },
                getAttributeEvaluationDetails:function(requestParam){
                    return dataFactory.GetAttributeEvaluations(requestParam);
                },
                AttributeEvaluationData:function(data,serviceAreaId){
                    return getEvaluationViewData(data,serviceAreaId);
                },
                setSelectedServiceAreaId:function(serviceAreaId){
                    selectedServiceAreaId =  serviceAreaId;
                },
                getSelectedServiceAreaId:function(){
                    return selectedServiceAreaId;
                },
                setSelectedView:function(viewId){
                    selectedViewId = viewId;
                },
                getSelectedView:function(){
                    return selectedViewId;
                },
                getEvaluationSummaryData:function(attData,serviceData,selectedServiceAreaID){
                    return prepareEvaluationSummaryData(attData,serviceData,selectedServiceAreaID);
                }
            };
            function isRemarksLanguageSame(remarksLang){
                if(remarksLang){
                    return remarksLang.toLowerCase() == "en" && dataFactory.CustomerGeneralSettings().HasTranslation;
                }
                else
                    return false;
            }
            function getEvaluationViewData(data,serviceAreaId) {
                evaluationDataCollection = [];
                var serviceAreaQuestionCollection = dataFactory.GetServiceAreaQuestionsById(serviceAreaId);
                var evaluationData = data;
                for (var i = 0; i < evaluationData.length; i++) {
                    var selectedEvaluationData = evaluationData[i].ServiceAreaEvaluations[0];
                    if(selectedEvaluationData){
                        var evaluation = {
                            RespondentId:evaluationData[i].RespondentId,
                            AttributeValues:evaluationData[i].AttributeValues,
                            Remarks: selectedEvaluationData.Remarks,
                            RemarksAdd: selectedEvaluationData.RemarksAdd,
                            RemarksAddEng: selectedEvaluationData.RemarksAddEng,
                            RemarksEng: selectedEvaluationData.RemarksEng,
                            ServiceAreaId: selectedEvaluationData.ServiceAreaId,
                            IsRemarksLangSame: isRemarksLanguageSame(selectedEvaluationData.RemarksLang),
                            IsRemarksAddLangSame: isRemarksLanguageSame(selectedEvaluationData.RemarksAddLang),
                            Answers: [],
                            BothEvaluationData:{
                                Remarks:selectedEvaluationData.Remarks,
                                RemarksEng: selectedEvaluationData.RemarksEng,
                                RemarksAdd: selectedEvaluationData.RemarksAdd,
                                RemarksAddEng: selectedEvaluationData.RemarksAddEng,
                                IsRemarksLangSame: isRemarksLanguageSame(selectedEvaluationData.RemarksLang),
                                IsRemarksAddLangSame: isRemarksLanguageSame(selectedEvaluationData.RemarksAddLang),
                                Answers: []
                            }
                        };
                        var selectedServiceArea=dataFactory.GetServiceAreaByServiceAreaId(serviceAreaId);
                        _.forEach(selectedEvaluationData.Answers, function (item) {
                            item.QuestionText = _.find(serviceAreaQuestionCollection, function(n){
                                return n.ID == item.QuestionId;
                            }).Text;
                            item.ServiceAreaName=selectedServiceArea.Name;
                            evaluation.Answers.push(item);
                            evaluation.BothEvaluationData.Answers.push(item);
                        });
                        evaluationDataCollection.push(evaluation);
                    }
                }
                return evaluationDataCollection;
            }
            function filterEvaluationData(evaluationData,selectedServiceAreaID) {
                var result = "";
                result = _.filter(evaluationData, function (n) {
                    return (n.ServiceAreaId == selectedServiceAreaID);
                });
                return result[0];
            }
           function getScoreBarData(serviceAreaData){
//                var comparatorObj = _.extend({}, serviceAreaData, {
                var  scoreComparator = {
                        Score: serviceAreaData.Score,
                        Comparator: comparatorFactory.GetScoreItemComparator(serviceAreaData.Id),
                        ScoreColor: dataFactory.GetScoreColor(serviceAreaData.Score, comparatorFactory.GetScoreItemComparator(serviceAreaData.QuestionId))
                    };
//                });
                return scoreComparator;
            }
            function GetSelectedServiceAreaSurveyType(serviceAreaScoreDataCollection,selectedServiceAreaID) {
                return _.result(_.findWhere(serviceAreaScoreDataCollection, {'Id': selectedServiceAreaID}), 'SurveyType');
            }

            function prepareAllScoreSummaryData(attData){
                var scoreFrequency = {};
                var data = {};
                data = attData;
                selectedServiceArea = dataFactory.GetSelectedServiceArea();

                _.forEach(data,function(att1,key){
                    var sArea = _.filter(data, function (att2) {
                        return att1.Id == att2.Id;
                    });
                    serviceAreaData = sArea[0];

                    if(serviceAreaData.Id == "OS"){
                        var quesScales =[1,2,3,4,5,6,7,8,9,10];
                        serviceAreaData.osScoreComparator = getScoreBarData(serviceAreaData);
                        serviceAreaData.QuestionScoreFrequency = prepareFrequencyData(serviceAreaData.QuestionScoreFrequency,quesScales);

                        var combinedCollection = prepareOSScoreSummaryData(data);
                        serviceAreaData.QuestionScoreData = [];
                        if(combinedCollection.length > 0)
                        {
                            _.forEach(combinedCollection, function (n, key) {
                                var temp = _.assign({}, n);
                                serviceAreaData.QuestionScoreData.push(temp);
                            });
                        }
                    }
                    else if(serviceAreaData.Id == "SES" || serviceAreaData.Id == "TCK"){
                        var quesScales =[1,2,3,4,5,6];
                        serviceAreaData.osScoreComparator = getScoreBarData(serviceAreaData);
                        serviceAreaData.QuestionScoreFrequency = prepareFrequencyData(serviceAreaData.QuestionScoreFrequency,quesScales);

                        var combinedCollection = prepareOSScoreSummaryData(data);
                        serviceAreaData.QuestionScoreData = [];
                        if(combinedCollection.length > 0)
                        {
                            _.forEach(combinedCollection, function (n, key) {
                                var temp = _.assign({}, n);
                                serviceAreaData.QuestionScoreData.push(temp);
                            });
                        }
                    }
                    else{
                        var index = 0,type = 0;
                        var sesScore = null;
                        var combinedCollection = prepareScoreSummaryData(data,serviceAreaData);
                        serviceAreaData.QuestionScoreData = [];
                        serviceAreaData.HasSES = false;
                        if(combinedCollection.length > 0)
                        {
                            _.forEach(combinedCollection, function (n, key) {
//                                if(n.QuestionId.toUpperCase().indexOf('SES') >=0){
//                                    sesScore = _.assign({}, n);
//                                    serviceAreaData.HasSES = true;
//                                }else{
                                    var temp= _.assign({}, n);
                                    serviceAreaData.QuestionScoreData.push(temp);
//                                }
                            });

                            if(serviceAreaData.Ses != null){
                                serviceAreaData.QuestionScoreData.push(serviceAreaData.Ses);
                                serviceAreaData.HasSES = true;
                                serviceAreaData.SESScore = serviceAreaData.Ses;
                            }
                        }

                        _.forEach(serviceAreaData.QuestionScoreData, function (n1, key) {

                            scoreFrequency = _.filter(serviceAreaData.QuestionScoreFrequency, function (n2) {
                                return n1.QuestionId == n2.QuestionId && n2.AnswerType > -1;
                            });

                           if(n1.QuestionType == 'regular'){
                               var quesScales =[1,2,3,4,5,6];
                               var frequencyData = prepareQuesFrequencyData(scoreFrequency,quesScales,n1.QuestionId);
                               serviceAreaData = getScoreFrequencyData(serviceAreaData,index,frequencyData);
                           }
                           index++;
                        });
                    }
                });
                return data;
            }

            function prepareEvaluationSummaryData(attScoreData,selectedAttScoreData,selectedServiceAreaID){
                var scoreFrequency = {};
                var index = 0;
                var data = {};
                data = attScoreData;
                selectedServiceArea = selectedAttScoreData;

                var sArea = _.find(data, function (att2) {
                    return selectedServiceAreaID == att2.Id;
                });

                _.forEach(selectedServiceArea,function(att1,key){
                    serviceAreaData = att1;

                    if(serviceAreaData.QuestionId == "OS"){
                        var quesScales =[1,2,3,4,5,6,7,8,9,10];
                        serviceAreaData.osScoreComparator = getScoreBarData(serviceAreaData);
                        serviceAreaData.QuestionScoreFrequency = prepareFrequencyData(angular.isUndefined(sArea) ? scoreFrequency: sArea.QuestionScoreFrequency,quesScales);
                    }
                    else if(serviceAreaData.QuestionId == "SES" || serviceAreaData.QuestionId == "TCK"){
                        var quesScales =[1,2,3,4,5,6];
                        serviceAreaData.osScoreComparator = getScoreBarData(serviceAreaData);
                        serviceAreaData.QuestionScoreFrequency = prepareFrequencyData(angular.isUndefined(sArea) ? scoreFrequency: sArea.QuestionScoreFrequency,quesScales);
                    }
                    else{
                            if(angular.isUndefined(sArea)){
                                scoreFrequency = {};
                            }else {
                                scoreFrequency = _.filter(sArea.QuestionScoreFrequency, function (n2) {
                                    return serviceAreaData.QuestionId == n2.QuestionId && n2.AnswerType > -1;
                                });
                            }

                            var quesScales =[1,2,3,4,5,6];
                            var frequencyData = prepareQuesFrequencyData(scoreFrequency,quesScales,serviceAreaData.QuestionId);
                            serviceAreaData = getScoreFrequencyData(serviceAreaData,index,frequencyData);
                    }
                    index++;
                });
                return selectedServiceArea;
            }

            function prepareOSScoreSummaryData(data) {
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
                    combinedQuestionList[indexCount++] = {
                        QuestionId: generalScoreDataCollection[0].Id,
                        QuestionText: generalScoreDataCollection[0].Name,
                        Score: generalScoreDataCollection[0].Score,
                        ScoreText:generalScoreDataCollection[0].Score,
                        TotalResponse: generalScoreDataCollection[0].TotalResponse,
                        PositiveResponse: generalScoreDataCollection[0].PositiveResponse,
                        NegativeResponse: generalScoreDataCollection[0].NegativeResponse,
                        Comparator:comparatorFactory.GetScoreItemComparator(generalScoreDataCollection[0].Id),
                        ScoreColor: dataFactory.GetScoreColor(generalScoreDataCollection[0].Score, comparatorFactory.GetScoreItemComparator(generalScoreDataCollection[0].Id)),
                        DoubleTargetComparator: generalScoreDataCollection[0].DoubleTargetComparator,
                        IncludeInGroupScore: false,
                        SurveyType:generalScoreDataCollection[0].SurveyType,
                        QuestionType: 'group'
                    };

                    _.forEach(generalScoreDataCollection[0].QuestionScores, function (n, key) {
                        var temp = {QuestionId: n.QuestionId,
                                    QuestionText: n.QuestionText,
                                    Score: n.Score,
                                    TotalResponse: n.TotalResponse,
                                    PositiveResponse: n.PositiveResponse,
                                    NegativeResponse: n.NegativeResponse,
                                    Comparator: comparatorFactory.GetScoreItemComparator(n.QuestionId),
                                    ScoreColor: dataFactory.GetScoreColor(n.Score, comparatorFactory.GetScoreItemComparator(n.QuestionId)),
                                    SurveyType: "GEN",
                                    QuestionType: 'regular'};
                        combinedQuestionList.push(temp);
                        indexCount++;
                    });
                }
                if (ticketScoreDataCollection.length > 0) {
                    combinedQuestionList[indexCount++] = {
                        QuestionId: ticketScoreDataCollection[0].Id,
                        QuestionText: ticketScoreDataCollection[0].Name,
                        Score: ticketScoreDataCollection[0].Score,
                        ScoreText:ticketScoreDataCollection[0].Score+"%",
                        TotalResponse: ticketScoreDataCollection[0].TotalResponse,
                        PositiveResponse: ticketScoreDataCollection[0].PositiveResponse,
                        NegativeResponse: ticketScoreDataCollection[0].NegativeResponse,
                        Comparator: comparatorFactory.GetScoreItemComparator(ticketScoreDataCollection[0].Id),
                        ScoreColor: dataFactory.GetScoreColor(ticketScoreDataCollection[0].Score, comparatorFactory.GetScoreItemComparator(ticketScoreDataCollection[0].Id)),
                        DoubleTargetComparator: ticketScoreDataCollection[0].DoubleTargetComparator,
                        IncludeInGroupScore: false,
                        SurveyType:ticketScoreDataCollection[0].SurveyType,
                        QuestionType: 'group'
                    };

                    var triggerDataCollection = _.filter(serviceAreaScoreDataCollection, function (n) {
                        return n.SurveyType === "TCK" && (n.Id !== "SES" &&  n.Id !== "TCK");
                    });

                    _.forEach(triggerDataCollection, function (n, key) {
                        var temp = {
                            QuestionId: n.Id,
                            QuestionText: n.Name,
                            Score: n.Score,
                            ScoreText:n.Score+"%",
                            TotalResponse: n.TotalResponse,
                            PositiveResponse: n.PositiveResponse,
                            NegativeResponse: n.NegativeResponse,
                            Comparator: comparatorFactory.GetScoreItemComparator(n.Id),
                            ScoreColor: dataFactory.GetScoreColor(n.Score, comparatorFactory.GetScoreItemComparator(n.Id)),
                            DoubleTargetComparator: n.DoubleTargetComparator,
                            SurveyType:n.SurveyType,
                            QuestionType: 'regular'};

                        combinedQuestionList.push(temp);
                        indexCount++;
                    });
                }

                return combinedQuestionList;
            }
            function prepareScoreSummaryData(data, item) {
                var serviceAreaScoreDataCollection = data;
                var combinedQuestionList = [];

                var scoreDataCollection = _.filter(serviceAreaScoreDataCollection, function (n) {
                    return n.Id == item.Id;
                });

                if (scoreDataCollection.length > 0) {
                    if(scoreDataCollection[0].Ses) {
                        scoreDataCollection[0].Ses.Comparator = comparatorFactory.GetScoreItemComparator(scoreDataCollection[0].Id);
                        scoreDataCollection[0].Ses.ScoreColor = dataFactory.GetScoreColor(scoreDataCollection[0].Score, comparatorFactory.GetScoreItemComparator(scoreDataCollection[0].Id));
                        scoreDataCollection[0].Ses.SurveyType = scoreDataCollection[0].SurveyType;
                        scoreDataCollection[0].Ses.QuestionType = 'regular';
                    }

                    combinedQuestionList[0] = _.assign({}, {
                        QuestionId: scoreDataCollection[0].Id,
                        QuestionText: scoreDataCollection[0].Name,
                        Score: scoreDataCollection[0].Score,
                        ScoreText: scoreDataCollection[0].Score + "%",
                        TotalResponse: scoreDataCollection[0].TotalResponse,
                        PositiveResponse: scoreDataCollection[0].PositiveResponse,
                        NegativeResponse: scoreDataCollection[0].NegativeResponse,
                        Comparator: comparatorFactory.GetScoreItemComparator(scoreDataCollection[0].Id),
                        ScoreColor: dataFactory.GetScoreColor(scoreDataCollection[0].Score, comparatorFactory.GetScoreItemComparator(scoreDataCollection[0].Id)),
                        DoubleTargetComparator: scoreDataCollection[0].DoubleTargetComparator,
                        IncludeInGroupScore: false,
                        SurveyType: scoreDataCollection[0].SurveyType,
                        QuestionType: 'group'
                    });
                }

                _.forEach(scoreDataCollection[0].QuestionScores, function (n, key) {
                    var temp ={ QuestionId: n.QuestionId,
                                QuestionText: n.QuestionText,
                                Score: n.Score,
                                TotalResponse: n.TotalResponse,
                                PositiveResponse: n.PositiveResponse,
                                NegativeResponse: n.NegativeResponse,
                                Comparator: comparatorFactory.GetScoreItemComparator(n.QuestionId),
                                ScoreColor: dataFactory.GetScoreColor(n.Score, comparatorFactory.GetScoreItemComparator(n.QuestionId)),
                                SurveyType: scoreDataCollection[0].SurveyType,
                                QuestionType: 'regular'};
                    combinedQuestionList.push(temp);
                });

                return combinedQuestionList;
            }

            function prepareFrequencyData (frequencyData,quesScales) {
                var index =1;
                var QuestionScoreFrequency = [];
                _.forEach (quesScales,function (s,key) {
                    var frequency = {AnswerType:index, Frequency: 0,QuestionId:"general_OS"};

                    _.forEach(frequencyData, function (q,key) {
                        if(s == q.AnswerType){
                            frequency = q;
                        }
                    });
                    if (!angular.isUndefined(frequency)) {
                        QuestionScoreFrequency.push(frequency);
                    }
                    index++;
                });
                return QuestionScoreFrequency;
            }
            function prepareQuesFrequencyData (frequencyData,quesScales,questionId) {
                var index =1;
                var QuestionScoreFrequency = [];
                _.forEach (quesScales,function (s,key) {
                    var frequency = {AnswerType:index, Frequency: 0,QuestionId:questionId};

                    _.forEach(frequencyData, function (q,key) {
                        if(s == q.AnswerType){
                            frequency = q;
                        }
                    });
                    if (!angular.isUndefined(frequency)) {
                        QuestionScoreFrequency.push(frequency);
                    }
                    index++;
                });
                return QuestionScoreFrequency;
            }
            function getScoreFrequencyData(serviceAreaData,index,frequencyData){
                _.forEach(frequencyData,function(f){
                    switch(f.AnswerType){
                        case 1:
                            serviceAreaData.frequency1 = f;
                            break;
                        case 2:
                            serviceAreaData.frequency2 = f;
                            break;
                        case 3:
                            serviceAreaData.frequency3 = f;
                            break;
                        case 4:
                            serviceAreaData.frequency4 = f;
                            break;
                        case 5:
                            serviceAreaData.frequency5 = f;
                            break;
                        case 6:
                            serviceAreaData.frequency6 = f;
                            break;
                    }

                });
                return serviceAreaData;
            }

        }]);
});
