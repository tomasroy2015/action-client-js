define(['application-configuration', 'ajaxService'], function (app) {

    app.register.service('leftMenuDataService', ['$http', 'ajaxService', function ($http, ajaxService) {

        this.datafilters = function (datasetRange, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(datasetRange, "dataset/getalldata", successFunction, errorFunction);
        };

    }]);
});
