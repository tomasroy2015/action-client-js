define(['application-configuration','dataFactory'], function (app) {

    app.register.factory('comparatorFactory', ['$rootScope','dataFactory','ComparatorType','Notify',
        function ($rootScope, dataFactory,ComparatorType,Notify) {

            var comparatorNames= ["Target", "Benchmark median","Benchmark lower limit", "Benchmark upper limit","Average", "Custom value"];
            var selectedComparatorType = ComparatorType.Target;
            var customComparatorValue = 0;
            var isDoubleTargetEnabled = false;
            return {
                UpdateComparatorType: function (comparatorType) {
                    selectedComparatorType = parseInt(comparatorType);
                    dataFactory.UpdateComparatorType(selectedComparatorType);
                    //$rootScope.$broadcast(Notify.COMPARATOR_TYPE_CHANGED);
                },
                SetCustomComparator: function(customValue){
                    customComparatorValue = customValue;
                    selectedComparatorType = ComparatorType.Custom;
                    dataFactory.UpdateCustomComparatorType(selectedComparatorType,customValue);
                },
                SetDoubleTarget: function(comparatorType, doubleTargetEnabled){
                    selectedComparatorType = parseInt(comparatorType);
                    dataFactory.UpdateComparatorType(selectedComparatorType);
                    isDoubleTargetEnabled = doubleTargetEnabled;
                    dataFactory.HasDoubleTarget(isDoubleTargetEnabled);
                },
                GetSelectedComparatorType: function () {
                    return selectedComparatorType;
                },
                GetSelectedComparatorName: function(){
                    return comparatorNames[selectedComparatorType-1];
                },
                GetScoreItemComparator: function(scoreItem){
                    if(isDoubleTargetEnabled){
                        return dataFactory.GetTargetComparator(scoreItem);
                    }else{
                        return dataFactory.GetScoreItemComparator(scoreItem);
                    }
                },
                GetDoubleTarget: function(scoreItem){
                    if(isDoubleTargetEnabled){
                        return dataFactory.GetScoreItemComparator(scoreItem);
                    }else{
                       return NaN;
                    }
                }
            };

        }]);
});

