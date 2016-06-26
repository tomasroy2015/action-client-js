"use strict";

define(['application-configuration', 'dataFilterFactory', 'CreateViewDataFactory', 'addToGroupController','confirmationWindowController','groupDeleteConfirmationWindowController'], function (app) {

    app.register.controller('dataFilterController', ['$scope', '$interval', 'dataFactory', 'dataFilterFactory', 'Notify', 'CreateViewDataFactory', 'uiGridTreeViewConstants', '$timeout', '$filter', 'uiGridConstants', '$modal', '$rootScope', function ($scope, $interval, dataFactory, dataFilterFactory, Notify, CreateViewDataFactory, uiGridTreeViewConstants, $timeout, $filter, uiGridConstants, $modal, $rootScope) {

        //app.register.filter("arrayIds", function () {
        //    return function (data,filterArr) {
        //        return (filterArr.indexOf(data.Id) !== -1);
        //    };
        //});

        $scope.dataFilterFactory = dataFilterFactory;
        $scope.ApplyFilterModelCollection = [];
        $scope.SelectedItems = [];
        $scope.IsAddToGroupBtnEnabled = true;
        $scope.isDeleteButtonClicked = false;
        //For TopLevel data filter
        $scope.SeletectedTopLevelAttribute = null;
        $scope.IsTopLevelDataFilterApplied = false;


        $scope.$watch(function () {
            return dataFilterFactory.GetSelectedAttributeIndex();
        }, function (newIndex) {
            if (newIndex !== undefined && newIndex >= 0) {
                //clearSelectedRows();
                var attDataCollection = dataFactory.GetAtributeScoreDataCollection();
                var oSelectedServiceArea = dataFactory.GetSelectedServiceArea();

                //updateDataFilerScoreAndRespondent()

                var query = _.filter(attDataCollection, function (n) {
                    return n.AttributeIndex == newIndex;
                });

                if (query !== undefined && query.length === 0) {
                    prepareSelectedAttributeServiceAreaData();
                }
                else {
                    loadDataFilterData(query[0].ScoreDataCollection);
                }
            }
        });


        /* LeftMenu Attribute Click Event Listener */
        $scope.$watch(function () {
            return dataFilterFactory.GetLeftMenuAttributeClickedEvent();
        }, function (newVal) {
            if (newVal) {
                //grid.selection.selectAll
                $scope.SelectedItems = [];
                clearSelectedRows();
                updateDataFilerScoreAndRespondent();
                gridRefresh();
                dataFilterFactory.SetLeftMenuAttributeClickedEvent(false);
            }
        });

        /* LeftMenu Reset Button Click Event Listener */
        $scope.$watch(function () {
            return dataFilterFactory.GetDataFilterResetClickedEvent();
        }, function (newVal) {
            if (newVal) {

                //For top level filter reset
                //$scope.IsTopLevelDataFilterApplied
                //
                if($scope.ApplyFilterModelCollection && $scope.ApplyFilterModelCollection.length > 0) {
                    $scope.IsTopLevelDataFilterApplied = false;
                    var findTopLevelAppliedModel = _.find($scope.ApplyFilterModelCollection, {
                        IsTopLevelFilter: true
                    });

                    if (findTopLevelAppliedModel) {
                        $scope.IsTopLevelDataFilterApplied = true;
                    }
                }


                $scope.ApplyFilterModelCollection = [];
                dataFilterFactory.SetAppliedDataFilterCollection($scope.ApplyFilterModelCollection);
                $scope.SelectedItems = [];
                //dataFactory.setGeneralApplyFilter(null);
                //dataFactory.setTriggerApplyFilter(null);
                dataFactory.ResetFilter();
                //dataFilterFactory.SetDataFilterResetClickedEvent(false);
            }
        });

        $scope.$on(Notify.ATTRIBUTE_DATA_READY, function (event) {
            //clearSelectedRows();
            var attDataCollection = dataFactory.GetAtributeScoreDataCollection();

            var query = _.filter(attDataCollection, function (n) {
                return n.AttributeIndex == dataFilterFactory.GetSelectedAttributeIndex();
            });
            if (query && query.length > 0) {
                //var sSA = dataFactory.GetSelectedServiceArea();
                loadDataFilterData(query[0].ScoreDataCollection);
            }
        });

        $scope.$on(Notify.DATAFILTER_GROUP_CREATED, function (event) {
            var attDataCollection = dataFactory.GetAtributeScoreDataCollection();

            var query = _.filter(attDataCollection, function (n) {
                return n.AttributeIndex == dataFilterFactory.GetSelectedAttributeIndex();
            });
            if (query && query.length > 0) {
                loadDataFilterData(query[0].ScoreDataCollection);
            }
        });

        //Fore Reset by shahin aug 09-2015
        $scope.$on(Notify.DATA_FILTER_RESET, function (event) {
            dataFilterFactory.SetSelectedAttributeIndex(-1);
            $scope.ApplyFilterModelCollection = [];
            dataFilterFactory.SetAppliedDataFilterCollection($scope.ApplyFilterModelCollection);
            $scope.SelectedItems = [];
            $rootScope.$broadcast(Notify.DATA_FILTER_APPLIED);
        });

        //For Dataset change [Shahin Oct 12-2015]
        $scope.$on(Notify.DATASET_CHANGED,function(event){
            dataFilterFactory.SetSelectedAttributeIndex(-1);
        });

        //For Top level data filter count updating [Oct15-2015]
        $scope.$on(Notify.DATA_FILTER_APPLIED, function (event) {
            if ($scope.SeletectedTopLevelAttribute && $scope.SeletectedTopLevelAttribute.IsTopLevel === true) {
                if ($scope.ApplyFilterModelCollection.length > 0) {
                    var findItemTopLevelAppliedModel = _.find($scope.ApplyFilterModelCollection, {
                        Index:$scope.SeletectedTopLevelAttribute.Index,
                        Type: $scope.SeletectedTopLevelAttribute.Type,
                        IsTopLevelFilter: true
                    });

                    if (findItemTopLevelAppliedModel) {
                        var prefix = '', postfix = '', condition = '';
                        prefix = findItemTopLevelAppliedModel.VerticaColumnName + " in (";
                        postfix = findItemTopLevelAppliedModel.Ids.join(',') + ')';
                        condition = prefix + postfix;
                        dataFactory.ApplyTopLevelFilters(condition);
                    } else {
                        dataFactory.ApplyTopLevelFilters(null);
                    }
                } else {
                    dataFactory.ApplyTopLevelFilters(null);
                }


                //
                //if(dataFactory.GetAtributeScoreDataCollection() && dataFactory.GetAtributeScoreDataCollection().length > 0){
                //    var findItem = _.find(dataFactory.GetAtributeScoreDataCollection(), function (item) {
                //        return item.AttributeIndex === $scope.SeletectedTopLevelAttribute.Index;
                //    })
                //}

                $scope.SeletectedTopLevelAttribute = null;
                dataFilterFactory.SetSelectedAttributeIndex(-1);

            }

            if(dataFilterFactory.GetDataFilterResetClickedEvent() === true){
                if ($scope.IsTopLevelDataFilterApplied === true) {
                    dataFactory.ApplyTopLevelFilters(null);
                }
                dataFilterFactory.SetDataFilterResetClickedEvent(false);
            }
        });

        //$scope.$on(Notify.TOP_LEVEL_FILTER_DATA_READY, function (event) {
        //    var appliedTopLevelFilteredCollection =  dataFactory.GetTopLevelFilteredCollection();
        //    if(appliedTopLevelFilteredCollection && appliedTopLevelFilteredCollection.length > 0){
        //        if ($scope.SeletectedTopLevelAttribute && $scope.SeletectedTopLevelAttribute.IsTopLevel === true) {
        //
        //        }
        //    }
        //});

        function loadDataFilterData(data) {
            //TODO
            //console.log(data);
            //clearSelectedRows();
            var selectedServiceAreaId = dataFactory.GetSelectedServiceArea().Id;
            var preparedData = [];
            _.forEach(data, function (n, key) {
                var oDataFilterViewData = CreateViewDataFactory.DataFilterViewData(selectedServiceAreaId, n);
                oDataFilterViewData.$$treeLevel = 0;
                preparedData.push(oDataFilterViewData);
                if (n.IsGroup && n.GroupItemsScoreDataCollection && n.GroupItemsScoreDataCollection.length > 0) {
                    _.forEach(n.GroupItemsScoreDataCollection, function (n2) {
                        oDataFilterViewData = CreateViewDataFactory.DataFilterViewData(selectedServiceAreaId, n2);
                        oDataFilterViewData.IsChild = true;
                        oDataFilterViewData.parent = n.Name;
                        preparedData.push(oDataFilterViewData);
                    });
                }
            });
            $scope.gridPreparedData = preparedData;
            gridRefresh();

            //Sep20-2015
            //checkGroupItemsForUpdate();
        }

        function prepareSelectedAttributeServiceAreaData() {
            gridReset();
            var selectedAttribute = {
                Label: dataFilterFactory.GetSelectedAttribute().Label,
                Index: dataFilterFactory.GetSelectedAttribute().Index,
                Type: dataFilterFactory.GetSelectedAttribute().Type
            };

            var requestParam = attributeRequestParam(selectedAttribute);
            dataFactory.GetSelectedAttributeScoreData(requestParam);
        }

        function attributeRequestParam(attr) {
            var applicationDataInfo = dataFactory.DataInfo();
            var selectedSurveyType = dataFactory.GetSelectedServiceAreaSurveyType();

            //For applied top level data filter [Oct 20-2015]
            var gFilter = null, tFilter = null;
            if ($scope.ApplyFilterModelCollection.length > 0) {
                var findTopLevelAppliedModelItem = _.find($scope.ApplyFilterModelCollection, {
                    Type: attr.Type,
                    IsTopLevelFilter: true
                });

                if (findTopLevelAppliedModelItem && attr.Index !== findTopLevelAppliedModelItem.Index) {
                    var prefix = '', postfix = '', condition = '';
                    prefix = findTopLevelAppliedModelItem.VerticaColumnName + " in (";
                    postfix = findTopLevelAppliedModelItem.Ids.join(',') + ')';
                    tFilter = prefix + postfix;
                }
            }
            //End

            return {
                sessionID: applicationDataInfo.sessionID,
                customerID: applicationDataInfo.customerID,
                fromDate: applicationDataInfo.fromDate,
                toDate: applicationDataInfo.toDate,
                attributeIndex: attr.Index,
                surveyType: selectedSurveyType,
                gFilter:gFilter,
                tFilter:tFilter
            }
        }

        //$scope.gridOptions.data = gridPreparedData;
        //$scope.gridOptions.columnDefs =  $scope.columnDefs;

        $scope.columnDefs = [
            {
                field: 'Name', displayName: 'NAME', width: 175,
                //cellTemplate: '<div class="ui-grid-cell-contents" ng-class="{\'child-item\':row.entity.IsChild}"><input type="checkbox" name="chk" ng-checked="row.isSelected"/><i aria-hidden="true" ng-if="row.entity.IsGroup" ng-click="grid.appScope.toggleRow($event,row)" ng-class="{\'fa fa-play\': row.treeNode.state === \'collapsed\', \'fa fa-play fa-rotate-90\': row.treeNode.state === \'expanded\'}"></i> {{row.entity.Name}}</div>'
                //cellTemplate: '<div class="ui-grid-cell-contents name-column" ng-class="{\'child-item\':row.entity.IsChild}"><i aria-hidden="true" ng-if="row.entity.IsGroup" ng-click="grid.appScope.toggleRow($event,row)" ng-class="{\'fa fa-play\': row.treeNode.state === \'collapsed\', \'fa fa-play fa-rotate-90\': row.treeNode.state === \'expanded\'}" class="group-triangle"></i> <span class=\"lbl-name\" style="width: 170px">{{row.entity.Name}}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class=\"delete-group-btn\" ng-if="row.entity.IsGroup || row.entity.IsChild" ng-click="grid.appScope.onGroupDeleteBtnClickHandler($event,row)"><i class=\"fa fa-times\"></i></span></div>'
                cellTemplate: '<div class="ui-grid-cell-contents name-column" ng-class="{\'child-item\':row.entity.IsChild}"><i aria-hidden="true" ng-if="row.entity.IsGroup" ng-click="grid.appScope.toggleRow($event,row)" ng-class="{\'fa fa-play\': row.treeNode.state === \'collapsed\', \'fa fa-play fa-rotate-90\': row.treeNode.state === \'expanded\'}" class="group-triangle"></i> {{row.entity.Name}}</div>'
                //cellTemplate: '<div class="ui-grid-cell-contents name-column" ng-class="{\'child-item\':row.entity.IsChild}"><input type="checkbox" name="chk" ng-checked="row.isSelected"/><i aria-hidden="true" ng-if="row.entity.IsGroup" ng-click="grid.appScope.toggleRow($event,row)" ng-class="{\'fa fa-play\': row.treeNode.state === \'collapsed\', \'fa fa-play fa-rotate-90\': row.treeNode.state === \'expanded\'}" class="group-triangle"></i> {{row.entity.Name}}<span class=\"delete-group-btn\" ng-if="row.entity.IsGroup || row.entity.IsChild" ng-click="grid.appScope.onGroupDeleteBtnClickHandler($event,row)"><i class=\"fa fa-times\"></i></span></div>'
                , headerCellTemplate: 'Views/DataFilter/DataFilterNameHeaderTemplate.html'
                //    , cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                //    if (rowRenderIndex === (grid.rows.length-1)) {
                //        return 'last-item';
                //    }
                //}
            },
            {
                field: 'Name',displayName: '', width: 30,
                cellTemplate: '<div class="ui-grid-cell-contents name-column"><span class=\"delete-group-btn\" ng-if="row.entity.IsGroup || row.entity.IsChild" ng-click="grid.appScope.onGroupDeleteBtnClickHandler($event,row)"><i class=\"fa fa-times\"></i></span></div>'
            },
            {field: 'Score', displayName: 'SCORE', width: 80, cellClass: 'center-text', type: 'number'},
            {
                field: 'Respondent', displayName: '#RESP', width: 80, cellClass: 'center-text', type: 'number',
                sort: {
                    direction: uiGridConstants.DESC,
                    priority: 1
                }
            }];

        $scope.lastItem = function (grid, row) {

            var currentIndex = $scope.gridPreparedData.indexOf(row.entity);
            // console.log(grid);

            if (currentIndex === (grid.rows.length - 1)) {
                return 'last-item';
            }
        };

        $scope.gridOptions = {
            //data: 'gridPreparedData',
            enableSorting: true,
            rowHeight: 25,
            //columnDefs: $scope.columnDefs,
            enableColumnMenus: false,
            enableRowSelection: true,
            enableSelectAll: true,
            showTreeExpandNoChildren: false,
            showTreeRowHeader: false,
            selectionRowHeaderWidth: 20,
            treeRowHeaderAlwaysVisible: false,
            enableRowHeaderSelection: true,
            //rowTemplate: '<div><div id="{{rowRenderIndex}}" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell row-color" ui-grid-cell></div></div>'
            rowTemplate: 'Views/DataFilter/DataFilterRowTemplate.html'
        };

        $scope.gridOptions.columnDefs = $scope.columnDefs;
        $scope.gridOptions.enableFullRowSelection = true;
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                //$scope.SelectedItems = gridApi.selection.getSelectedRows();

                //if($scope.isDeleteButtonClicked === true) {
                //    $scope.isDeleteButtonClicked = false;
                //    return;
                //}

                if (row && row.isSelected) {
                    $scope.SelectedItems.push(row.entity);
                    if (row.treeNode && row.treeNode.children) {
                        row.treeNode.children.forEach(function (childNode) {
                            //childNode.row.isSelected = true;
                            childNode.row.setSelected(true);
                            $scope.SelectedItems.push(childNode.row.entity);
                        });
                    }
                } else if (row && !row.isSelected) {
                    var index = -1;
                    if ($scope.SelectedItems && $scope.SelectedItems.length > 0) {
                        index = $scope.SelectedItems.indexOf(row.entity);
                        if (index > -1) {
                            $scope.SelectedItems.splice(index, 1);
                        }
                        if (row.treeNode && row.treeNode.children.length > 0) {
                            var childIndex = -1;
                            row.treeNode.children.forEach(function (childNode) {
                                //childNode.row.isSelected = false;
                                childNode.row.setSelected(false);
                                childIndex = $scope.SelectedItems.indexOf(childNode.row.entity);
                                if (childIndex > -1) {
                                    $scope.SelectedItems.splice(childIndex, 1);
                                }
                            });
                        }
                    }
                }

                //Aug 10-2015
                if (row.treeNode && row.treeNode.parentRow && row.treeNode.parentRow.entity) {
                    if (row.treeNode.parentRow.entity.IsGroup === true) {
                        var _isCheckParent = false;
                        var _checkCount = 0;
                        if (row.treeNode.parentRow.treeNode && row.treeNode.parentRow.treeNode.children.length > 0) {
                            _.forEach(row.treeNode.parentRow.treeNode.children, function (item) {
                                if (item.row.isSelected)
                                    _checkCount++;
                            });
                            if (_checkCount > 0 && _checkCount === row.treeNode.parentRow.treeNode.children.length) {
                                _isCheckParent = true;
                            }
                        }
                        if (_isCheckParent === true) {
                            //$scope.gridApi.selection.selectRow(row.treeNode.parentRow.entity);
                            row.treeNode.parentRow.setSelected(true);
                        } else {
                            row.treeNode.parentRow.setSelected(false);
                        }


                    }
                }
                //End
                $scope.gridApi.grid.api.selection.raise.rowSelectionChangedBatch();
                onCheckGroupItemSelection();
            });

            gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
                //var msg = 'rows changed ' + rows.length;
                //console.log(msg);
                //$scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
                $timeout(function () {
                    //var tmp = $scope.gridApi.selection.getSelectAllState();
                    //console.log($scope.gridApi.selection.getSelectAllState());

                    //if($scope.gridApi.selection.getSelectAllState()){
                    //    $scope.SelectedItems = $scope.gridApi.selection.getSelectedRows();
                    //} else{
                    //    $scope.SelectedItems = $scope.gridApi.selection.getSelectedRows();
                    //}
                    //$scope.gridApi.selection.selectAll = $scope.gridApi.selection.getSelectAllState();


                    $scope.gridApi.selection.selectAll = false;
                    $scope.gridApi.grid.selection.selectAll = false;
                    var tmp = $scope.gridApi.selection.getSelectedRows();
                    $scope.SelectedItems = $scope.gridApi.selection.getSelectedRows();
                    //if ($scope.gridApi.grid.selection.selectedCount > 0) {
                    //    $scope.SelectedItems = $scope.gridApi.selection.getSelectedRows();
                    //    $scope.gridApi.selection.selectAll = $scope.gridApi.grid.rows.length === $scope.gridApi.grid.selection.selectedCount;
                    //    $scope.gridApi.grid.selection.selectAll = $scope.gridApi.grid.rows.length === $scope.gridApi.grid.selection.selectedCount;
                    //}

                    if (tmp && tmp.length > 0) {
                        if ($scope.gridApi.grid.rows.length === tmp.length) {
                            $scope.gridApi.selection.selectAll = true;
                            $scope.gridApi.grid.selection.selectAll = true;
                        }
                    }

                }, 50).then(function () {
                    onCheckGroupItemSelection();
                    //Sep20-2015
                    //UpdateAppliedGroupName();

                });
            });

        };//

        //$interval(function () {
        //    $scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);
        //}, 0, 1);

        function gridRefresh() {
            $scope.gridOptions.data = $scope.gridPreparedData;
            $scope.gridApi.grid.refresh();
            if ($scope.ApplyFilterModelCollection && $scope.ApplyFilterModelCollection.length > 0) {
                $timeout(function () {
                    selectAppliedRows();
                }, 100);
            }
        }

        function gridReset() {
            $scope.gridPreparedData = [];
            $scope.gridOptions.data = $scope.gridPreparedData;
            $scope.gridApi.grid.refresh();
        }

        function updateDataFilerScoreAndRespondent() {
            if ($scope.gridPreparedData && $scope.gridPreparedData.length > 0) {
                //DataFilterViewData
                var tmp = _.forEach($scope.gridPreparedData, function (oDataFilterViewData) {
                    oDataFilterViewData.SelectedServiceAreaScoreData(dataFactory.GetSelectedServiceArea().Id);
                });
                $scope.gridPreparedData = tmp;
            }
        }

        /**
         * Clear all selected rows
         */
        function clearSelectedRows() {
            if ($scope.gridApi) {
                $scope.gridApi.selection.clearSelectedRows();
                //$scope.gridApi.selection.selectAll = false;
                //$scope.gridApi.grid.selection.selectAll = false;
                //$scope.gridApi.grid.refresh();
            }
        }

        /**
         * Select all Applied Rows
         */
        function selectAppliedRows() {
            if ($scope.gridApi.selection.selectRow) {
                //$scope.CheckedSelectedAttributeColl = _.forEach($scope.ApplyFilterModelCollection, function (attr) {
                //    return attr.Index === dataFilterFactory.GetSelectedAttributeIndex();
                //});
                var SelectedAttribute = dataFilterFactory.GetSelectedAttribute();
                $scope.CheckedSelectedAttributeColl = _.filter($scope.ApplyFilterModelCollection, function (attr) {
                    return (attr.Index === SelectedAttribute.Index && attr.Type === SelectedAttribute.Type);
                });

                if ($scope.CheckedSelectedAttributeColl && $scope.CheckedSelectedAttributeColl.length > 0) {
                    //var temp = $filter('arrayIds')($scope.gridOptions.data, currentSelectAttributeColl[0].Ids);
                    //if ($scope.gridOptions.data.length === currentSelectAttributeColl[0].Ids.length) {
                    //    $scope.gridApi.selection.selectAllRows();
                    //    return;
                    //}

                    $scope.gridApi.selection.clearSelectedRows();

                    _.forEach($scope.gridOptions.data, function (item) {
                        //return (currentSelectAttributeColl[0].Ids.indexOf(item.Id) !== -1);
                        if ($scope.CheckedSelectedAttributeColl[0].Ids.indexOf(item.Id) !== -1) {
                            $scope.gridApi.selection.selectRow(item);
                            //$scope.gridApi.grid.api.selection.raise.rowSelectionChanged($scope.gridApi.selection.selectRow(item));
                        }
                    });

                    //$scope.gridApi.grid.api.selection.raise.rowSelectionChangedBatch();


                    //$scope.gridApi.selection.selectAll = false;
                    //$scope.gridApi.grid.selection.selectAll = false;
                    //var tmp = $scope.gridApi.selection.getSelectedRows();
                    //
                    //if ($scope.gridApi.grid.rows.length === tmp.length) {
                    //    $scope.gridApi.selection.selectAll = true;
                    //    $scope.gridApi.grid.selection.selectAll = true;
                    //}

                    //Sep 21-2015 for update group name while creating from applied orphan item

                    var newGrpItem = dataFactory.getNewGroupItem();

                    if(newGrpItem === null) return;
                    dataFactory.setNewGroupItem(null);

                    var SelectedItems = $scope.gridApi.selection.getSelectedRows();
                    var oSelectedAttribute = dataFilterFactory.GetSelectedAttribute();

                    var selectItemIds = [],
                        attrValue = '',
                        isFilterValueChanged = false;

                    _.forEach(SelectedItems, function (item) {
                        if (item.IsGroup === true) {
                            return;
                        }
                        selectItemIds.push(item.Id);
                    });


                    var tmpGroupChecked = _.keysIn(_.groupBy(_.filter(SelectedItems, function (n) {
                        return n.parent !== null;
                    }), 'parent'));

                    var tmpNullParentChecked = _.keysIn(_.groupBy(_.filter(SelectedItems, function (n) {
                        return (n.IsGroup === false && n.parent === null);
                    }), 'parent'));

                    if (tmpGroupChecked && tmpGroupChecked.length === 1 && tmpNullParentChecked.length === 0 && selectItemIds.length > 1) {
                        attrValue = tmpGroupChecked[0];

                        _.forEach($scope.ApplyFilterModelCollection, function (n) {
                            if (n.Index === oSelectedAttribute.Index && n.Type === oSelectedAttribute.Type && attrValue !== n.Value) {
                                n.Value = attrValue;
                                isFilterValueChanged = true;
                                return true;
                            }
                        });

                    }

                    if(isFilterValueChanged === true) {
                        dataFilterFactory.SetAppliedDataFilterCollection($scope.ApplyFilterModelCollection);
                        $rootScope.$broadcast(Notify.DATA_FILTER_GROUP_CHANGED);
                    }
                }
            }
        }


        $scope.toggleRow = function (event, row) {
            //$scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[rowNum]);
            $scope.gridApi.treeBase.toggleRowTreeState(row);
            event.preventDefault();
            event.stopPropagation();
        };

        /* Row hovering event handler
         ======================================================*/

        $scope.rowHover = function (row) {
            //console.log('row hover...');
        };

        $scope.rowHoverOut = function (row) {
            //console.log('row hover out...');
        };

        /* Apply button event
         ======================================================*/
        $scope.btnApplyEventHandler = function () {
            var oSelectedAttribute = dataFilterFactory.GetSelectedAttribute();

            //For Top level data filter attribute [oct 15-2015]
            if(oSelectedAttribute.IsTopLevel  === true){
                $scope.SeletectedTopLevelAttribute = oSelectedAttribute;
            } else {
                $scope.SeletectedTopLevelAttribute = null;
            }//End of For Top level data filter attribute

            if ($scope.SelectedItems.length === 0 && $scope.ApplyFilterModelCollection.length === 0) return;

            if ($scope.SelectedItems.length === 0) {
                //$scope.ApplyFilterModelCollection = [];
                if ($scope.ApplyFilterModelCollection.length > 0) {
                    var findItem1 = _.find($scope.ApplyFilterModelCollection, {
                        Type: oSelectedAttribute.Type,
                        Index: oSelectedAttribute.Index
                    });

                    //For Top level data filter oct14-2015
                    if(findItem1.IsTopLevelFilter === true){
                        var findOtherItemInTopLevel = _.find($scope.ApplyFilterModelCollection, {
                            Type: oSelectedAttribute.Type,
                            IsTopLevelFilter:false
                        });

                        var otherItemInTopLevelDelIndex = _.indexOf($scope.ApplyFilterModelCollection, findOtherItemInTopLevel);
                        if (otherItemInTopLevelDelIndex >= 0) {
                            $scope.ApplyFilterModelCollection.splice(otherItemInTopLevelDelIndex, 1);
                        }
                    }  //End of For Top level data filter

                    var delIndex1 = _.indexOf($scope.ApplyFilterModelCollection, findItem1);
                    if (delIndex1 >= 0) {
                        $scope.ApplyFilterModelCollection.splice(delIndex1, 1);
                    }
                }

                //dataFilterFactory.SetAppliedDataFilterCollection($scope.ApplyFilterModelCollection);
                //dataFactory.ResetFilter();
                //dataFilterFactory.SetDataFilterApplyBtnClickedEvent(true);
                //return;
            }
            //var oSelectedAttribute = dataFilterFactory.GetSelectedAttribute();

            if ($scope.ApplyFilterModelCollection.length > 0) {
                //var findItem = _.find($scope.ApplyFilterModelCollection, {Type: oSelectedAttribute.Type});
                var findItem = _.find($scope.ApplyFilterModelCollection, {Type: oSelectedAttribute.Type,IsTopLevelFilter:oSelectedAttribute.IsTopLevel});
                var delIndex = _.indexOf($scope.ApplyFilterModelCollection, findItem);
                if (delIndex >= 0) {
                    $scope.ApplyFilterModelCollection.splice(delIndex, 1);
                }

                //For top level data filter apply reset same category type attribute filter
                if(oSelectedAttribute.IsTopLevel  === true){
                    var findOtherItemInTopLevel2 = _.find($scope.ApplyFilterModelCollection, {
                        Type: oSelectedAttribute.Type,
                        IsTopLevelFilter:false
                    });

                    var otherItemInTopLevelDelIndex2 = _.indexOf($scope.ApplyFilterModelCollection, findOtherItemInTopLevel2);
                    if (otherItemInTopLevelDelIndex2 >= 0) {
                        $scope.ApplyFilterModelCollection.splice(otherItemInTopLevelDelIndex2, 1);
                    }
                }//End For top level
            }

            var selectItemIds = [];
            //var isGroupSelected = false;
            var selectedGroupName = '';
            var groupCount =0;
            _.forEach($scope.SelectedItems, function (item) {
                if (item.IsGroup === true){
                    selectedGroupName = item.Name;
                    groupCount++;
                    return;
                }
                selectItemIds.push(item.Id);
            });

            var attrValue = '';
            attrValue = oSelectedAttribute.Label;
            if (selectItemIds.length === 1) {
                var _fSel = _.find($scope.SelectedItems, {IsGroup: false, Id: selectItemIds[0]});
                if (_fSel) {
                    attrValue = _fSel.Name;
                }
                //Commented by shahin aug10[4.20pm]
                //attrValue = $scope.SelectedItems[0].Name;
            }
            var dfAttrLbl = attrValue;
            //For group name selected with multiple value checked GroupItemsScoreDataCollection
            //if(groupCount === 1 && selectItemIds.length > 1) {
            //    attrValue = selectedGroupName;
            //}

            //Sep16-2015[4.30pm]
           var tmpGroupChecked = _.keysIn(_.groupBy(_.filter($scope.SelectedItems, function(n) {
               return n.parent !== null;
           }),'parent'));

            var tmpNullParentChecked = _.keysIn(_.groupBy(_.filter($scope.SelectedItems, function(n) {
                return (n.IsGroup === false && n.parent === null);
            }),'parent'));

            if(tmpGroupChecked && tmpGroupChecked.length === 1 && tmpNullParentChecked.length === 0 && selectItemIds.length > 1) {
                attrValue = tmpGroupChecked[0];
            }

            var oApplyFilterModel = dataFilterFactory.ApplyFilterModel(oSelectedAttribute.Index, oSelectedAttribute.Type, oSelectedAttribute.VerticaColumnName, selectItemIds, attrValue, dfAttrLbl,oSelectedAttribute.IsTopLevel,oSelectedAttribute.OnlyTicketData);

            if (oApplyFilterModel.Ids && oApplyFilterModel.Ids.length > 0)
                $scope.ApplyFilterModelCollection.push(oApplyFilterModel);

            if ($scope.ApplyFilterModelCollection && $scope.ApplyFilterModelCollection.length > 0) {
                prepareApplyData($scope.ApplyFilterModelCollection);
            } else {
                dataFactory.ResetFilter();
            }

            dataFilterFactory.SetAppliedDataFilterCollection($scope.ApplyFilterModelCollection);
            //Close DataFilter window event
            dataFilterFactory.SetDataFilterApplyBtnClickedEvent(true);

            $scope.SelectedItems = [];
        };

        function prepareAttributeRoute() {
            return '/' + dataFactory.DataInfo().customerID + '/' + dataFactory.DataInfo().sessionID;
        }

        function prepareApplyData(coll) {
            var genFilter = _.filter(coll, function (item) {
                return item.Type !== 2 && item.IsOnlyTicketData === false;
            });

            var trigFilter = _.filter(coll, function (item) {
                return (item.Type === 2 || item.IsOnlyTicketData === true);
            });


            if(genFilter === null || (genFilter && genFilter.length === 0)) {
                dataFactory.resetgFilter(null);
            }

            if(trigFilter === null || (trigFilter && trigFilter.length === 0)) {
                dataFactory.resettFilter(null);
            }

            if (genFilter && genFilter.length > 0)
                dataFactory.setGeneralApplyFilter(prepareApplyFilterParams(genFilter));

            if (trigFilter && trigFilter.length > 0)
                dataFactory.setTriggerApplyFilter(prepareApplyFilterParams(trigFilter));
        }

        function prepareApplyFilterParams(coll) {
            var filterString = '', count = 0;
            _.forEach(coll, function (item) {
                count++;
                var prefix = '', postfix='';
                if(item.Index === 11 || item.Index === 12 || item.Index === 48) {
                    prefix = "TO_CHAR(Fact." + item.VerticaColumnName + ",'mm/dd/yyyy') in ('";
                    postfix = item.Ids.join('\',\'') + "')";
                } else {
                    prefix = "Fact." + item.VerticaColumnName + " in (";
                    postfix = item.Ids.join(',') + ')';
                }

                filterString += prefix + postfix;
                filterString += coll.length !== count ? " AND " : '';
            });
            return filterString;
        }

        $scope.onAddToGroupClickHandler = function () {
            //$scope.ddlColl = [];
            //var defaultGroup = {Id: 0, Name: 'Select group'};
            //$scope.ddlColl.push(defaultGroup);
            dataFactory.setNewGroupItem(null);
            $scope.ddlColl = prepareExistingGroupColl();

            var data = $scope.gridApi.selection.getSelectedRows();

            var modalInstance = $modal.open({
                animation: false,
                templateUrl: 'Views/DataFilter/AddToGroupWindowTemplate.html',
                controller: 'addToGroupController',
                resolve: {
                    items: function () {
                        return data;
                    },
                    ddlColl: function () {
                        return $scope.ddlColl;
                    }
                }, keyboard: false,
                backdrop: 'static',
                windowClass: 'add-to-group-window-modal'

            });

            modalInstance.result.then(function (Group) {
                //$scope.finalItems = selectedItems;
                //console.log($scope.finalItems);

                if (Group.Items.length > 0) {
                    var _Ids = _.pluck(Group.Items, 'Id');
                    var groupItems = _.pluck(Group.Items, 'Name');

                    var oDimensionValueGroupModel = CreateViewDataFactory.DimensionValueGroupModel(Group.GroupName, groupItems);
                    dataFactory.setNewGroupItem({
                        AttributeIndex: dataFilterFactory.GetSelectedAttributeIndex(),
                        Name: Group.GroupName,
                        Ids: _Ids,
                        IsAddInExistingGroup: Group.IsAddInExistingGroup,
                        ExistingGroupItems: Group.ExistingGroupItems
                    });

                    dataFactory.CreateDimensinoValueGroup(oDimensionValueGroupModel, prepareAddtoGroupAttributeRoute());
                }

            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };//

        function prepareAddtoGroupAttributeRoute() {
            return '/' + dataFactory.DataInfo().customerID + '/' + dataFilterFactory.GetSelectedAttribute().Index + '/' + dataFactory.DataInfo().sessionID;
        }

        $scope.onGroupDeleteBtnClickHandler = function (event, row) {
            event.preventDefault();
            event.stopPropagation();

            var isAppliedGropDelete = false;
            //$scope.isDeleteButtonClicked = true;
            if(row.entity) {
                console.log($scope.ApplyFilterModelCollection);
                var oSelectedAttribute = dataFilterFactory.GetSelectedAttribute();
                var findAppItem;
                if ($scope.ApplyFilterModelCollection.length > 0) {
                    findAppItem = _.find($scope.ApplyFilterModelCollection, {
                        Type: oSelectedAttribute.Type,
                        Index: oSelectedAttribute.Index
                    });
                }

                var dfGroupItem = row.entity;
                var dfAppliedIds = dfGroupItem.Id.split(',');
                var count =0;
                for(var i=0;i<dfAppliedIds.length; i++) {
                    if(findAppItem && findAppItem.Ids.length > 0) {
                        var itemFound = _.find(findAppItem.Ids, function(item){
                            return item === dfAppliedIds[i];
                        });

                        if(itemFound) {
                            count++;
                        }
                    }
                }

                //if(dfAppliedIds.length === count) {
                //    console.log('IsGroup All item applied');
                //}

                if(count > 0) {
                    console.log('IsGroup All item applied');
                    isAppliedGropDelete = true;
                }

                //onGroupDeleteWarningMsg();
                //return;
            }

            if(isAppliedGropDelete === true) {
                onGroupDeleteWarningMsg();
            } else {
                onGroupDeleteConfirmationMsg(row);
            }


            //var delGroupItems = [], groupName = '', _Ids = [];
            //if (row && row.entity) {
            //    if (row.entity.IsGroup) {
            //        groupName = row.entity.Name;
            //        if (row.treeNode && row.treeNode.children) {
            //            row.treeNode.children.forEach(function (childNode) {
            //                _Ids.push(childNode.row.entity.Id);
            //                delGroupItems.push(childNode.row.entity.Name);
            //            });
            //        }
            //    } else {
            //        if (row.treeNode && row.treeNode.parentRow && row.treeNode.parentRow.entity) {
            //            groupName = row.treeNode.parentRow.entity.Name;
            //        }
            //        _Ids.push(row.entity.Id);
            //        delGroupItems.push(row.entity.Name);
            //    }
            //    var oDimensionValueGroupDeleteModel = CreateViewDataFactory.DimensionValueGroupDeleteModel(groupName, row.entity.IsGroup, delGroupItems);
            //
            //    dataFactory.setDelGroupItem({
            //        AttributeIndex: dataFilterFactory.GetSelectedAttributeIndex(),
            //        Name: groupName,
            //        IsGroupDelete: row.entity.IsGroup,
            //        Ids: _Ids
            //    });
            //    dataFactory.DeleteDimensinoValueGroup(oDimensionValueGroupDeleteModel, prepareAddtoGroupAttributeRoute());
            //}

        };//

        function prepareExistingGroupColl() {

            var existingGroup = [];
            var defaultGroup = {Id: 0, Name: 'Select group', Items: []};
            existingGroup.push(defaultGroup);

            var filterOutExistingGroups = _.filter($scope.gridOptions.data, function (item) {
                return item.IsGroup === true;
            });

            _.forEach(filterOutExistingGroups, function (gItem) {
                var existingGroupItems = [];
                var tmpIds = gItem.Id.split(',');
                _.forEach(tmpIds, function (id) {
                    var foundItem = _.find($scope.gridOptions.data, {Id: id, IsChild: true});
                    if (foundItem) {
                        existingGroupItems.push(foundItem);
                    }
                });
                existingGroup.push({Id: gItem.Id, Name: gItem.Name, Items: existingGroupItems});
            });

            return existingGroup;
        }

        $scope.$on(Notify.DATAFILTER_GROUP_DELETED, function (event) {
            if ($scope.ExistingGroupItemAddModel) {
                dataFactory.CreateDimensinoValueGroup($scope.ExistingGroupItemAddModel, prepareAddtoGroupAttributeRoute());
                $scope.ExistingGroupItemAddModel = null;
            }
        });

        //Check Group item is selected
        function onCheckGroupItemSelection() {
            //$scope.IsAddToGroupBtnEnabled = false;
            //if($scope.SelectedItems.length > 0) {
            //    var _foundItems = _.findWhere($scope.SelectedItems, {IsGroup: true});
            //    if (_foundItems) {
            //        $scope.IsAddToGroupBtnEnabled = true;
            //    }
            //} else{
            //
            //}

            $scope.IsAddToGroupBtnEnabled = false;
            var _foundItems = _.findWhere($scope.SelectedItems, {IsGroup: true});
            var _childrenItems = _.reject($scope.SelectedItems,{parent:null});

            if ($scope.SelectedItems.length === 0) {
                $scope.IsAddToGroupBtnEnabled = true;
            } else if ($scope.SelectedItems.length > 0 && _foundItems) {
                $scope.IsAddToGroupBtnEnabled = true;
            } else if ($scope.SelectedItems.length > 0 && _childrenItems && _childrenItems.length > 0) {
                $scope.IsAddToGroupBtnEnabled = true;
            }

        }

        //Update GroupName while creating group with applied value
        function checkGroupItemsForUpdate(){
            var newGrpItem = dataFactory.getNewGroupItem();
            var oSelectedAttribute = dataFilterFactory.GetSelectedAttribute();

            if(newGrpItem === null) return;

            if ($scope.ApplyFilterModelCollection && $scope.ApplyFilterModelCollection.length > 0) {
                //var findItem1 = _.find($scope.ApplyFilterModelCollection, {
                //    Index: oSelectedAttribute.Index,
                //    Type: oSelectedAttribute.Type
                //});
                //var _index = _.indexOf($scope.ApplyFilterModelCollection, findItem1);
                //if (_index < 0) {
                //    return;
                //} else{
                //
                //    var _ids = _.pick(newGrpItem,'Ids');
                //
                //}

                //var _ids = _.pick(newGrpItem,'Ids');
                //var idArr = _ids.split(',');
                var isFound = false;

                _.forEach($scope.ApplyFilterModelCollection, function (n) {
                    if (n.Index === newGrpItem.AttributeIndex) {

                        //n.Value = attrValue;

                        for (var i=0;i<newGrpItem.Ids.length;i++) {
                            var _idIndex = n.Ids.indexOf(newGrpItem.Ids[i]);
                            isFound = _idIndex > -1;

                            //if(_idIndex > -1) {
                            //    isFound = true;
                            //} else {
                            //    isFound = false;
                            //}
                        }

                        if(isFound === true){
                            n.Value = newGrpItem.Name;
                        }
                    }
                });

                if(isFound === true) {
                    dataFilterFactory.SetAppliedDataFilterCollection($scope.ApplyFilterModelCollection);
                    $rootScope.$broadcast(Notify.DATA_FILTER_GROUP_CHANGED);
                }

            }
            dataFactory.setNewGroupItem(null);
            console.log($scope.ApplyFilterModelCollection);
        }

        function onGroupDeleteWarningMsg() {
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: 'Views/DataFilter/ConfirmationWindowTemplate.html',
                controller: 'confirmationWindowController',
                resolve: {
                },
                keyboard: false,
                backdrop: 'static',
                windowClass:'confirmation-modal'

            });

            modalInstance.result.then(function (Group) {

            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        }


        function onGroupDeleteConfirmationMsg(row) {
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: 'Views/DataFilter/GroupDeleteConfirmationWindowTemplate.html',
                controller: 'groupDeleteConfirmationWindowController',
                resolve: {
                    IsGroupDelete: function () {
                        return row && row.entity.IsGroup ? true : false;
                    }
                },
                keyboard: false,
                backdrop: 'static',
                windowClass:'group-delete-modal'

            });

            modalInstance.result.then(function (data) {
                if(data.IsOkBtnClicked === true) {
                    var delGroupItems = [], groupName = '', _Ids = [];
                    if (row && row.entity) {
                        if (row.entity.IsGroup) {
                            groupName = row.entity.Name;
                            if (row.treeNode && row.treeNode.children) {
                                row.treeNode.children.forEach(function (childNode) {
                                    _Ids.push(childNode.row.entity.Id);
                                    delGroupItems.push(childNode.row.entity.Name);
                                });
                            }
                        } else {
                            if (row.treeNode && row.treeNode.parentRow && row.treeNode.parentRow.entity) {
                                groupName = row.treeNode.parentRow.entity.Name;
                            }
                            _Ids.push(row.entity.Id);
                            delGroupItems.push(row.entity.Name);
                        }
                        var oDimensionValueGroupDeleteModel = CreateViewDataFactory.DimensionValueGroupDeleteModel(groupName, row.entity.IsGroup, delGroupItems);

                        dataFactory.setDelGroupItem({
                            AttributeIndex: dataFilterFactory.GetSelectedAttributeIndex(),
                            Name: groupName,
                            IsGroupDelete: row.entity.IsGroup,
                            Ids: _Ids
                        });
                        dataFactory.DeleteDimensinoValueGroup(oDimensionValueGroupDeleteModel, prepareAddtoGroupAttributeRoute());
                    }
                }
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        }


    }]);//

});
