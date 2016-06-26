define(['application-configuration'], function (app) {

    app.register.factory('dataFilterFactory', ['$rootScope', 'Notify', 'dataFactory',
        function ($rootScope, Notify, dataFactory) {

            var selectedAttributeIndex = -1,
                isLeftMenuAttributeClicked = false,
                isDataFilterResetClicked = false,
                appliedDatafilterColl = null,
                isDataFilterApplyBtnClicked = false;

            var ApplyFilterModel = function (Index, Type, VerticaColumnName, Ids,Value,AttrLabel,IsTopLevelFilter,IsOnlyTicketData) {
                this.Index = Index;
                this.Type = Type;
                this.VerticaColumnName = VerticaColumnName;
                this.Ids = Ids;
                this.Value = Value;
                this.AttrLabel = AttrLabel;
                this.IsTopLevelFilter = IsTopLevelFilter;
                this.IsOnlyTicketData = IsOnlyTicketData;
            };

            return {
                SetSelectedAttributeIndex: function (index) {
                    selectedAttributeIndex = index;
                },
                GetSelectedAttributeIndex: function () {
                    return selectedAttributeIndex;
                },
                GetSelectedAttribute: function () {
                    var item = _.find(dataFactory.CustomAttributeCollection(), function (n) {
                        return n.Index == selectedAttributeIndex;
                    });
                    return item;
                },
                ApplyFilterModel:function(Index, Type, VerticaColumnName, Ids,Value,AttrLabel,IsTopLevelFilter,IsOnlyTicketData){
                    return new ApplyFilterModel(Index, Type, VerticaColumnName, Ids,Value,AttrLabel,IsTopLevelFilter,IsOnlyTicketData);
                },
                GetLeftMenuAttributeClickedEvent:function(){
                    return isLeftMenuAttributeClicked;
                },
                SetLeftMenuAttributeClickedEvent:function(val){
                    isLeftMenuAttributeClicked = val;
                },
                GetDataFilterResetClickedEvent:function(){
                    return isDataFilterResetClicked;
                },
                SetDataFilterResetClickedEvent:function(val){
                    isDataFilterResetClicked = val;
                },
                GetAppliedDataFilterCollection: function () {
                    return appliedDatafilterColl;
                },
                SetAppliedDataFilterCollection: function (coll) {
                    appliedDatafilterColl = coll;
                },
                GetDataFilterApplyBtnClickedEvent:function(){
                    return isDataFilterApplyBtnClicked;
                },
                SetDataFilterApplyBtnClickedEvent:function(val){
                    isDataFilterApplyBtnClicked = val;
                }
            };

        }]);
});

