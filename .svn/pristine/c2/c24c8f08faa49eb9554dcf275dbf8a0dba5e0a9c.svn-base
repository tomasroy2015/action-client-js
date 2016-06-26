"use strict";

define(['application-configuration'], function (app) {

    //app.register.filter('removeSpacesThenLowercase', function () {
    //    return function (text) {
    //        var str = text.replace(/\s+/g, '');
    //        return str.toLowerCase();
    //    };
    //});

    app.register.directive('actionDataFilterAccordion', ['$rootScope', 'leftMenuSlidingWindowEventNotifyFactory', '$timeout', function ($rootScope, leftMenuSlidingWindowEventNotifyFactory, $timeout) {

        return {
            restrict: 'AE',
            scope: {
                categorizedAttributeCollection: "=data",
                attributeClicked: '&',
                control: '='
            },
            link: function (scope, el, attrs) {
                scope.internalControl = scope.control || {};
                scope.isDataFilterWindowSlideIn = false;
                scope.isTopLevelDataFilterWindowSlideIn = false;
                var containerWidth;
                var topPadding = 50;

                scope.$watch('categorizedAttributeCollection', function (newValue) {
                    if (!angular.isUndefined(newValue))
                        return scope.renderView(newValue);
                }, true);

                scope.renderView = function (data) {
                    scope.oneAtATime = true;
                    scope.categorizedAttributeCollection = data;
                };

                scope.selectedListItem = function (event, data) {
                    //var toSelectItem = '#' + event.currentTarget.id;
                    var toSelectItem = event.currentTarget.id;
                    var prevSelectedItems = $("div[id^='accordion-panel'] .df-selected").not('#' + toSelectItem);

                    prevSelectedItems.removeClass('df-selected');
                    $('#' + toSelectItem).toggleClass('df-selected');

                    //$("div[id^='accordion-panel'] .applied-df-count").addClass('df-selected');

                    //Top level attr [Oct13-2015]
                    var prevSelectedTopLevelItem = $("div[id^='accordion-panel'] .applied-top-level-data-filter");
                    if(prevSelectedTopLevelItem != undefined){
                        onCloseTopLevelDataFilterSlidingWindow();
                        prevSelectedTopLevelItem.removeClass('applied-top-level-data-filter');
                    }


                    //containerWidth = $('#dataFilterWindowContainer').width();
                    var prevSelId = prevSelectedItems.attr('id');

                    if (prevSelId !== undefined && prevSelId !== toSelectItem) {
                        closeDataFilterSlidingWindow();
                    }

                    dataFilterWindowSliding();
                    data.isDataFilterWindowOpen = scope.isDataFilterWindowSlideIn;
                    event.data = data;
                    scope.attributeClicked()(event);
                };

                scope.expandCollapsed = function ($event, isExpand) {
                    //$event.preventDefault();
                    //$event.stopPropagation();

                    //$("div[id^='accordion-panel'] .df-selected").removeClass('df-selected');
                    //closeDataFilterSlidingWindow();

                    $timeout(function () {
                        //$("div[id^='accordion-panel'] .df-selected").removeClass('df-selected');
                        //closeDataFilterSlidingWindow();
                        onClosingDataFilterWindowHandler();
                        onClosingTopLevelDataFilterWindowHandler();
                    }, 500);
                };

                function dataFilterWindowSliding() {
                    containerWidth = $('#dataFilterWindowContainer').width();
                    $('#dataFilterWindowContainer.slide-out').css('top', topPadding + 'px');
                    scope.isDataFilterWindowSlideIn = !scope.isDataFilterWindowSlideIn;
                    if (scope.isDataFilterWindowSlideIn) {
                        $('#dataFilterWindowContainer.slide-out').animate({left: 253}, 500, "linear", function () {
                        });
                    } else {
                        closeDataFilterSlidingWindow();
                    }
                }

                $('#dataFilterWindowContainer .close-slide-in').on('click', function () {
                    //$("div[id^='accordion-panel'] .df-selected").removeClass('df-selected');
                    ////$("div[id^='accordion-panel'] .df-selected").not('.applied-df-count').removeClass('df-selected');
                    //closeDataFilterSlidingWindow();
                    onClosingDataFilterWindowHandler();
                    onClosingTopLevelDataFilterWindowHandler();
                });

                function closeDataFilterSlidingWindow() {
                    $('#dataFilterWindowContainer.slide-out').animate({left: -containerWidth - 253}, 500, "linear");
                    scope.isDataFilterWindowSlideIn = false;
                }

                function onClosingDataFilterWindowHandler(){
                    $("div[id^='accordion-panel'] .df-selected").removeClass('df-selected');
                    //$("div[id^='accordion-panel'] .df-selected").not('.applied-df-count').removeClass('df-selected');
                    closeDataFilterSlidingWindow();
                }

                scope.internalControl.isDataFilterWindowOpen = function () {
                    return scope.isDataFilterWindowSlideIn;
                };

                scope.internalControl.closeDataFilterWindowHandler = function () {
                    //$("div[id^='accordion-panel'] .df-selected").removeClass('df-selected');
                    ////$("div[id^='accordion-panel'] .df-selected").not('.applied-df-count').removeClass('df-selected');
                    //closeDataFilterSlidingWindow();
                    onClosingDataFilterWindowHandler();
                };

                scope.onResetClickHandler = function () {
                    scope.internalControl.onResetBtnClick();
                };

                scope.$watchCollection(function () {
                    return (scope.internalControl.AppliedDataFilterCollection);
                }, function (nVal) {
                    scope.AppliedDataFilterCollection = nVal;
                });

                scope.FilterCount = function (index) {
                    if (scope.AppliedDataFilterCollection && scope.AppliedDataFilterCollection.length > 0) {
                        var itm = _.find(scope.AppliedDataFilterCollection, {Index: index});
                        return itm ? itm.Ids.length : 0;
                    } else {
                        return 0;
                    }
                };

                scope.FilterCount2 = function (index) {
                    if (scope.AppliedDataFilterCollection && scope.AppliedDataFilterCollection.length > 0) {
                        var itm = _.find(scope.AppliedDataFilterCollection, {Type: index, IsTopLevelFilter:false});
                        return itm ? itm.Ids.length : 0;
                    } else {
                        return 0;
                    }
                };

                /**
                 * @return {string}
                 */
                scope.DataFilterCollapsedLabel = function (type) {
                    if (scope.AppliedDataFilterCollection && scope.AppliedDataFilterCollection.length > 0) {
                        var itm = _.find(scope.AppliedDataFilterCollection, {Type: type,IsTopLevelFilter:false});
                        return itm ? itm.AttrLabel : '';
                    }
                    return '';
                };

                /**
                 * Top level attribute click event
                 */
                scope.onTopLevelAttrClickHandler = function (event, data) {
                    console.log('top level click');
                    var toSelectItem = event.currentTarget.id;
                    $('#' + toSelectItem).toggleClass('applied-top-level-data-filter');

                    var prevSelectedOtherTopLevelItem = $("div[id^='accordion-panel'] .df-selected");
                    if(prevSelectedOtherTopLevelItem != undefined){
                        closeDataFilterSlidingWindow();
                        prevSelectedOtherTopLevelItem.removeClass('df-selected');
                    }

                    onTopLevelDataFilterWindowSliding();
                    data.isDataFilterWindowOpen = scope.isTopLevelDataFilterWindowSlideIn;
                    event.data = data;
                    scope.attributeClicked()(event);
                };

                function onCloseTopLevelDataFilterSlidingWindow() {
                    $('#dataFilterWindowContainer.slide-out').animate({left: -containerWidth - 253}, 500, "linear");
                    scope.isTopLevelDataFilterWindowSlideIn = false;
                }

                function onClosingTopLevelDataFilterWindowHandler(){
                    $("div[id^='accordion-panel'] .applied-top-level-data-filter").removeClass('applied-top-level-data-filter');
                    onCloseTopLevelDataFilterSlidingWindow();
                }

                function onTopLevelDataFilterWindowSliding() {
                    containerWidth = $('#dataFilterWindowContainer').width();
                    $('#dataFilterWindowContainer.slide-out').css('top', topPadding + 'px');
                    scope.isTopLevelDataFilterWindowSlideIn = !scope.isTopLevelDataFilterWindowSlideIn;
                    if (scope.isTopLevelDataFilterWindowSlideIn) {
                        $('#dataFilterWindowContainer.slide-out').animate({left: 253}, 500, "linear", function () {
                        });
                    } else {
                        onCloseTopLevelDataFilterSlidingWindow();
                    }
                }


                scope.internalControl.isTopLevelDataFilterWindowOpen = function () {
                    return scope.isTopLevelDataFilterWindowSlideIn;
                };

                scope.internalControl.closeTopLevelDataFilterWindowHandler = function () {
                    //$("div[id^='accordion-panel'] .df-selected").removeClass('df-selected');
                    ////$("div[id^='accordion-panel'] .df-selected").not('.applied-df-count').removeClass('df-selected');
                    //closeDataFilterSlidingWindow();
                    onClosingTopLevelDataFilterWindowHandler();
                };


                /**
                 * Top level applied filter count
                 * @param index
                 * @returns {*}
                 * @constructor
                 */
                scope.TopLevelFilterCount = function (item) {
                    if (scope.AppliedDataFilterCollection && scope.AppliedDataFilterCollection.length > 0) {
                        var itm = _.find(scope.AppliedDataFilterCollection, {Type: item.Type, IsTopLevelFilter:true});
                        return itm ? itm.Ids.length : 0;
                    } else {
                        return 0;
                    }
                };

                /**
                 * Top level applied filter label
                 * @return {string}
                 */
                scope.TopLevelDataFilterCollapsedLabel = function (item) {
                    if (scope.AppliedDataFilterCollection && scope.AppliedDataFilterCollection.length > 0) {
                        var itm = _.find(scope.AppliedDataFilterCollection, {Type: item.Type, IsTopLevelFilter:true});
                        return itm ? itm.AttrLabel : '';
                    }
                    return '';
                };

            },
            templateUrl: 'Views/DataFilter/AccordionPanelTemplate.html'
        };

    }]);

});
