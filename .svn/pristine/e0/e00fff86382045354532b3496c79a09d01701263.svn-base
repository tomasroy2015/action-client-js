/**
 * Created by Shahin on 8/11/2015.
 */
"use strict";

define(['application-configuration'], function (app) {

    app.register.directive('actionTruncatedToolTip', [function () {

        return {
            restrict: 'A',
            scope:{
                placement: "@tooptipPlacement"
            },
            link: function (scope, el, attrs) {

                el.bind('mouseenter', function (e) {
                    //console.log('mouse hover..');
                    var $this = $(this);
                    //var offset = $(this).offset();
                    //var relativeX = (e.pageX - offset.left);
                    //var relativeY = (e.pageY - offset.top);
                    //if (el[0].offsetWidth < el[0].scrollWidth && !$this.attr('title')) {
                    //    $this.attr('data-title', $this.text());
                    //    setTimeout(function () {
                    //        $this.addClass('mightOverflow');
                    //        document.styleSheets[0].addRule('.mightOverflow:after','left: '+relativeX + 'px');
                    //
                    //    }, 0);
                    //}

                    if(angular.isUndefined(scope.placement)||(scope.placement.length==0)){
                        scope.placement="top";
                    }

                    if (el[0].offsetWidth < el[0].scrollWidth && !$this.attr('title')) {
                        $this.tooltip({
                            title: $this.text(),
                            placement:  scope.placement,
                            delay:1000,
                            container: 'body'

                        });


                        //setTimeout(function () {
                        //    $('.tooltip').css({'left': '2px'});
                        //},0);
                        $this.tooltip('toggle');
                    }

                });

                //el.bind('mouseleave', function () {
                //    var $this = $(this);
                //    setTimeout(function () {
                //        $this.removeAttr('data-title');
                //        $('.mightOverflow').css('left','');
                //        $this.removeClass('mightOverflow');
                //    }, 0);
                //
                //});

                el.bind('mouseleave', function () {
                    var $this = $(this);
                    $this.tooltip('hide');
                    //$this.tooltip('destroy');
                });

            }
        };

    }]);

});
