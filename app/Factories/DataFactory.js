define(['application-configuration', 'dataService', 'lodash', 'moreSettingsFactory', 'CreateViewDataFactory'], function (app) {

    app.register.factory('dataFactory', ['$rootScope', '$http', 'dataService', 'Notify', 'ComparatorType', 'moreSettingsFactory', 'CreateViewDataFactory',
        function ($rootScope, $http, dataService, Notify, ComparatorType, moreSettingsFactory, CreateViewDataFactory) {

            var dataset = null,
                isDatasetLoaded = false,
                dataInfo = {},
                datasetInfo = {},
                serviceAreaCollection = null,
                customAttributeCollection = null,
                serviceAreaScoreDataCollection = null,
                selectedServiceArea = null,
                selectedQuestion = null,
                attributeScoreDataCollection = [],
                attributeScoreDataCollectionWithFilter = [],
                selectedServiceAreaAttributeCountCollection = [],
                evaluationDataCollection = [],
                colorSettings = null,
                customerGeneralSettings = null,
                selectedAttributeIndex = 1,
                comparatorCollection = null,
                countryScoreDataCollection = null,
                selectedServiceAreaAttributeCounte = null,
                selectedComparatorType = ComparatorType.Target,
                customComparatorValue = 0,
                attributeEvaluations = null,
                selectedSurveyType = "",
                scoreComparatorThreshold = 5,
                isDoubleTargetEnabled = false,
                osScoreComparatorThreshold = 0.25;
            var serviceAreaViewScoreDataCollection = null,
                gFilter = null,
                tFilter = null,
                newGroupItem = null,
                delGroupItem = null;
            var isResetFilterOrView = false;
            var topLevelFilterCollection = [];
            var listViewSelectedAttribute = {
                Index: 0,
                Type: 1
            };

            var onGetAllData = function (response) {
                intializeData();
                isDatasetLoaded = true;
                serviceAreaCollection = response.ServiceAreaCollection;
                //selectedServiceArea = serviceAreaCollection[1];
                setDefaultServiceArea();
                customAttributeCollection = response.CustomAttributeCollection;
                serviceAreaScoreDataCollection = response.ServiceAreaScoreDataCollection;
                colorSettings = response.Settings.ColorSettings;
                customerGeneralSettings = response.Settings.CustomerGeneralSettings;
                countryScoreDataCollection = response.CountryScoreDataCollection;
                comparatorCollection = response.ComparatorCollection;

                setListViewDefaultAttribute();
                //Update color
                moreSettingsFactory.SetColorSet(colorSettings[0].OnTarget, colorSettings[0].CloseToTarget, colorSettings[0].FarFromTarget);

                serviceAreaViewScoreDataCollection = prepareServiceAreaViewScoreDataCollection(serviceAreaScoreDataCollection);

                $rootScope.$broadcast(Notify.DATA_READY);
                //For Reset
                ResetDataFilter();
            };

            var onApplyDataFilter = function (response) {
                serviceAreaScoreDataCollection = null;
                countryScoreDataCollection = null;
                serviceAreaViewScoreDataCollection = null;
                //attributeScoreDataCollection = []; //Commented by shahin
                attributeScoreDataCollectionWithFilter = [];
                evaluationDataCollection = [];
                selectedServiceAreaAttributeCountCollection = [];
                serviceAreaScoreDataCollection = response.ServiceAreaScoreDataCollection;
                countryScoreDataCollection = response.CountryScoreDataCollection;

                serviceAreaViewScoreDataCollection = prepareServiceAreaViewScoreDataCollection(serviceAreaScoreDataCollection);
                $rootScope.$broadcast(Notify.DATA_FILTER_APPLIED);
            };
            var onCreateDimensionValueGroup = function (respose) {
                if (newGroupItem && attributeScoreDataCollection) {

                    var currentSelectAttibuteScoreDataCollection = _.find(attributeScoreDataCollection, {AttributeIndex: newGroupItem.AttributeIndex});
                    if (!currentSelectAttibuteScoreDataCollection) return;

                    //Logic for add item in existing group [July26-2015]
                    if (newGroupItem.IsAddInExistingGroup === true) {
                        var delFoundItem = _.find(currentSelectAttibuteScoreDataCollection.ScoreDataCollection, {Name: newGroupItem.Name});

                        if (delFoundItem) {
                            _.forEach(delFoundItem.GroupItemsScoreDataCollection, function (item) {
                                currentSelectAttibuteScoreDataCollection.ScoreDataCollection.push(item);
                            });
                            var delGIndex = _.indexOf(currentSelectAttibuteScoreDataCollection.ScoreDataCollection, delFoundItem);
                            if (delGIndex >= 0) {
                                currentSelectAttibuteScoreDataCollection.ScoreDataCollection.splice(delGIndex, 1);
                            }
                        }

                        var _Ids = _.pluck(newGroupItem.ExistingGroupItems, 'Id');
                        newGroupItem.Ids = newGroupItem.Ids.concat(_Ids);
                    }
                    //End

                    var groupAttrItems = [];
                    _.forEach(newGroupItem.Ids, function (id) {
                        var foundItem = _.find(currentSelectAttibuteScoreDataCollection.ScoreDataCollection, {Id: id});
                        if (foundItem) {
                            groupAttrItems.push(foundItem);
                            var index = _.indexOf(currentSelectAttibuteScoreDataCollection.ScoreDataCollection, foundItem);
                            if (index >= 0) {
                                currentSelectAttibuteScoreDataCollection.ScoreDataCollection.splice(index, 1);
                            }
                        }
                    });
                    if (groupAttrItems.length > 0) {
                        var tmpServiceAreaScoreDataCollection = _.pluck(groupAttrItems, 'ServiceAreaScoreDataCollection');
                        var tmpConcatedServiceAreaScoreDataCollection = [];

                        _.reduce(tmpServiceAreaScoreDataCollection, function (result, item) {
                            if (_.isArray(item)) {
                                _.forEach(item, function (gi) {
                                    result.push(gi);
                                });
                            } else {
                                result.push(item);
                            }
                            return result;
                        }, tmpConcatedServiceAreaScoreDataCollection);

                        //console.log(tmpConcatedServiceAreaScoreDataCollection);

                        var tmpGroupServiceAreaScoreDataCollection = _.groupBy(tmpConcatedServiceAreaScoreDataCollection, function (item) {
                            return item.Id;
                        });

                        var tmpReducedGroupServiceAreaScoreDataCollection = _.map(tmpGroupServiceAreaScoreDataCollection, function (g, key) {
                            return {
                                Id: key,
                                Name: g[0].Name,
                                ShortCode: g[0].ShortCode,
                                SurveyType: g[0].SurveyType,
                                SortOrder: g[0].SortOrder,
                                Respondent: _.reduce(g, function (m, x) {
                                    return m + x.Respondent;
                                }, 0),
                                TotalResponse: _.reduce(g, function (m, x) {
                                    return m + x.TotalResponse;
                                }, 0),
                                PositiveResponse: _.reduce(g, function (m, x) {
                                    return m + x.PositiveResponse;
                                }, 0),
                                NegativeResponse: _.reduce(g, function (m, x) {
                                    return m + x.NegativeResponse;
                                }, 0),
                                Score: 0,
                                Comparator: g[0].Comparator,
                                DoubleTargetComparator: g[0].DoubleTargetComparator
                            };
                        });

                        _.map(tmpReducedGroupServiceAreaScoreDataCollection, function (item) {
                            item.Score = Math.round((item.PositiveResponse / item.TotalResponse) * 100);
                        });

                        //console.log(tmpReducedGroupServiceAreaScoreDataCollection);

                        var preparedGroupItem = {
                            IsGroup: true,
                            Id: newGroupItem.Ids.join(','),
                            Name: newGroupItem.Name,
                            GroupItemsScoreDataCollection: groupAttrItems,
                            ServiceAreaScoreDataCollection: tmpReducedGroupServiceAreaScoreDataCollection
                        };

                        currentSelectAttibuteScoreDataCollection.ScoreDataCollection.push(preparedGroupItem);
                        //console.log(attributeScoreDataCollection);
                        //newGroupItem = null;//sep20-2015
                        attributeScoreDataCollectionWithFilter.length = 0;
                        $rootScope.$broadcast(Notify.DATAFILTER_GROUP_CREATED);

                    }//
                }//
            };

            var onDeleteDimensionValueGroup = function (respose) {
                if (delGroupItem && attributeScoreDataCollection) {
                    var delFoundItem = null;
                    var currentSelectAttibuteScoreDataCollection = _.find(attributeScoreDataCollection, {AttributeIndex: delGroupItem.AttributeIndex});
                    if (!currentSelectAttibuteScoreDataCollection) return;

                    delFoundItem = _.find(currentSelectAttibuteScoreDataCollection.ScoreDataCollection, {Name: delGroupItem.Name});

                    if (delGroupItem.IsGroupDelete === true) {
                        if (delFoundItem) {
                            _.forEach(delFoundItem.GroupItemsScoreDataCollection, function (item) {
                                currentSelectAttibuteScoreDataCollection.ScoreDataCollection.push(item);
                            });
                            var delGIndex = _.indexOf(currentSelectAttibuteScoreDataCollection.ScoreDataCollection, delFoundItem);
                            if (delGIndex >= 0) {
                                currentSelectAttibuteScoreDataCollection.ScoreDataCollection.splice(delGIndex, 1);
                            }
                        }
                    } else {
                        var groupAttrItems = [];
                        var newGroupId = [];

                        _.forEach(delFoundItem.GroupItemsScoreDataCollection, function (item) {
                            if (item.Id === delGroupItem.Ids[0]) {
                                currentSelectAttibuteScoreDataCollection.ScoreDataCollection.push(item);
                            } else {
                                newGroupId.push(item.Id);
                                groupAttrItems.push(item);
                            }
                        });
                        //console.log(groupAttrItems);

                        if (delFoundItem) {
                            var index = _.indexOf(currentSelectAttibuteScoreDataCollection.ScoreDataCollection, delFoundItem);
                            if (index >= 0) {
                                currentSelectAttibuteScoreDataCollection.ScoreDataCollection.splice(index, 1);
                            }
                        }

                        //New Group Prepare
                        if (groupAttrItems.length > 0) {
                            var tmpServiceAreaScoreDataCollection = _.pluck(groupAttrItems, 'ServiceAreaScoreDataCollection');
                            var tmpConcatedServiceAreaScoreDataCollection = [];

                            _.reduce(tmpServiceAreaScoreDataCollection, function (result, item) {
                                if (_.isArray(item)) {
                                    _.forEach(item, function (gi) {
                                        result.push(gi);
                                    });
                                } else {
                                    result.push(item);
                                }
                                return result;
                            }, tmpConcatedServiceAreaScoreDataCollection);

                            //console.log(tmpConcatedServiceAreaScoreDataCollection);

                            var tmpGroupServiceAreaScoreDataCollection = _.groupBy(tmpConcatedServiceAreaScoreDataCollection, function (item) {
                                return item.Id;
                            });

                            var tmpReducedGroupServiceAreaScoreDataCollection = _.map(tmpGroupServiceAreaScoreDataCollection, function (g, key) {
                                return {
                                    Id: key,
                                    Name: g[0].Name,
                                    ShortCode: g[0].ShortCode,
                                    SurveyType: g[0].SurveyType,
                                    SortOrder: g[0].SortOrder,
                                    Respondent: _.reduce(g, function (m, x) {
                                        return m + x.Respondent;
                                    }, 0),
                                    TotalResponse: _.reduce(g, function (m, x) {
                                        return m + x.TotalResponse;
                                    }, 0),
                                    PositiveResponse: _.reduce(g, function (m, x) {
                                        return m + x.PositiveResponse;
                                    }, 0),
                                    NegativeResponse: _.reduce(g, function (m, x) {
                                        return m + x.NegativeResponse;
                                    }, 0),
                                    Score: 0,
                                    Comparator: g[0].Comparator,
                                    DoubleTargetComparator: g[0].DoubleTargetComparator
                                };
                            });

                            _.map(tmpReducedGroupServiceAreaScoreDataCollection, function (item) {
                                item.Score = Math.round((item.PositiveResponse / item.TotalResponse) * 100);
                            });

                            //console.log(tmpReducedGroupServiceAreaScoreDataCollection);

                            var preparedGroupItem = {
                                IsGroup: true,
                                Id: newGroupId.join(','),
                                Name: delFoundItem.Name,
                                GroupItemsScoreDataCollection: groupAttrItems,
                                ServiceAreaScoreDataCollection: tmpReducedGroupServiceAreaScoreDataCollection
                            };

                            currentSelectAttibuteScoreDataCollection.ScoreDataCollection.push(preparedGroupItem);
                        }//
                    }

                    delGroupItem = null;
                    attributeScoreDataCollectionWithFilter.length = 0;
                    $rootScope.$broadcast(Notify.DATAFILTER_GROUP_CREATED);
                }
            };

            function setListViewDefaultAttribute() {
                var selectedAttribute = _.filter(customAttributeCollection, function (n) {
                    return n.Index == customerGeneralSettings.DefaultListViewAttributeIndex;
                });
                if (selectedAttribute && selectedAttribute.length > 0) {
                    listViewSelectedAttribute.Index = selectedAttribute[0].Index;
                    listViewSelectedAttribute.Type = selectedAttribute[0].Type;
                }
            }

            function setDefaultServiceArea() {
                var generalOs = _.filter(serviceAreaCollection, function (n) {
                    return n.Id == "OS";
                });
                if (generalOs && generalOs.length > 0) {
                    selectedServiceArea = generalOs[0];
                }
                else {
                    var tickets = _.filter(serviceAreaCollection, function (n) {
                        return n.Id == "TCK" || n.Id == "SES";
                    });
                    if (tickets && tickets.length > 0)
                        selectedServiceArea = tickets[0];
                }
                selectedQuestion = null; //deselecting question
            }

            var onGetChangedDataSet = function (response) {
                intializeData();
                serviceAreaCollection = response.ServiceAreaCollection;
                //selectedServiceArea = serviceAreaCollection[1];
                //if(isResetFilterOrView)
                setDefaultServiceArea();
                customAttributeCollection = response.CustomAttributeCollection;
                serviceAreaScoreDataCollection = response.ServiceAreaScoreDataCollection;
                colorSettings = response.Settings.ColorSettings;
                customerGeneralSettings = response.Settings.CustomerGeneralSettings;
                countryScoreDataCollection = response.CountryScoreDataCollection;
                comparatorCollection = response.ComparatorCollection;
//                if(isResetFilterOrView)
//                    setListViewDefaultAttribute();
                //Updating color set
//                if(isResetFilterOrView)
//                    moreSettingsFactory.SetColorSet(colorSettings[0].OnTarget, colorSettings[0].CloseToTarget, colorSettings[0].FarFromTarget);

                serviceAreaViewScoreDataCollection = prepareServiceAreaViewScoreDataCollection(serviceAreaScoreDataCollection);
                $rootScope.$broadcast(Notify.DATASET_CHANGED);

                //For Reset
                if(isResetFilterOrView) {
                    setListViewDefaultAttribute();
                    moreSettingsFactory.SetColorSet(colorSettings[0].OnTarget, colorSettings[0].CloseToTarget, colorSettings[0].FarFromTarget);
                    ResetDataFilter();
                }

            };
            function ResetDataFilter(){
                gFilter = null;
                tFilter = null;
                dataInfo.gFilter = gFilter;
                dataInfo.tFilter = tFilter;
                $rootScope.$broadcast(Notify.DATA_FILTER_RESET);
            }

            function intializeData() {
                isDatasetLoaded = true;
                attributeScoreDataCollection.length = 0;//Reseting the array collection items
                evaluationDataCollection.length = 0;
                selectedServiceAreaAttributeCountCollection = null;
                serviceAreaCollection = null;
                customAttributeCollection = null;
                serviceAreaScoreDataCollection = null;
                colorSettings = null;
                customerGeneralSettings = null;
                countryScoreDataCollection = null;
                comparatorCollection = null;
                serviceAreaViewScoreDataCollection = null;
                attributeScoreDataCollectionWithFilter.length = 0;
            }

            var errorFunction = function (response) {
                var message="";
                //Error handling goes here.
                //window.alert(response.Message);
                if(response.Message.toLowerCase().trim() == "session expired"){
                    message = "Your login session expired,please login again.";
                    window.alert(message);

                    if($rootScope.IsLoginFromPentaho)
                        window.location = "/pentaho/";
                    else
                        window.location = "#/";
                }else{
                    message = "Error in loading dataset!";
                    window.alert(message);
                }
                $rootScope.isNeedToShowLoading = false;
                //window.location = "#/Main";
            };


            var onGetSelectedAttributeScoreData = function (response) {
                var query = _.filter(attributeScoreDataCollection, function (n) {
                    return n.AttributeIndex == selectedAttributeIndex;
                });
                if (query && query.length > 0) {
                    query[0].ScoreDataCollection = response;
                }
                else {
                    var attScoreData = CreateViewDataFactory.AttributeScoreData();
                    attScoreData.AttributeIndex = selectedAttributeIndex;
                    attScoreData.ScoreDataCollection = response;

                    attributeScoreDataCollection.push(attScoreData);
                }

                $rootScope.$broadcast(Notify.ATTRIBUTE_DATA_READY);
            };
            var finalizeAttributeScoreDataCollection = function(attScoreData){
                _.forEach(attScoreData, function(n){
                   var os = _.find(n.ServiceAreaScoreDataCollection, function(p){
                      return p.Id === "OS";
                   });
                    if(os){
                        var genSA = _.filter(serviceAreaCollection, function(r){
                           return r.SurveyType === "GEN";
                        });
                        _.forEach(genSA, function(s){
                           var saInOs = _.find(os.QuestionScores, function(q){
                              return q.QuestionId == s.Id;
                           });
                            if(!saInOs){
                                var questionScore = CreateViewDataFactory.QuestionScoreModel();
                                questionScore.QuestionId = s.Id;
                                questionScore.QuestionText = s.Name;
                                questionScore.Score = NaN;
                                questionScore.TotalResponse = 0;
                                questionScore.Comparator = 0;
                                os.QuestionScores.push(questionScore);
                            };
                        });
                    }
                    //else{
                    //    var os = _.find(serviceAreaCollection, function(r){
                    //        return r.Id === "OS";
                    //    });
                    //    var genSA = _.filter(serviceAreaCollection, function(r){
                    //        return r.SurveyType === "GEN";
                    //    });
                    //    if(os){
                    //      var serviceAreaScore = CreateViewDataFactory.ServiceAreaScoreModel();
                    //        serviceAreaScore.Id = os.Id;
                    //        serviceAreaScore.Name = os.Name;
                    //        serviceAreaScore.ShortCode = os.ShortCode;
                    //        _.forEach(genSA, function(s){
                    //            var questionScore = CreateViewDataFactory.QuestionScoreModel();
                    //            questionScore.QuestionId = s.Id;
                    //            questionScore.QuestionText = s.Name;
                    //            questionScore.Score = NaN;
                    //            questionScore.TotalResponse = 0;
                    //            questionScore.Comparator = 0;
                    //            serviceAreaScore.QuestionScores.push(questionScore);
                    //        });
                    //    };
                    //    n.ServiceAreaScoreDataCollection.push(serviceAreaScore);
                    //}
                    var tck = _.find(n.ServiceAreaScoreDataCollection, function(p){
                        return p.Id === "TCK" || p.Id === "SES";
                    });
                    if(tck){
                        var tckInSAColl = _.find(serviceAreaCollection, function(r){
                            return r.Id === "TCK" || r.Id === "SES";
                        });
                        _.forEach(tckInSAColl.Questions, function(s){
                            var saInTck = _.find(tck.QuestionScores, function(q){
                                return q.QuestionId == s.ID;
                            });
                            if(!saInTck){
                                var questionScore = CreateViewDataFactory.QuestionScoreModel();
                                questionScore.QuestionId = s.ID;
                                questionScore.QuestionText = s.Text;
                                questionScore.Score = NaN;
                                questionScore.TotalResponse = 0;
                                questionScore.Comparator = 0;
                                tck.QuestionScores.push(questionScore);
                            };
                        });
                    }
                });
            }

            var onGetSelectedAttributeScoreDataWithFilter = function (response) {
                finalizeAttributeScoreDataCollection(response);
                var query = _.filter(attributeScoreDataCollectionWithFilter, function (n) {
                    return n.AttributeIndex == selectedAttributeIndex;
                });
                if (query && query.length > 0) {
                    query[0].ScoreDataCollection = response;
                }
                else {
                    var attScoreData = CreateViewDataFactory.AttributeScoreData();
                    attScoreData.AttributeIndex = selectedAttributeIndex;
                    attScoreData.ScoreDataCollection = response;

                    attributeScoreDataCollectionWithFilter.push(attScoreData);
                }

                $rootScope.$broadcast(Notify.ATTRIBUTE_WITH_FILTER_DATA_READY);
            };
            var onGetEvaluations = function (response) {
                var evaluationData = CreateViewDataFactory.EvaluationData()
                evaluationData.ServiceAreaId = selectedServiceArea.Id;
                evaluationData.EvaluationCollection = response;
                evaluationDataCollection.push(evaluationData);
                $rootScope.$broadcast(Notify.EVALUATION_DATA_READY);
            };
            var onGetSelectedServiceAreaAttributeCount = function (response) {
                selectedServiceAreaAttributeCountCollection = response;
                $rootScope.$broadcast(Notify.SERVICE_AREA_ATTRIBUTE_COUNT_DATA_READY, response);
            };

            function prepareServiceAreaViewScoreDataCollection(scoreDataCollection) {
                var serviceAreaViewScoreDataCollection = [];
                _.forEach(serviceAreaCollection, function (n) {
                    if (n.SurveyType && n.SurveyType !== "") {
                        var oServiceAreaViewData = CreateViewDataFactory.ServiceAreaViewData();
                        oServiceAreaViewData.Id = n.Id;
                        oServiceAreaViewData.Name = n.Name;
                        oServiceAreaViewData.SurveyType = n.SurveyType;
                        oServiceAreaViewData.SortOrder = n.SortOrder;
                        var scoreData = _.find(scoreDataCollection, function (sItem) {
                            return sItem.Id == oServiceAreaViewData.Id;
                        });
                        if (scoreData) {
                            oServiceAreaViewData.Score = scoreData.Score;
                            oServiceAreaViewData.Comparator = isDoubleTargetEnabled ? getTarget(oServiceAreaViewData.Id) : getScoreItemComparator(oServiceAreaViewData.Id);
                            oServiceAreaViewData.DoubleTarget = isDoubleTargetEnabled ? getScoreItemComparator(oServiceAreaViewData.Id) : NaN;
                            oServiceAreaViewData.ScoreColor = getScoreColor(oServiceAreaViewData.Score, oServiceAreaViewData.Comparator, oServiceAreaViewData.Id === 'OS');
                            oServiceAreaViewData.NoOfRespondent = scoreData.Respondent;
                            oServiceAreaViewData.PositiveResponse = scoreData.PositiveResponse;
                            oServiceAreaViewData.NegativeResponse = scoreData.NegativeResponse;
                            if (oServiceAreaViewData.Id !== "OS" && oServiceAreaViewData.Id !== "TCK" && oServiceAreaViewData.Id !== "SES")
                                oServiceAreaViewData.Items = prepareCollectionObject(scoreData);
                        }
                        else {
                            oServiceAreaViewData.Score = NaN;
                            oServiceAreaViewData.Comparator = isDoubleTargetEnabled ? getTarget(oServiceAreaViewData.Id) : getScoreItemComparator(oServiceAreaViewData.Id);
                            oServiceAreaViewData.DoubleTarget = isDoubleTargetEnabled ? getScoreItemComparator(oServiceAreaViewData.Id) : NaN;
                            oServiceAreaViewData.ScoreColor = getScoreColor(oServiceAreaViewData.Score, oServiceAreaViewData.Comparator);
                            oServiceAreaViewData.NoOfRespondent = 0;
                            if (oServiceAreaViewData.Id !== "OS" && oServiceAreaViewData.Id !== "TCK" && oServiceAreaViewData.Id !== "SES") {
                                oServiceAreaViewData.Items = [];
                                var questionScoreViewData = CreateViewDataFactory.QuestionScoreViewData();
                                questionScoreViewData.QuestionId = oServiceAreaViewData.Id;
                                questionScoreViewData.QuestionText = oServiceAreaViewData.Name;
                                questionScoreViewData.NoOfRespondent = 0;
                                questionScoreViewData.Score = NaN;
                                questionScoreViewData.Comparator = getScoreItemComparator(oServiceAreaViewData.Id);
                                questionScoreViewData.ScoreColor = getScoreColor(questionScoreViewData.Score, questionScoreViewData.Comparator);
                                questionScoreViewData.IsGroup = true;
                                oServiceAreaViewData.Items.push(questionScoreViewData);
                                _.forEach(n.Questions, function (q) {
                                    if(q.ID.indexOf("RM") == -1)
                                        oServiceAreaViewData.Items.push(prepareEmptyServiceAreaScoreData(q));
                                });
                            }

                        }
                        serviceAreaViewScoreDataCollection.push(oServiceAreaViewData);
                    }

                });
                return serviceAreaViewScoreDataCollection;
            }

            function prepareFullScoreCardData(serviceAreaViewScoreDataCollection) {
                var fullScoreCardData = {};
                fullScoreCardData.generalSurveyData = {};
                fullScoreCardData.triggerSurveyData = {};
                fullScoreCardData.generalSurveyHeaderData = {};
                fullScoreCardData.triggerSurveyHeaderData = {};


                var generalSurveyCollection = _.filter(serviceAreaViewScoreDataCollection, function (n) {
                    return n.SurveyType === "GEN";
                });

                var triggerSurveyCollection = _.filter(serviceAreaViewScoreDataCollection, function (n) {
                    return n.SurveyType === "TCK" && n.Id !== 'SES' && n.Id !== 'TCK';
                });


                if (generalSurveyCollection && generalSurveyCollection.length > 0) {
                    fullScoreCardData.generalSurveyData = generalSurveyCollection;
                    fullScoreCardData.generalSurveyHeaderData = prepareSurveyHeaderData('GEN', 'OVERALL SATISFACTION', serviceAreaViewScoreDataCollection);
                }
                if (triggerSurveyCollection && triggerSurveyCollection.length > 0) {

                    fullScoreCardData.triggerSurveyData = triggerSurveyCollection;
                    fullScoreCardData.triggerSurveyHeaderData = prepareSurveyHeaderData('TCK', 'IT SERVICE EFFORT SCORE', serviceAreaViewScoreDataCollection);
                }

                //For Denotes legend [Aug01-2015]
                fullScoreCardData.generalSurveyHeaderData.IsShowDenoteLegend = false;
                fullScoreCardData.triggerSurveyHeaderData.IsShowDenoteLegend = false;

                fullScoreCardData.generalSurveyHeaderData.IsShowDoubleTargetLegend = false;
                fullScoreCardData.triggerSurveyHeaderData.IsShowDoubleTargetLegend = false;

                var isIncludeInGroupScoreFound = false;
                var IsShowDoubleTargetLegend = false;

                if(generalSurveyCollection && generalSurveyCollection.length > 0){

                    IsShowDoubleTargetLegend = customerGeneralSettings.HasDoubleTarget;
                    fullScoreCardData.generalSurveyHeaderData.IsShowDoubleTargetLegend = customerGeneralSettings.HasDoubleTarget;

                    _.some(generalSurveyCollection, function (n) {
                        //var foundItem = _.find(n.Items,{IncludeInGroupScore:false}); //Change by shahin oct 10-2015
                        var foundItem = _.find(n.Items,function(item){
                            return (item.IncludeInGroupScore === false && item.QuestionId.indexOf('_SES') < 0 );
                        });

                        if(foundItem){
                            //fullScoreCardData.generalSurveyHeaderData.IsShowDenoteLegend = true;
                            isIncludeInGroupScoreFound = true;
                            return true;
                        }
                        return false;
                    });

                }
                if(isIncludeInGroupScoreFound === false) {
                    if (triggerSurveyCollection && triggerSurveyCollection.length > 0) {
                        _.some(triggerSurveyCollection, function (n) {
                            //var foundItem2 = _.find(n.Items, {IncludeInGroupScore: false});
                            var foundItem2 = _.find(n.Items, function (item) {
                                return (item.IncludeInGroupScore === false && item.QuestionId.indexOf('_SES') < 0 );
                            });
                            if (foundItem2) {
                                //fullScoreCardData.generalSurveyHeaderData.IsShowDenoteLegend = true;
                                isIncludeInGroupScoreFound = true;
                                return true;
                            }
                            return false;
                        });
                    }
                }

                if(IsShowDoubleTargetLegend === false && triggerSurveyCollection && triggerSurveyCollection.length > 0){
                    //IsShowDoubleTargetLegend = customerGeneralSettings.HasDoubleTarget;
                    fullScoreCardData.triggerSurveyHeaderData.IsShowDoubleTargetLegend = customerGeneralSettings.HasDoubleTarget;
                }

                if(isIncludeInGroupScoreFound === true && generalSurveyCollection && generalSurveyCollection.length > 0) {
                    fullScoreCardData.generalSurveyHeaderData.IsShowDenoteLegend = true;
                } else if(isIncludeInGroupScoreFound === true && (generalSurveyCollection === null || generalSurveyCollection.length === 0)) {
                    fullScoreCardData.triggerSurveyHeaderData.IsShowDenoteLegend = true;
                }

                //End

                return fullScoreCardData;
            }

            function prepareServiceAreaOverviewDataCollection(serviceAreaViewScoreDataCollection) {
                var overViewDataCollection = [];
                var generalOS = _.find(serviceAreaViewScoreDataCollection, function (n) {
                    return n.Id == "OS";
                });

                if (generalOS) {
                    var osGroup = prepareGroupQuestionScoreViewData(generalOS);
                    osGroup.NoOfRespondent = generalOS.NoOfRespondent;
                    overViewDataCollection.push(osGroup);
                    var genArea = _.filter(serviceAreaViewScoreDataCollection, function (p) {
                        return p.SurveyType == "GEN";
                    });
                    if (genArea.length > 0) {
                        _.forEach(genArea, function (n) {
                            var questionScoreViewData = prepareGroupQuestionScoreViewData(n);
                            questionScoreViewData.IsGroup = false;
                            overViewDataCollection.push(questionScoreViewData);
                        });
                    }
                }
                var ticket = _.find(serviceAreaViewScoreDataCollection, function (n) {
                    return n.Id == "TCK" || n.Id == "SES";
                });
                if (ticket) {
                    overViewDataCollection.push(prepareGroupQuestionScoreViewData(ticket));
                    var ticketArea = _.filter(serviceAreaViewScoreDataCollection, function (p) {
                        return p.SurveyType == "TCK" && p.Id !== "TCK" && p.Id !== "SES";
                    });
                    if (ticketArea.length > 0) {
                        _.forEach(ticketArea, function (n) {
                            var questionScoreViewData = prepareGroupQuestionScoreViewData(n);
                            questionScoreViewData.IsGroup = false;
                            overViewDataCollection.push(questionScoreViewData);
                        });
                    }
                }

                return overViewDataCollection;
            }

            function prepareCollectionObject(serviceArea) {
                var questionScoreViewData = [];

                var groupQuestionScoreViewData = prepareGroupQuestionScoreViewData(serviceArea);
                questionScoreViewData.push(groupQuestionScoreViewData);

                _.forEach(serviceArea.QuestionScores, function (item, key) {
                    var tmpQesObj = prepareQuestionScoreViewData(item);
                    questionScoreViewData.push(tmpQesObj);
                });
                if (serviceArea.Ses) {
                    questionScoreViewData.push(prepareQuestionScoreViewData(serviceArea.Ses));
                }
                return questionScoreViewData;
            }

            function prepareGroupQuestionScoreViewData(serviceArea) {
                var questionScoreViewData = CreateViewDataFactory.QuestionScoreViewData();
                questionScoreViewData.QuestionId = serviceArea.Id;
                questionScoreViewData.QuestionText = serviceArea.Name;
                questionScoreViewData.NoOfRespondent = serviceArea.Respondent;
                questionScoreViewData.Score = serviceArea.Score;
                questionScoreViewData.Comparator = isDoubleTargetEnabled ? getTarget(serviceArea.Id) : getScoreItemComparator(serviceArea.Id);
                questionScoreViewData.DoubleTarget = isDoubleTargetEnabled ? getScoreItemComparator(serviceArea.Id) : NaN;
                questionScoreViewData.ScoreColor = getScoreColor(serviceArea.Score, questionScoreViewData.Comparator,serviceArea.Id === 'OS');
                questionScoreViewData.IsGroup = true;
                return questionScoreViewData;
            }

            function prepareQuestionScoreViewData(question) {
                var questionScoreViewData = CreateViewDataFactory.QuestionScoreViewData();
                questionScoreViewData.QuestionId = question.QuestionId;
                questionScoreViewData.QuestionText = question.QuestionText;
                questionScoreViewData.NoOfRespondent = question.TotalResponse;
                questionScoreViewData.Score = question.Score;
                questionScoreViewData.Comparator = isDoubleTargetEnabled ? getTarget(question.QuestionId) : getScoreItemComparator(question.QuestionId);
                questionScoreViewData.DoubleTarget = isDoubleTargetEnabled ? getScoreItemComparator(question.QuestionId) : NaN;
                questionScoreViewData.ScoreColor = getScoreColor(question.Score, questionScoreViewData.Comparator, false);
                questionScoreViewData.IncludeInGroupScore = question.IncludeInGroupScore;
                if(!questionScoreViewData.IncludeInGroupScore && question.QuestionId.indexOf("SES") == -1)
                    questionScoreViewData.QuestionText = '\\ ' + question.QuestionText;
                return questionScoreViewData;
            }

            function prepareEmptyServiceAreaScoreData(question) {
                var questionScoreViewData = CreateViewDataFactory.QuestionScoreViewData();
                questionScoreViewData.QuestionId = question.ID;
                questionScoreViewData.QuestionText = question.Text;
                questionScoreViewData.NoOfRespondent = 0;
                questionScoreViewData.Score = NaN;
                questionScoreViewData.Comparator = isDoubleTargetEnabled ? getTarget(questionScoreViewData.QuestionId) : getScoreItemComparator(questionScoreViewData.QuestionId);
                questionScoreViewData.DoubleTarget = isDoubleTargetEnabled ? getScoreItemComparator(questionScoreViewData.QuestionId) : NaN;
                questionScoreViewData.ScoreColor = getScoreColor(questionScoreViewData.Score, questionScoreViewData.Comparator, false);
                questionScoreViewData.IncludeInGroupScore = question.IncludeInGroupScore;
                if(!questionScoreViewData.IncludeInGroupScore && question.ID.indexOf("SES") == -1)
                    questionScoreViewData.QuestionText = '\\ ' + question.Text;
                return questionScoreViewData;
            }

            /**
             * Prepare header data for survey
             * @param surveyType
             * @param title
             * @param serviceAreaCollection
             * @returns {{scoreComparator: {Score: *, ComparatorValue: *, ComparatorColorCode: *}, surveyType: string, title: *}}
             */
            function prepareSurveyHeaderData(surveyType, title, dataCollection) {
                var surveyTypeTitle = "", isOSScore = false;
                var tmpCollection = {};
                var sesColl = [];
                if (surveyType === "GEN") {
                    isOSScore = true;
                    surveyTypeTitle = "GENERAL SURVEYS";
                    tmpCollection = _.filter(dataCollection, function (n) {
                        return n.Id === 'OS';
                    });
                } else if (surveyType === "TCK") {
                    isOSScore = false;
                    surveyTypeTitle = "TICKETS";
                    tmpCollection = _.filter(dataCollection, function (n) {
                        return n.Id === 'TCK' || n.Id === 'SES';
                    });
                    //SES Coll filter
                    sesColl =_.filter(dataCollection, {Id:'SES'});
                }

                return {
                    comparatorData: prepareGroupQuestionScoreViewData(tmpCollection[0]),
                    surveyType: surveyTypeTitle,
                    title: title,
                    isOSScore: isOSScore,
                    noOfRespondent: tmpCollection[0].NoOfRespondent,
                    PositiveResponse: tmpCollection[0].PositiveResponse,
                    NegativeResponse: tmpCollection[0].NegativeResponse,
                    HasSESData: sesColl.length > 0
                };
            }

            function prepareServiceAreaData() {
                if (serviceAreaViewScoreDataCollection.generalSurveyData && serviceAreaViewScoreDataCollection.generalSurveyData.length > 0 && serviceAreaViewScoreDataCollection.triggerSurveyData && serviceAreaViewScoreDataCollection.triggerSurveyData.length > 0) {
                    var gen = serviceAreaViewScoreDataCollection.generalSurveyData;
                    var tck = serviceAreaViewScoreDataCollection.triggerSurveyData;
                    return gen.concat(tck);
                } else if (serviceAreaViewScoreDataCollection.generalSurveyData && serviceAreaViewScoreDataCollection.generalSurveyData.length > 0) {
                    return serviceAreaViewScoreDataCollection.generalSurveyData;
                } else if (serviceAreaViewScoreDataCollection.triggerSurveyData && serviceAreaViewScoreDataCollection.triggerSurveyData.length > 0) {
                    return serviceAreaViewScoreDataCollection.triggerSurveyData;
                }
            }


            function getScoreItemComparator(scoreItem) {
                if(selectedComparatorType === ComparatorType.Custom){
                    if(scoreItem === "OS"){
                        return NaN;
                    }
                    else{
                        return customComparatorValue;
                    }

                }
                else if(selectedComparatorType === ComparatorType.Average){
                    return getAverageComparator(scoreItem);
                }
                else{
                    var comparatorColl = comparatorCollection;
                    var selectedComparator= _.find(comparatorColl,function(n){
                        return n.Id === scoreItem && n.Type === selectedComparatorType;
                    });

                    if( selectedComparator && selectedComparator.Value) {
                        return selectedComparator.Value;
                    } else {
                        return NaN;
                    }
                }
            }
            function getTarget(scoreItem){
                var selectedComparator = _.find(comparatorCollection, function(n){
                   return n.Id === scoreItem && n.Type === ComparatorType.Target;
                });
                if(selectedComparator && selectedComparator.Value){
                    return selectedComparator.Value;
                }
                else{
                    return NaN;
                }

            }
            function getAverageComparator(scoreItem){
                var serviceAreaData = _.find(serviceAreaScoreDataCollection, function(n){
                    return scoreItem.indexOf(n.Id) > -1;
                });
                if(serviceAreaData){
                    if(serviceAreaData.Id === scoreItem){
                        return serviceAreaData.Score;
                    }
                    else if(serviceAreaData.QuestionScores.length > 0){
                        var questionScore = _.find(serviceAreaData.QuestionScores, function(p){
                           return p.QuestionId === scoreItem;
                        });
                        if(questionScore)
                            return questionScore.Score;
                        else{
                            return NaN;
                        }
                    }
                }
                else{
                    return NaN;
                }
            }
            function getScoreColor(score, comparator,isOs) {
                var comparatorThreshold = (isOs && isOs === true) ? osScoreComparatorThreshold : scoreComparatorThreshold;
                if (isNaN(score))
                    return "#555759";//Dark gray when no score

                if (isNaN(comparator) || score >= comparator)
                    return moreSettingsFactory.GetSelectedColorSet().OnTarget;
                else if ((score + comparatorThreshold) >= comparator)
                    return moreSettingsFactory.GetSelectedColorSet().CloseToTarget;
                else
                    return moreSettingsFactory.GetSelectedColorSet().FarFromTarget;
            }

            var onGetAttributeEvaluations = function (response) {
                attributeEvaluations = response;
                $rootScope.$broadcast(Notify.ATTRIBUTE_EVALUATION_DATA_READY);
            };
            var onGetTopLevelFilters = function(response){
                topLevelFilterCollection = response;
                $rootScope.$broadcast(Notify.TOP_LEVEL_FILTER_DATA_READY);
            };
            function getQuestionScoreFrequency(QuestionScoreFrequency){
                var sesScoreFrequency=[];
                _.forEach(QuestionScoreFrequency,function(item){
                    if(item.AnswerType!=-1){
                        if(item.QuestionId.indexOf("SES")>-1){
                            sesScoreFrequency.push(item);
                        }
                    }
                });
                sesScoreFrequency=_.sortBy(sesScoreFrequency,'AnswerType') ;
                var totalAnswer=6;
                if(sesScoreFrequency.length<6){
                    for(var i=0;i<totalAnswer && sesScoreFrequency.length<6 ;i++){
                        var questionScoreFrequencyItem=sesScoreFrequency[i];
                        if( angular.isUndefined(questionScoreFrequencyItem)
                            || !isItemExist(sesScoreFrequency,i)){
                            var defaultQuestionScoreFrequency={
                                QuestionId: "SES",
                                AnswerType: i+1,
                                Frequency: 0,
                                ColorCode:0
                            };
                            sesScoreFrequency.push(defaultQuestionScoreFrequency);
                        }
                    }
                }
                sesScoreFrequency=_.sortBy(sesScoreFrequency,'AnswerType') ;
                return sesScoreFrequency;
            }
            function isItemExist(sesScoreFrequency,TypeId){
               for(var i=0;i<sesScoreFrequency.length;i++)
               {
                   if(sesScoreFrequency[i].AnswerType==(TypeId+1)){
                       return true;
                   }

               }
                return false;
            }
            function getSESGroupScoreFrequency(serviceAreaScoreDataCollection){
                var sesData= _.find(serviceAreaScoreDataCollection,function(item){
                    if(item.Id=="SES"){
                        return item;
                    }
                });
                if(angular.isUndefined(sesData)){
                    sesData = {};
                }
                var serviceAreasSESScoreFrequency=[];
                _.filter(serviceAreaScoreDataCollection,function(item){
                    if((item.SurveyType=="TCK")&&(item.Ses!=null)&&(item.Id!="SES")){
                        serviceAreasSESScoreFrequency.push(getQuestionScoreFrequency(item.QuestionScoreFrequency))
                        //angular.copy(getQuestionScoreFrequency(item.QuestionScoreFrequency),serviceAreasSESScoreFrequency)
                    }
                });
                var baseSESScoreFrequency2=[];
                var baseSESScoreFrequency3=[];

                if(serviceAreasSESScoreFrequency.length>0){
                    _.forEach(serviceAreasSESScoreFrequency,function(itemArray){
                        _.forEach(itemArray,function(item){
                            baseSESScoreFrequency2.push(item);
                        })
                    })
                }

//                var baseSESScoreFrequency = serviceAreasSESScoreFrequency[0];
//                if(serviceAreasSESScoreFrequency.length>1){
//                    //baseSESScoreFrequency =serviceAreasSESScoreFrequency[0];
//                    for(var i=1;i<serviceAreasSESScoreFrequency.length;i++){
//                        var item=serviceAreasSESScoreFrequency[i];
//                        for(var j=0;j<6;j++) {
//                            var sum=baseSESScoreFrequency[j].Frequency+item[j].Frequency;
//                            //baseSESScoreFrequency[j].Frequency = sum;
//                        }
//                    }
//                }

                for(i=1;i<=6;i++){

                    var totalAnswerTypeFrequency=_.sum(baseSESScoreFrequency2, function(object) {
                        if(object.AnswerType==i)
                        return object.Frequency;
                        else return 0;
                    });
                    var questionScoreFrequencyItem={
                        AnswerType:i,
                        ColorCode: null,
                        Frequency: totalAnswerTypeFrequency,
                        QuestionId: "SES"
                    };

                    if(i<=3){
                        questionScoreFrequencyItem.ColorCode=moreSettingsFactory.GetSelectedColorSet().FarFromTarget;
                    }
                    else{
                        questionScoreFrequencyItem.ColorCode=moreSettingsFactory.GetSelectedColorSet().OnTarget;
                    }

                    baseSESScoreFrequency3.push(questionScoreFrequencyItem);
                }
                sesData.QuestionScoreFrequency = baseSESScoreFrequency3;
                return sesData;
            }
            function getSelectedServiceAreaRemarksInfo(selectedArea){
                var remarksColumnInfo={
                    Remarks:"",
                    RemarksAdd:""
                }
                _.forEach(selectedArea.Questions,function(item){
                    var id=item.ID.split('_')[1];

                    if(id === "RM" || id === "RM1" || id === "RM01")
                    {
                        remarksColumnInfo.Remarks=item.Text;
                    }
                    else if(id === "RM2" || id === "RM02"){
                        remarksColumnInfo.RemarksAdd=item.Text;
                    }

                })
                if(remarksColumnInfo.Remarks === "" && remarksColumnInfo.RemarksAdd === "")
                {
                    remarksColumnInfo.Remarks="Remarks";
                }
                return remarksColumnInfo;
            }

            //all public methods and properties exposed by this factory
            return {
                LoadDataSet: function (dataset) {
                    dataInfo = dataset;
                    return dataService.getAllData(dataset, onGetAllData, errorFunction);
                },
                ChangeDataSet: function (dataset) {
                    if(isResetFilterOrView){
                        gFilter = null;
                        tFilter = null;
                    }
                    dataset.gFilter = gFilter;
                    dataset.tFilter = tFilter;
                    dataInfo = dataset;
                    return dataService.getAllData(dataset, onGetChangedDataSet, errorFunction);
                },

                GetSelectedAttributeScoreData: function (requestParameter) {
                    selectedAttributeIndex = requestParameter.attributeIndex;
                    return dataService.getAttributeData(requestParameter, onGetSelectedAttributeScoreData, errorFunction);
                },
                GetSelectedAttributeScoreDataWithFilter: function (requestParameter) {
                    selectedAttributeIndex = requestParameter.attributeIndex;
                    requestParameter.gFilter = gFilter;
                    requestParameter.tFilter = tFilter;
                    return dataService.getAttributeData(requestParameter, onGetSelectedAttributeScoreDataWithFilter, errorFunction);
                },
                GetEvaluations: function (requestParameter) {
                    selectedSurveyType = requestParameter.surveyType;
                    requestParameter.gFilter = gFilter;
                    requestParameter.tFilter = tFilter;
                    return dataService.getEvaluations(requestParameter, onGetEvaluations, errorFunction);
                },
                LoadSelectedServiceAreaAttributeCount: function (requestParameter) {
                    selectedSurveyType = requestParameter.surveyType;
                    requestParameter.gFilter = gFilter;
                    requestParameter.tFilter = tFilter;
                    return dataService.getSelectedServiceAreaAttributeCount(requestParameter, onGetSelectedServiceAreaAttributeCount, errorFunction);
                },
                GetSelectedServiceAreaAttributeCount: function () {
                    return selectedServiceAreaAttributeCountCollection;
                },
                DataInfo: function () {
                    return dataInfo;
                },
                DataSetInfo:function(){
                  return datasetInfo;
                },
                SetDataSetInfo:function(dataSet){
                    datasetInfo = dataSet;
                },
                ServiceAreaChanged: function (serviceAreaId) {
                    selectedServiceArea = _.find(serviceAreaCollection, function (n) {
                        return n.Id == serviceAreaId
                    });
                    selectedQuestion = null;
                    selectedServiceAreaAttributeCountCollection = null;
                    $rootScope.$broadcast(Notify.SERVICE_AREA_CHANGED, selectedServiceArea.Id);
                },
                ServiceAreaQuestionChanged: function (questionId) {

                    selectedQuestion = _.find(selectedServiceArea.Questions, function (n) {
                        return n.ID == questionId
                    });
                    $rootScope.$broadcast(Notify.SERVICE_AREA_QUESTION_CHANGED, selectedQuestion.ID);
                },
                GetServiceAreaShortCode: function (Id) {

                    sA = _.find(serviceAreaCollection, function (n) {
                        return n.Id == Id
                    });
                    return sA.ShortCode;
                },
                ServiceAreaCollection: function () {
                    return serviceAreaCollection;
                },
                GetServiceAreaQuestionsById: function (Id) {
                    var serviceArea = _.find(serviceAreaCollection, function (n) {
                        return n.Id == Id;
                    });
                    return serviceArea.Questions;
                },
                CustomAttributeCollection: function () {
                    return customAttributeCollection;
                },
                ServiceAreaScoreDataCollection: function () {
                    return serviceAreaScoreDataCollection;
                },
                GetServiceAreaViewScoreDataCollection: function () {
                    return serviceAreaViewScoreDataCollection;
                },
                CountryaScoreDataCollection: function () {
                    return countryScoreDataCollection;
                },
                SelectedServiceAreaId: function () {
                    return selectedServiceArea.Id;
                },
                GetSelectedServiceAreaSurveyType: function () {
                    return _.result(_.findWhere(serviceAreaCollection, {'Id': selectedServiceArea.Id}), 'SurveyType');
                },

                GetAtributeScoreDataCollection: function () {
                    return attributeScoreDataCollection;
                },
                GetAtributeScoreDataCollectionWithFilter: function () {
                    return attributeScoreDataCollectionWithFilter;
                },
                GetSelectedServiceAreaEvaluationDataCollection: function () {
                    var result = _.find(evaluationDataCollection, function(n){
                        return n.ServiceAreaId === selectedServiceArea.Id;
                    });
                    if(result)
                       return result.EvaluationCollection;
                    else
                        return null;
                },
                GetSelectedServiceArea: function () {
                    return selectedServiceArea;
                },
                GetSelectedQuestion: function () {
                    return selectedQuestion;
                },
                CustomerGeneralSettings: function () {
                    return customerGeneralSettings;
                },
                GetScoreColor: function (score, comparator,isOS) {
                    return getScoreColor(score, comparator,isOS);

                },
                ComparatorCollection: function () {
                    return comparatorCollection;
                },
                GetColorSettings: function () {
                    return colorSettings;
                },
                GetListViewSelectedAttribute: function () {
                    return listViewSelectedAttribute;
                },
                SetListViewSelectedAttribute: function (attribute) {
                    listViewSelectedAttribute.Index = attribute.Index;
                    listViewSelectedAttribute.Type = attribute.Type;
                },
                GetAttributeEvaluations: function (requestParam) {
                    requestParam.gFilter = gFilter;
                    requestParam.tFilter = tFilter;
                    return dataService.getAttributeEvaluations(requestParam, onGetAttributeEvaluations, errorFunction);
                },
                GetAttributeEvaluationDataCollection: function () {
                    return attributeEvaluations;
                },
                UpdateComparatorType: function (comparatorType) {
                    selectedComparatorType = parseInt(comparatorType);
                },
                UpdateCustomComparatorType: function (comparatorType, customValue) {
                    selectedComparatorType = parseInt(comparatorType);
                    customComparatorValue = customValue;
                },
                GetScoreItemComparator: function (scoreItem) {
                    return getScoreItemComparator(scoreItem);
                },
                GetTargetComparator: function (scoreItem) {
                    return getTarget(scoreItem);
                },
                preparedServiceAreaScoreDataCollection: function () {
                    serviceAreaViewScoreDataCollection = null;
                    serviceAreaViewScoreDataCollection = prepareServiceAreaViewScoreDataCollection(serviceAreaScoreDataCollection);
                },
                preparedFullScorecardDataCollection: function (data) {
//                var scoreViewDataCollection = prepareServiceAreaViewScoreDataCollection(data);
                    return prepareFullScoreCardData(data);
                },
                PrepareAttributeSeriveAreaViewScoreData: function (data) {
                    return prepareServiceAreaViewScoreDataCollection(data);
                },
                GetFullScoreCardData: function () {
                    return prepareFullScoreCardData(serviceAreaViewScoreDataCollection);
                },
                getServiceAreaDataById: function (Id) {
                    if (Id !== "OS" && Id !== "TCK" && Id !== "SES") {
                        tmp = _.result(_.find(serviceAreaViewScoreDataCollection, function (n) {
                            return n.Id === Id;
                        }), "Items");
                    }
                    else {
                        tmp = prepareServiceAreaOverviewDataCollection(serviceAreaViewScoreDataCollection);
                    }
                    return tmp;
                },

                getSelectedAttributeServiceAreaViewDataById: function (data, Id) {
                    if (Id !== "OS" && Id !== "TCK" && Id !== "SES") {
                        tmp = _.result(_.find(data, function (n) {
                            return n.Id === Id;
                        }), "Items");
                    }
                    else {
                        tmp = prepareServiceAreaOverviewDataCollection(data);
                    }
                    return tmp;
                },

                setGeneralApplyFilter: function (val) {
                    gFilter = val;
                    dataInfo.gFilter = gFilter;
                    dataInfo.tFilter = tFilter;
                    return dataService.applyDataFilter(dataInfo, onApplyDataFilter, errorFunction);
                },

                setTriggerApplyFilter: function (val) {
                    tFilter = val;
                    dataInfo.gFilter = gFilter;
                    dataInfo.tFilter = tFilter;
                    return dataService.applyDataFilter(dataInfo, onApplyDataFilter, errorFunction);
                },
                ResetFilter: function () {
                    topLevelFilterCollection = null;
                    gFilter = null;
                    tFilter = null;
                    dataInfo.gFilter = gFilter;
                    dataInfo.tFilter = tFilter;
                    return dataService.applyDataFilter(dataInfo, onApplyDataFilter, errorFunction);
                },
                resetgFilter: function (val) {
                    gFilter = val;
                },
                resettFilter: function (val) {
                    tFilter = val;
                },
                CreateDimensinoValueGroup: function (dataModel, attributeRoute) {
                    return dataService.createDimensionValueGroup(dataModel, attributeRoute, onCreateDimensionValueGroup, errorFunction);
                },
                DeleteDimensinoValueGroup: function (dataModel, attributeRoute) {
                    return dataService.deleteDimensionValueGroup(dataModel, attributeRoute, onDeleteDimensionValueGroup, errorFunction);
                },
                setNewGroupItem: function (val) {
                    newGroupItem = val;
                },
                getNewGroupItem: function () {
                    return newGroupItem;
                },
                setDelGroupItem: function (val) {
                    delGroupItem = val;
                },
                GetServiceAreaQuestionScoreFrequencyByServiceAreaId: function (id) {
                    var result = _.filter(serviceAreaScoreDataCollection, function (item) {
                        if (item.Id == id) {
                            return item.QuestionScoreFrequency;
                        }
                    })
                    return result[0];
                },
                ServiceAreaEvaluationRemarksInfo:function(){
                    return getSelectedServiceAreaRemarksInfo(selectedServiceArea);
                },
                AttributeEvaluationRemarksInfo:function(selectedAreaId){
                    var serviceArea = _.find(serviceAreaCollection, function(n){
                       return n.Id === selectedAreaId;
                    });
                    return getSelectedServiceAreaRemarksInfo(serviceArea);
                },
                GetSESEvaluationScoreFrequencySummary: function () {
                    return getSESGroupScoreFrequency(serviceAreaScoreDataCollection);
                },
                GetSelectedAttributeSESFrequency: function (attributeServiceAreaScoreDataCollection) {
                    return getSESGroupScoreFrequency(attributeServiceAreaScoreDataCollection);
                },
                GetServiceAreaByServiceAreaId:function(id){
                    var serviceArea = _.find(serviceAreaCollection, function (n) {
                        return n.Id == id;
                    });
                    return serviceArea;
                },
                HasDoubleTarget:function(hasDoubleTarget){
                    isDoubleTargetEnabled = hasDoubleTarget;
                    return isDoubleTargetEnabled;
                },
                SetResetFilterOrView:function(value){
                    isResetFilterOrView = value;
                },
                IsResetFilterOrView:function(){
                    return isResetFilterOrView;
                },
                ApplyTopLevelFilters: function(topLevelFilter){
                    attributeScoreDataCollection.length = 0;
                    var tDFData = {};
                    tDFData.sessionID = dataInfo.sessionID;
                    tDFData.customerID = dataInfo.customerID;
                    tDFData.fromDate = dataInfo.fromDate;
                    tDFData.toDate = dataInfo.toDate;
                    tDFData.tFilter = topLevelFilter;
                    return dataService.getTopLevelAttributeCount(tDFData, onGetTopLevelFilters, errorFunction);
                },
                GetTopLevelFilteredCollection: function(){
                    return topLevelFilterCollection;
                }
            };
        }]);
});
