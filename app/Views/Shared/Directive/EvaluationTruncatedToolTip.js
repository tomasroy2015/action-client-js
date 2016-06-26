/**
 * Created by Shahin on 8/11/2015.
 */
"use strict";

define(['application-configuration'], function (app) {

    app.register.directive('actionEvaluationTruncatedToolTip', [function () {

        return {
            restrict: 'A',
            scope:{
                placement: "@tooptipPlacement"
            },
            link: function (scope, el, attrs) {

                el.bind('mouseenter', function (e) {
                    //console.log('mouse hover..');
                    var $this = $(this);
                    if(angular.isUndefined(scope.placement)||(scope.placement.length==0)){
                        scope.placement="top";
                    }

                    if (el[0].offsetWidth < el[0].scrollWidth && !$this.attr('title')) {
                        //var titleString = tooltipText( $this.text())
                        $this.tooltip({
                            title: el[0].lastChild.data,//titleString,
                            placement:  scope.placement,
                            delay:1000,
                            container: 'body'
                        });
                        $this.tooltip('toggle');
                    }

                });

                function tooltipText(text){
                        if(text.indexOf('=')==0){
                            return text.substring(1);
                        }
                        else
                        return text;
                }

                el.bind('mouseleave', function () {
                    var $this = $(this);
                    $this.tooltip('hide');
                });

            }
        };

    }]);

});
