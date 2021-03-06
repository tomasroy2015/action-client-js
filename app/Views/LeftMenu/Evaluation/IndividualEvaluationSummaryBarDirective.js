"use strict";
define(['application-configuration','d3','d3-tip'], function (app,d3,d3tip) {
    app.register.directive("actionIndividualEvaluationSummaryBar",["moreSettingsFactory", function (moreSettingsFactory) {
        var uid = 1;
        return {
            restrict   : 'EA',
            scope      : {
                data:'=',
                id:'='
            },
            templateUrl: "Views/LeftMenu/Evaluation/IndividualEvaluationSummaryBarTemplate.html",
            replace: false,
            link   : function (scope, el, attr) {

                el.find('svg').attr('id', "eid"+scope.data.serialId);
                var width= scope.data.serialId=="SES_Frequency"?140:94;
                el.find('svg').attr('width',width);
                //var ele=el[0].children[1];
                var svg=d3.select("#eid"+scope.data.serialId);
                var tip = d3tip()
                    .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function(d) {
                        return "<span>n= " + d.Frequency + "</span>";
                    })
                svg.call(tip);
                var rects=svg.selectAll("rect").data(scope.data.QuestionScoreFrequency).enter().append("rect");
                rects.attr({
                    y: function (d, i) {
                        return 45-d.BarHeight;
                    },
                    height: function (d, i) {
                        return d.BarHeight;
                    },
                    x:function(d,i){
                        return  i*23;
                    },
                    width:12,
                    fill:function(d){
                        return d.ColorCode;
                    }
                })
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide)
                    //.attr('data-toggle','tooltip').attr('title',"Tooltip on left")
                    //data-toggle="tooltip" title="Tooltip on left"
//                    .attr({
//                    y: 47,
//                    height: 0,
//                    x:function(d,i){
//                        return  i*23;
//                    },fill:function(d){
//                       // console.log(scope.data.QuestionId);
//                        return d.ColorCode;
//                    }
//                }).transition()
//                    .duration(2000)

            }
        }
    }]);
});