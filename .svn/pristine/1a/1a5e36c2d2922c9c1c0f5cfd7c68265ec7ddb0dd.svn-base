"use strict";

define(['application-configuration'], function (app) {

    app.register.directive('actionAccordionItemSelected', ['$rootScope',function ($rootScope) {

        return {
            restrict: "A",
            scope: {
            },
            link: function (scope, el, attrs) {
                console.log('ele.....>>>. ' + el);
                var isDataFilterWindowSlideIn = false;
                var containerWidth;
                var topPadding = 50;
                var curId;
                el.click(function () {
                    containerWidth = $('#dataFilterWindowContainer').width();

                    var prevSelId = $('.prevSel').attr('id');
                    //var prevSelClass = $('.prevSel').attr('class');
                    //$('.prevSel').attr('id')
                    curId = el.attr('id');


                    if(prevSelId !== undefined && prevSelId !== curId){
                        $('#' + prevSelId).removeClass('prevSel');
                        $('#dataFilterWindowContainer.slide-out').animate({left: -containerWidth - 253}, 500, "linear");
                        isDataFilterWindowSlideIn = false;
                    }

                    //console.log('clicked...... ' + el);
                    el.addClass('prevSel');
                    datafilterwindowHandler();
                    $rootScope.$broadcast("element-click-event");
                });

                var datafilterwindowHandler = function () {

                    $('#dataFilterWindowContainer.slide-out').css('top', topPadding + 'px');

                    isDataFilterWindowSlideIn = !isDataFilterWindowSlideIn;
                    if (isDataFilterWindowSlideIn) {
                        $('#dataFilterWindowContainer.slide-out').animate({left: 253}, 500, "linear", function () {
                            //$('.full-scorecard-body-wrapper').removeClass('ease-out-effect').addClass('ease-in-effect');
                        });
                    }
                    else {
                        $('#dataFilterWindowContainer.slide-out').animate({left: -containerWidth - 253}, 500, "linear");
                        //$('.full-scorecard-body-wrapper').removeClass('ease-in-effect').addClass('ease-out-effect');
                        isDataFilterWindowSlideIn = false;
                    }
                };
                //$("#dataFilterWindowContainer .close-slide-in").click(function (e) {
                //    //e.preventDefault();
                //    //e.stopImmediatePropagation();
                //    $('#dataFilterWindowContainer.slide-out').animate({left: -containerWidth - 253}, 500, "linear");
                //    isDataFilterWindowSlideIn = false;
                //    console.log(curId);
                //    //$('#'+curId).removeClass('df-selected prevSel');
                //    $('.prevSel').removeClass('df-selected prevSel');
                //    $('.df-selected').removeClass('df-selected prevSel');
                //});

                //attrs.$observe('closeWindowEvent', function(value){
                //    if(value){
                //        console.log(value);
                //    }
                //});
                //scope.$watch('closeWindowEvent', function(value){
                //    if(value){
                //        console.log('$watch'+value);
                //    }
                //});

                $rootScope.$on("close-data-filter-window-event",function(type,data){
                    console.log(data);
                });
            }
        };
    }]);

});
