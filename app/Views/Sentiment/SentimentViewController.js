"use strict";

define(['application-configuration'], function (app) {

    app.register.controller('sentimentViewController', ['$scope', function ($scope) {

        console.log('Loading SentimentViewController');
        $scope.title = 'Sentiment View';

    }]);

});