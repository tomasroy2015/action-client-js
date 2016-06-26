/**
 * Created by Shahin on 7/28/2015.
 */

"use strict";

define(['application-configuration'], function (app) {

    app.register.directive('actionDivDisabled', [function () {

        return {
            restrict: 'A',
            link: function (scope, el, attrs) {
                scope.$watch(attrs.actionDivDisabled, function (isDisable) {
                    scope.isDisableState = isDisable;
                    enableDisable();
                });

                function enableDisable() {
                    if (scope.isDisableState) {
                        el.css({

                            'opacity': 0.6,
                            '-webkit-touch-callout': 'none',
                            '-webkit-user-select': 'none',
                            '-khtml-user-select': 'none',
                            '-moz-user-select': 'none',
                            '-ms-user-select': 'none',
                            'user-select': 'none',
                            'cursor': 'default'
                        });
                    } else {
                        el.css({
                            'opacity': '',
                            '-webkit-touch-callout': '',
                            '-webkit-user-select': '',
                            '-khtml-user-select': '',
                            '-moz-user-select': '',
                            '-ms-user-select': '',
                            'user-select': '',
                            'cursor': 'pointer'
                        });
                    }

                    el.on('click', function (event) {
                        //event.stopImmediatePropagation();
                        //event.stopPropagation();
                        //event.bubbles = false;
                        //event.cancelBubble = true;
                        return !scope.isDisableState;
                    });

                    //angular.element(el[0].querySelectorAll('input , button')).attr('disabled',scope.isDisableState);
                    //var tmpControlColl = angular.element(el[0].querySelectorAll('input , button')).removeAttr('ng-click');
                }

                function cancelBubble(e) {
                    var evt = e ? e:window.event;
                    if (evt.stopPropagation)    evt.stopPropagation();
                    if (evt.cancelBubble!=null) evt.cancelBubble = true;
                }

            } //end link
        };

    }]);

});
