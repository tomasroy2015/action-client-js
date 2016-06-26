define(['application-configuration', 'ajaxService'], function (app) {

    app.register.service('datasetService', ['$http', 'ajaxService', function ($http, ajaxService) {
        this.loadDataSet = function (dataset, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(dataset, "dataset/getalldata", successFunction, errorFunction);
        };
    }]);
});