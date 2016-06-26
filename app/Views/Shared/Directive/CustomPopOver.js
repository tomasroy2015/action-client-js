"use strict";

define(['application-configuration'], function (app) {
    app.register.directive('actionToggle', function(){
        return {
            restrict: 'A',
            link: function(scope, element, attrs){
                if (attrs.actionToggle=="popover"){
                    if(!angular.isUndefined(attrs.actionPopoverTitle)){
                        $(element).popover({title:attrs.actionPopoverTitle,container: ".evaluationContainer"});
                        //$(element).popover('show');
                        $(element).bind( "mouseleave", function() {
                            $(element).popover('hide');
                        });



                    }
                }
            }
        };
    })
});
