"use strict";
define(['application-configuration', 'd3', 'dataFactory', 'lodash', 'comparatorFactory', 'moreSettingsFactory','d3-tip'], function (app, d3) {
    app.register.controller('evaluationController', ['$scope', '$rootScope', 'dataFactory', 'Notify', 'comparatorFactory', 'appSettings', 'moreSettingsFactory','accountFactory','UserType','dataFilterFactory','$timeout',
        function ($scope, $rootScope, dataFactory, Notify, comparatorFactory, appSettings, moreSettingsFactory,accountFactory,UserType,dataFilterFactory,$timeout) {

            $scope.serviceAreaEvaluationViewData = [];
            $scope.hasTranslation = false;
            $scope.isEvaluationSelected = true;
            $scope.isSummarySelected = false;
            $scope.selectedServiceAreaTitle = "SA";
            $scope.remarksColumnInfo;
            $scope.isCustomerUser = false;
            var customerSettings = {};
            var isTranslationSelected = false;
            var selectedServiceAreaId = dataFactory.SelectedServiceAreaId();
            if (selectedServiceAreaId == "SES" || !accountFactory.IsDetailsRoleActive()) {
                $scope.isEvaluationSelected = false;
                $scope.isSummarySelected = true;
                $("#selected-evaluation-window-arrow").addClass('left-menu-summary-arrow-selected').removeClass('left-menu-evaluation-arrow-selected');
            }
            loadEvaluationData();
            loadCustomerSettings();

            $scope.showBarChart = function () {
                if (dataFactory.SelectedServiceAreaId() == "OS" || dataFactory.SelectedServiceAreaId() == "SES")
                    return true;
                else
                    false;
            }
            $scope.showIndividualServiceAreaSummary = function () {
                return !$scope.showBarChart();
            }
            $scope.showScore = function (score){
                return isNaN(score)?'':score;
            }
            $scope.printQuestionText = function(data){
                //QuestionText IncludeInGroupScore
                var questionText = "";
                if(data.IncludeInGroupScore){
                    questionText = data.QuestionText;
                }
                else
                {
                    questionText = "\\ "+data.QuestionText;
                }
                return questionText;
            }


            $scope.individualServiceAreaSummary = function () {
                    $scope.onTarget = moreSettingsFactory.GetSelectedColorSet().OnTarget;
                    $scope.farFromTarget = moreSettingsFactory.GetSelectedColorSet().FarFromTarget;
                    var serviceAreaScoreDataCollection = dataFactory.ServiceAreaScoreDataCollection();
                    var id = dataFactory.SelectedServiceAreaId();
                    var filterServiceAreaData = _.filter(serviceAreaScoreDataCollection, function (item) {
                        if (item.Id == id) {
                            return item;
                        }
                    })[0];
                    var serviceAreaQuestionScore = filterServiceAreaData.QuestionScores;
                    var sesScoreFrequency = [];
                    var serviceAreaQuestionScoreFrequency = [];

                    _.forEach(filterServiceAreaData.QuestionScoreFrequency, function (item) {
                        if (item.AnswerType != -1) {
                            if (item.QuestionId.indexOf("SES") > -1) {
                                sesScoreFrequency.push(item);
                            }
                            else {
                                serviceAreaQuestionScoreFrequency.push(item);
                            }
                        }
                    })

                    sesScoreFrequency = _.sortBy(sesScoreFrequency, 'AnswerType');
                    if (sesScoreFrequency.length > 0) {
                        $scope.individualServiceAreaSES = [];
                        var sesFrequency = {QuestionText: "Score", Score: filterServiceAreaData.Ses.Score};
                        sesFrequency.QuestionScoreFrequency = prepareIndividualServiceAreaSESSummary(sesScoreFrequency, filterServiceAreaData.Ses);
                        sesFrequency.serialId = "SES_Frequency";
                        $scope.individualServiceAreaSES.push(sesFrequency);
                    }

                    var serviceAreaQuestionScoreFrequency = _.sortBy(serviceAreaQuestionScoreFrequency, 'AnswerType');
                    // var serviceAreaQuestionScoreFrequency
                    var serialId = 1;
                    _.forEach(serviceAreaQuestionScore, function (item) {
                        item.serialId = serialId;
                        serialId++;
                        var questionScoreFrequency = [];
                        _.forEach(serviceAreaQuestionScoreFrequency, function (fItem) {
                            if (fItem.QuestionId == item.QuestionId) {
                                fItem.BarHeight = frequencyBarHeight(fItem, item.TotalResponse)
                                questionScoreFrequency.push(fItem);
                            }
                        })
                        if (questionScoreFrequency.length > 0) {
                            //questionScoreFrequency.pop();
                            //questionScoreFrequency.pop();
                            var totalAnswer = 4;
                            var questionId = questionScoreFrequency[0].QuestionId;
                            if (questionScoreFrequency.length < 4) {
                                for (var i = 0; i < totalAnswer && questionScoreFrequency.length < 4; i++) {
                                    var questionScoreFrequencyItem = questionScoreFrequency[i];
                                    if (angular.isUndefined(questionScoreFrequencyItem)
                                        || !isItemExist(questionScoreFrequency, i)) {
                                        var defaultQuestionScoreFrequency = {
                                            QuestionId: questionId,
                                            AnswerType: i + 1,
                                            Frequency: 0,
                                            BarHeight: 0,
                                            ColorCode: 0
                                        };
                                        questionScoreFrequency.push(defaultQuestionScoreFrequency);
                                    }
                                }
                                questionScoreFrequency = _.sortBy(questionScoreFrequency, 'AnswerType');
                            }
                            for (i = 1; i <= 4; i++) {
                                if (i <= 2) {
                                    questionScoreFrequency[i - 1].ColorCode = moreSettingsFactory.GetSelectedColorSet().FarFromTarget;
                                }
                                else {
                                    questionScoreFrequency[i - 1].ColorCode = moreSettingsFactory.GetSelectedColorSet().OnTarget;
                                }
                            }

                            item.QuestionScoreFrequency = questionScoreFrequency;
                        }
                    })

                    $scope.individualServiceAreaSummaryData = serviceAreaQuestionScore;
                    $scope.individualServiceAreaSummaryDataCol1 = [];
                    $scope.individualServiceAreaSummaryDataCol2 = [];
                    var length = $scope.individualServiceAreaSummaryData.length;
                    for (var i = 0; i < length; i++) {
                        if (length <= 10) {
                            if (i < 5) {
                                $scope.individualServiceAreaSummaryDataCol1.push($scope.individualServiceAreaSummaryData[i]);
                            }
                            else {
                                $scope.individualServiceAreaSummaryDataCol2.push($scope.individualServiceAreaSummaryData[i]);
                            }
                        }
                        else {
                            var col1LastIndex = Math.ceil(length / 2);
                            var col2FirstIndex = length - col1LastIndex;

                            if (i < col1LastIndex) {
                                $scope.individualServiceAreaSummaryDataCol1.push($scope.individualServiceAreaSummaryData[i]);
                            }
                            else {
                                $scope.individualServiceAreaSummaryDataCol2.push($scope.individualServiceAreaSummaryData[i]);
                            }
                        }

                    }
            }
            function prepareIndividualServiceAreaSESSummary(sesScoreFrequency, ses) {
                var questionScoreFrequency = [];
                _.forEach(sesScoreFrequency, function (fItem) {
                    fItem.BarHeight = frequencyBarHeight(fItem, ses.TotalResponse)
                    questionScoreFrequency.push(fItem);
                })
                if (questionScoreFrequency.length > 0) {
                    //questionScoreFrequency.pop();
                    //questionScoreFrequency.pop();
                    var totalAnswer = 6
                    var questionId = questionScoreFrequency[0].QuestionId;
                    if (questionScoreFrequency.length < 6) {
                        for (var i = 0; i < totalAnswer && questionScoreFrequency.length < 6; i++) {
                            var questionScoreFrequencyItem = questionScoreFrequency[i];
                            if (angular.isUndefined(questionScoreFrequencyItem)
                                || !isItemExist(questionScoreFrequency,i)) {
                                var defaultQuestionScoreFrequency = {
                                    QuestionId: questionId,
                                    AnswerType: i + 1,
                                    Frequency: 0,
                                    BarHeight: 0,
                                    ColorCode: 0
                                };
                                questionScoreFrequency.push(defaultQuestionScoreFrequency);
                            }
                        }

                    }
                    questionScoreFrequency=_.sortBy(questionScoreFrequency, 'AnswerType');
                    for (i = 1; i <= 6; i++) {
                        if (i <= 3) {
                            questionScoreFrequency[i - 1].ColorCode = moreSettingsFactory.GetSelectedColorSet().FarFromTarget;
                        }
                        else {
                            questionScoreFrequency[i - 1].ColorCode = moreSettingsFactory.GetSelectedColorSet().OnTarget;
                        }
                    }

                    return questionScoreFrequency;
                }
            }

            $scope.drawSummaryBar = function (data, id, ele) {
                var e = ele;
                var svgId = "#a-" + id;
                var svg = d3.select(svgId);
                svg.append("rect")
                    .attr("width", "50%")
                    .attr("height", "50%")
                    .attr("stroke", "#000")
                    .attr("fill", "none")
                $scope.questionScoreFrequency = {};
                $scope.questionScoreFrequency = data.QuestionScoreFrequency;
                console.log("data:" + data.QuestionId)


            }
            $scope.getIndex = function (i) {
                return i;
            }
            function frequencyBarHeight(data, response) {
                var value = data.Frequency == 0 ? 0 : (data.Frequency / response) * 100;
                return (value * 45) / 100;
            }

            function isItemExist(sesScoreFrequency, TypeId) {
                for (var i = 0; i < sesScoreFrequency.length; i++) {
                    if (sesScoreFrequency[i].AnswerType == (TypeId + 1)) {
                        return true;
                    }

                }
                return false;
            }

            $scope.summaryEvaluationExe = function () {
                if (dataFactory.SelectedServiceAreaId() == "SES") {
                    var sesData = dataFactory.GetSESEvaluationScoreFrequencySummary();
                    animateSESBarCHart(sesData);
                }
                else {
                    var coll = dataFactory.GetServiceAreaQuestionScoreFrequencyByServiceAreaId(dataFactory.SelectedServiceAreaId());
                    var questionScoreFrequency = _.sortBy(coll.QuestionScoreFrequency, 'AnswerType');
                    //for OS questionScoreFrequency contain 1-10. for SES 1-6.if there any missing need to fill explicitly.
                    var totalAnswer;
                    if (dataFactory.SelectedServiceAreaId() == "OS") {
                        totalAnswer = 10
                        for (var i = 0; i < totalAnswer && questionScoreFrequency.length < 10; i++) {

                            var questionScoreFrequencyItem = questionScoreFrequency[i];
                            if (angular.isUndefined(questionScoreFrequencyItem)
                                || !isItemExist(questionScoreFrequency, i)) {
                                var defaultQuestionScoreFrequency = {
                                    QuestionId: "general_OS",
                                    AnswerType: i + 1,
                                    Frequency: 0
                                };
                                questionScoreFrequency.push(defaultQuestionScoreFrequency);
                            }
                        }
                    }
//                    questionScoreFrequency.push({
//                        QuestionId: "general_OS",
//                        AnswerType: null,
//                        Frequency: 0
//                    })
                    questionScoreFrequency = _.sortBy(questionScoreFrequency, 'AnswerType');
                    var svgHeight = 241;
                    var svgWidth = 300;
                    //var maxAge = maxFrequency; // You can also compute this from the data
                    var barGap = 8; // The amount of space you want to keep between the bars
                    var padding = {
                        left: 20, right: 0,
                        top: 20, bottom: 20
                    };
                    var barBottomGap = 8;
                    var barTextBottomGap = 5 + barBottomGap;
                    animateBarsUp();
                }
                function animateBarsUp() {
                    var maxWidth = svgWidth - padding.left - padding.right;
                    var maxHeight = svgHeight - padding.top - padding.bottom;

                    // Define your conversion functions
                    var convert = {
                        x: d3.scale.ordinal(),
                        y: d3.scale.linear()
                    };

                    // Define your axis
                    var axis = {
                        x: d3.svg.axis().orient('bottom'),
                        y: d3.svg.axis().orient('left')
                    };

                    // Define the conversion function for the axis points
                    axis.x.scale(convert.x).outerTickSize(0);
                    axis.y.scale(convert.y).ticks(0).outerTickSize(0);

                    // Define the output range of your conversion functions
                    convert.y.range([maxHeight, 0]);
                    convert.x.rangeRoundBands([0, maxWidth],0.3,0.3);

                    // Once you get your data, compute the domains
                    convert.x.domain(questionScoreFrequency.map(function (d) {
                            return d.AnswerType;
                        })
                    );
                    var totalQuestionScoreFrequency=
                        _.sum(questionScoreFrequency, function(object) {
                            return object.Frequency;
                        });
                    convert.y.domain([0, totalQuestionScoreFrequency]);

                    // Setup the markup for your SVG
                    var svg = d3.select('.chart')
                        .attr({
                            width: svgWidth,
                            height: svgHeight
                        });
                    svg.append('text').attr("x", 15)
                        .attr("y", 10)
                        .text("n");

                    // The group node that will contain all the other nodes
                    // that render your chart
                    var chart = svg.append('g')
                        .attr({
                            transform: function (d, i) {
                                return 'translate(' + padding.left + ',' + padding.top + ')';
                            }
                        });

                    chart.append('g') // Container for the axis
                        .attr({
                            class: 'x axis',
                            transform: 'translate(0,' + maxHeight + ')'
                        })
                        .call(axis.x); // Insert an axis inside this node

                    chart.append('g') // Container for the axis
                        .attr({
                            class: 'y axis',
                            height: maxHeight
                        })
                        .call(axis.y); // Insert an axis inside this node

                    var bars = chart
                        .selectAll('g.bar-group')
                        .data(questionScoreFrequency)
                        .enter()
                        .append('g') // Container for the each bar
                        .attr({
                            transform: function (d, i) {
                                return 'translate(' + convert.x(d.AnswerType) + ', 0)';
                            },
                            class: 'bar-group'
                        });
                    bars.append('text')
                        .text(function (d) {
                            if (d.Frequency == 0)
                                return ""
                            else
                                return d.Frequency
                        })
                        .attr({
                            y: function (d, i) {
                                return convert.y(d.Frequency) - barTextBottomGap;
                            },
                            x: '3%',
                            class: 'bar-frequency-label'
                        })
                        .attr('text-anchor','middle')

                    bars.append('rect')
                        .attr({
                            y: function (d, i) {
                                return convert.y(d.Frequency) - barBottomGap;
                            },
                            height: function (d, i) {
                                return maxHeight - convert.y(d.Frequency);
                            },
                            width: function (d) {
                                return convert.x.rangeBand(d);
                            },
                            fill: function (d, i) {
                                var FarFromTarget = moreSettingsFactory.GetSelectedColorSet().FarFromTarget;
                                var OnTarget = moreSettingsFactory.GetSelectedColorSet().OnTarget;
                                var CloseToTarget = moreSettingsFactory.GetSelectedColorSet().CloseToTarget;
                                if (selectedServiceAreaId == "OS") {
                                    if (i <= 4) {
                                        return FarFromTarget;
                                    }
                                    else if (i == 5) {
                                        return CloseToTarget;
                                    }
                                    else {
                                        return OnTarget;
                                    }

                                }
                            }
                        });
                    return chart;
                }

                function animateSESBarCHart(sesData) {
                    var sesScoreFrequencyColl = sesData.QuestionScoreFrequency;
//                    sesScoreFrequencyColl.push({
//                        QuestionId: "SES",
//                        AnswerType: null,
//                        Frequency: 0
//                    })
                    sesScoreFrequencyColl = _.sortBy(sesScoreFrequencyColl, 'AnswerType');
//                    Array.prototype.sum = function (prop) {
//                        var total = 0
//                        for (var i = 0, _len = this.length; i < _len; i++) {
//                            total += this[i][prop]
//                        }
//                        return total
//                    }
                    var svgHeight = 241;
                    var svgWidth = 200;
                    var maxFrequency = svgHeight;


                    //var maxAge = maxFrequency; // You can also compute this from the data
                    var barGap = 10; // The amount of space you want to keep between the bars
                    var padding = {
                        left: 20, right: 0,
                        top: 20, bottom: 20
                    };
                    var barBottomGap = 8;
                    var barTextBottomGap = 5 + barBottomGap;
                    var maxWidth = svgWidth - padding.left - padding.right;
                    var maxHeight = svgHeight - padding.top - padding.bottom;

                    // Define your conversion functions
                    var convert = {
                        x: d3.scale.ordinal(),
                        y: d3.scale.linear()
                    };

                    // Define your axis
                    var axis = {
                        x: d3.svg.axis().orient('bottom'),
                        y: d3.svg.axis().orient('left')
                    };

                    // Define the conversion function for the axis points
                    axis.x.scale(convert.x).outerTickSize(0);;
                    axis.y.scale(convert.y).ticks(0).outerTickSize(0);;

                    // Define the output range of your conversion functions
                    convert.y.range([maxHeight, 0]);
                    convert.x.rangeRoundBands([0, maxWidth],0.3,0.3);

                    // Once you get your data, compute the domains
                    convert.x.domain(sesScoreFrequencyColl.map(function (d) {
                            return d.AnswerType;
                        })
                    );
                    var totalFrequency=
                        _.sum(sesScoreFrequencyColl, function(object) {
                            return object.Frequency;
                        });
                    convert.y.domain([0, totalFrequency]);

                    // Setup the markup for your SVG
                    var svg = d3.select('.chart')
                        .attr({
                            width: svgWidth,
                            height: svgHeight
                        });
                    svg.append('text').attr("x", 15)
                        .attr("y", 10)
                        .text("n");

                    // The group node that will contain all the other nodes
                    // that render your chart
                    var chart = svg.append('g')
                        .attr({
                            transform: function (d, i) {
                                return 'translate(' + padding.left + ',' + padding.top + ')';
                            }
                        });

                    chart.append('g') // Container for the axis
                        .attr({
                            class: 'x axis',
                            transform: 'translate(0,' + maxHeight + ')'
                        })
                        .call(axis.x); // Insert an axis inside this node

                    chart.append('g') // Container for the axis
                        .attr({
                            class: 'y axis',
                            height: maxHeight
                        })
                        .call(axis.y); // Insert an axis inside this node

                    var bars = chart
                        .selectAll('g.bar-group')
                        .data(sesScoreFrequencyColl)
                        .enter()
                        .append('g') // Container for the each bar
                        .attr({
                            transform: function (d, i) {
                                return 'translate(' + convert.x(d.AnswerType) + ', 0)';
                            },
                            class: 'bar-group'
                        });
                    bars.append('text')
                        .attr({
                            y: function (d, i) {
                                return convert.y(d.Frequency) - barTextBottomGap;
                            },
                            x: '5%',
                            class: 'bar-frequency-label'
                        })
                        .attr('text-anchor','middle')
                        .text(function (d) {
                            if (d.Frequency == 0)
                                return ""
                            else
                                return d.Frequency
                        })
                    bars.append('rect')
                        .attr({
                            y: function (d, i) {
                                return convert.y(d.Frequency) - barBottomGap;
                            },
                            height: function (d, i) {
                                return maxHeight - convert.y(d.Frequency);
                            },
                            width: function (d) {
                                return convert.x.rangeBand(d) ;
                            },
                            fill: function (d, i) {
                                return d.ColorCode;
                            }
                        });

                    return chart;
                }
            }
            $scope.summary_selectedClickHandler = function () {
                $("#selected-evaluation-window-arrow").addClass('left-menu-summary-arrow-selected').removeClass('left-menu-evaluation-arrow-selected');
                $scope.isEvaluationSelected = false;
                $scope.isSummarySelected = true;

            }
            $scope.evaluation_selectedClickHandler = function () {
                $("#selected-evaluation-window-arrow").addClass('left-menu-evaluation-arrow-selected').removeClass('left-menu-summary-arrow-selected');
                $scope.isEvaluationSelected = true;
                $scope.isSummarySelected = false;
            }
            function loadCustomerSettings() {
                customerSettings = dataFactory.CustomerGeneralSettings();
                $scope.hasTranslation = customerSettings.HasTranslation;
                isTranslationSelected =  customerSettings.HasTranslation;
            }

            function loadEvaluationData() {
                $scope.isCustomerUser = accountFactory.UserData().UserType == UserType.END_USER;
                setEvaluationWindowTopBar();
                if (selectedServiceAreaId != "SES" && accountFactory.IsDetailsRoleActive() ) {
                        $scope.remarksColumnInfo = dataFactory.ServiceAreaEvaluationRemarksInfo();
                        var selectedEvaluationColl = dataFactory.GetSelectedServiceAreaEvaluationDataCollection();
                        if (!selectedEvaluationColl || selectedEvaluationColl.length == 0) {
                            var evaluationRequestParam = getEvaluationsRequestParam();
                            getSelectedServiceAreaEvaluations(evaluationRequestParam);
                        }
                        else {
                            prepareServiceAreaEvaluationViewData(selectedEvaluationColl);
                        }
                }

            }

            function setEvaluationWindowTopBar() {
                var serviceAreaColl = dataFactory.GetServiceAreaViewScoreDataCollection();
                var selectedServiceArea = dataFactory.GetSelectedServiceArea();
                var serviceArea = _.find(serviceAreaColl, function (item) {
                    return item.Id === selectedServiceArea.Id;
                });

                $scope.positiveCount = serviceArea.PositiveResponse;
                $scope.negativeCount = serviceArea.NegativeResponse;

                $scope.selectedServiceAreaId = serviceArea.Id;
                var comparatorValue = comparatorFactory.GetScoreItemComparator(serviceArea.Id);
                var colorCode = dataFactory.GetScoreColor(serviceArea.Score, comparatorValue, serviceArea.Id === 'OS');
                $scope.selectedServiceAreaTitle = selectedServiceArea.Name;
                $scope.scoreBarData = {
                    Score: serviceArea.Score,
                    Comparator: comparatorValue,
                    ScoreColor: colorCode,
                    QuestionId: serviceArea.Id,
                    DoubleTarget: comparatorFactory.GetDoubleTarget(serviceArea.Id)
                }
                $scope.isComparatorEnable = serviceArea.Id === "SES" ? "false" : "true";

            }

            function filterEvaluationDataBySurveyType() {
                var evaluationColl = dataFactory.GetSelectedServiceAreaEvaluationDataCollection();
                var selectedSurveyType = surveyTypeConverter(dataFactory.GetSelectedServiceAreaSurveyType());
                var selectedEvaluationColl;
                var result = _.forEach(evaluationColl, function (item) {
                    if (item.SurveyType == selectedSurveyType) {
                        selectedEvaluationColl = item;
                    }
                });
                return selectedEvaluationColl;
            }

            function getSelectedServiceAreaEvaluations(param) {

                dataFactory.GetEvaluations(param);
            }

            function getEvaluationsRequestParam() {
                var applicationDataInfo = dataFactory.DataInfo();
                var selectedSurveyType = dataFactory.GetSelectedServiceAreaSurveyType();
                return {
                    sessionID: accountFactory.UserData().SessionId,
                    customerID: applicationDataInfo.customerID,
                    fromDate: applicationDataInfo.fromDate,
                    toDate: applicationDataInfo.toDate,
                    surveyType: surveyTypeConverter(selectedSurveyType),
                    selectedServiceAreaId: dataFactory.SelectedServiceAreaId()
                }
            };
            function surveyTypeConverter(type) {
                return type == "NOG" ? "GEN" : type;
            }

            //$scope.$on(Notify.DATASET_CHANGED, function (event) {
            //
            //});

            //$scope.$on(Notify.SERVICE_AREA_CHANGED, function (event, response) {
            //    $scope.selectedServiceAreaTitle=dataFactory.SelectedServiceAreaId;
            //    var item= dataFactory.GetSelectedServiceArea();
            //    loadEvaluationData();
            //
            //});
            $scope.translationSelectionListener = function (type) {
                isTranslationSelected = type === 2;
            };
            $scope.$on(Notify.EVALUATION_DATA_READY, function (event, response) {
                var attDataCollection = dataFactory.GetSelectedServiceAreaEvaluationDataCollection();
                prepareServiceAreaEvaluationViewData(attDataCollection);
            });
            function prepareServiceAreaEvaluationViewData(evaluationData) {
                $scope.selectedServiceAreaType = dataFactory.GetSelectedServiceAreaSurveyType();
                $scope.serviceAreaEvaluationViewData = [];
                var serviceAreaQuestionCollection = dataFactory.GetServiceAreaQuestionsById(dataFactory.SelectedServiceAreaId());
                $scope.customAttributeCollection = dataFactory.CustomAttributeCollection();
                for (var i = 0; i < evaluationData.length; i++) {
                    var selectedEvaluationData = evaluationData[i].ServiceAreaEvaluations[0];
                    if (selectedEvaluationData) {
                        var evaluation = {
                            RespondentId: evaluationData[i].RespondentId,
                            AttributeValues: evaluationData[i].AttributeValues,
                            Remarks: selectedEvaluationData.Remarks,
                            RemarksAdd: selectedEvaluationData.RemarksAdd,
                            RemarksAddEng: selectedEvaluationData.RemarksAddEng,
                            RemarksEng: selectedEvaluationData.RemarksEng,
                            ServiceAreaId: selectedEvaluationData.ServiceAreaId,
                            IsRemarksLangSame: isRemarksLanguageSame(selectedEvaluationData.RemarksLang),
                            IsRemarksAddLangSame: isRemarksLanguageSame(selectedEvaluationData.RemarksAddLang),
                            Answers: [],
                            BothEvaluationData: {
                                Remarks: selectedEvaluationData.Remarks,
                                RemarksEng: selectedEvaluationData.RemarksEng,
                                RemarksAdd: selectedEvaluationData.RemarksAdd,
                                RemarksAddEng: selectedEvaluationData.RemarksAddEng,
                                IsRemarksLangSame: isRemarksLanguageSame(selectedEvaluationData.RemarksLang),
                                IsRemarksAddLangSame: isRemarksLanguageSame(selectedEvaluationData.RemarksAddLang),
                                Answers: []
                            }
                        };
                        var selectedServiceAreaName=dataFactory.GetSelectedServiceArea().Name;

                        _.forEach(selectedEvaluationData.Answers, function (item) {
                            item.QuestionText = _.find(serviceAreaQuestionCollection, function (n) {
                                return n.ID == item.QuestionId;
                            }).Text;
                            item.ServiceAreaName=selectedServiceAreaName;
                            evaluation.Answers.push(item);
                            evaluation.BothEvaluationData.Answers.push(item);
                        })
                        $scope.serviceAreaEvaluationViewData.push(evaluation);
                    }

                }

                //console.log("view data length :" + $scope.serviceAreaEvaluationViewData.length);
            }

            function isRemarksLanguageSame(remarksLang){
                if(remarksLang){
                    return remarksLang.toLowerCase() == "en" && dataFactory.CustomerGeneralSettings().HasTranslation;
                }
                else
                return false;
            }

            function filterEvaluationData(evaluationData) {
                var result = "";
                var serviceAreaId = dataFactory.SelectedServiceAreaId();
                result = _.filter(evaluationData, function (n) {
                    return (n.ServiceAreaId == serviceAreaId);
                });
                return result[0];
            }

            $scope.download_data = function () {
                var requestParameter = getEvaluationsRequestParam();
                var url = addParameterToURL(requestParameter, appSettings.API_BASE_URL + "EvaluationDataTemplate.aspx");
                window.location.href = url;
            };
            function formatDate(date) {
                date = new Date(date);

                var day = ('0' + date.getDate()).slice(-2);
                var month = ('0' + (date.getMonth() + 1)).slice(-2);
                var year = date.getFullYear();

                return year + '-' + month + '-' + day;
            }

            function addParameterToURL(requestParameter, _url) {
                var hasAdditionalRemarks = $scope.remarksColumnInfo.RemarksAdd != "";
                var filterData = "";
                var appliedFilterData = dataFilterFactory.GetAppliedDataFilterCollection();
                var param = "sessionId=" + requestParameter.sessionID;
                param += "&customerId=" + requestParameter.customerID;
                param += "&fromDate=" + requestParameter.fromDate.toString();
                param += "&toDate=" + requestParameter.toDate.toString();
                param += "&surveyType=" + requestParameter.surveyType;
                param += "&serviceAreaId=" + dataFactory.GetSelectedServiceArea().Id;
                param += "&isAttributeEvaluation=" + "false";
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
                param += "&allFilters="+filterData;
                param += "&generalFilter="+((dataFactory.DataInfo().gFilter == null) ? "" : dataFactory.DataInfo().gFilter);
                param += "&ticketFilter="+((dataFactory.DataInfo().tFilter == null) ? "" : dataFactory.DataInfo().tFilter);

                _url += (_url.split('?')[1] ? '&' : '?') + param;
                return _url;
            }

            //Show/Hide evaluation tab
            $scope.IsShowEvaluationTab = function () {
                if (dataFactory.SelectedServiceAreaId() === "SES" || !accountFactory.IsDetailsRoleActive()) {
                    return false;
                }
                return true;
            };

        }]);
});
