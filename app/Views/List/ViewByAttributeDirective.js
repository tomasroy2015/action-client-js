"use strict";
define(['application-configuration'], function (app) {
    app.register.directive("actionViewByAttribute", function () {
        var uid = 1;
        return {
            restrict: 'EA',
            scope: {
                attrItemCollection: '=',
                selectedAttribute: '=',
                attributeItemChangeListener: '&',
                selectedServiceArea: '=',
                viewByAttributeClick: '&'
            },
            templateUrl: "Views/List/ViewByAttributeTemplate.html",
            link: function (scope, el, attr) {
                scope.isNotTCKSeleted = false;
                scope.attributeItem_clickHandler = function (selectedItem, itemLabel, ele) {
                    if (scope.isNotTCKSeleted && selectedItem.Type === 2) return false;

                    scope.selectedAttribute = itemLabel;
                    attributeItemSelection_Handler(ele.currentTarget);
                    scope.attributeItemChangeListener({attr: selectedItem});
                };

                scope.$watch('selectedServiceArea', function (newVal) {
                    if (newVal && newVal.SurveyType !== 'TCK') {
                        scope.isNotTCKSeleted = true;
                    } else {
                        scope.isNotTCKSeleted = false;
                    }
                });


                scope.isHoverClass = function (grpItem) {
                    if (scope.isNotTCKSeleted && grpItem.Type === 2) {
                        return false;
                    } else if (scope.isNotTCKSeleted && grpItem.Type === 1) {
                        return true;
                    } else {
                        return true;
                    }
                }

                //Select/Non-Select Items
                function attributeItemSelection_Handler(ele) {
                    var id = "#" + ele.id;
                    $(id).addClass('selectedAttributeItem');
                    updateQuestionItemsCSSClass(ele);
                }

                function updateQuestionItemsCSSClass(ele) {
                    var list1 = document.getElementById("attributeType1");
                    var list2 = document.getElementById("attributeType2");

                    var listItems1 = list1.getElementsByTagName("li");
                    var listItems2 = list2.getElementsByTagName("li");

                    var finalList = [];
                    finalList[0] = listItems1;
                    finalList[1] = listItems2;

                    for (var i = 0; i < finalList.length; i++) {
                        var list = finalList[i];

                        for (var j = 0; j < list.length; j++) {
                            if (isAlreadySelectedClassApply(list[j].className) && (list[j].id != ele.id)) {
                                $("#" + list[j].id).removeClass('selectedAttributeItem');
                            }
                            // console.log("selected:"+ele.id+" current id: "+list[j].id);
                        }
                    }
                }

                function isAlreadySelectedClassApply(itemClassNames) {
                    var selectedClassName = "selectedAttributeItem";
                    return itemClassNames.search(selectedClassName) > -1 ? true : false;
                }

                angular.element('li.dropdown').on('show.bs.dropdown', function () {
                    scope.viewByAttributeClick();
                });
            }
        };
    });
});