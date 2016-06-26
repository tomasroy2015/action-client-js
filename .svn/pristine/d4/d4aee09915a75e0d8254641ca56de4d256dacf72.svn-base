define(['application-configuration', 'accountsService', 'alertsService'], function (app) {

    app.register.controller('resetPasswordController', ['$scope', '$rootScope', 'accountFactory', 'alertsService', '$location','Notify',
        function ($scope, $rootScope, accountFactory, alertsService, $location,Notify) {
            $scope.Email="";
            $scope.isInvalidInput= false;
            $scope.isInvalidEmail = false;
            $scope.isResetBtnClicked = false;
            $scope.sendEmail = function(){
                $scope.isInvalidInput= false;
                $scope.isResetBtnClicked = true;

                var isInvalid =  $scope.validateInput();
                if(isInvalid)
                    return;

                var email = {
                    Email   : $scope.Email
                };
                accountFactory.SendEmail(email);
            };
            $scope.validateInput = function(){
                var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                if($scope.Email === "" || typeof $scope.Email === "undefined") {
                    $scope.isInvalidInput= true;
                    $scope.isInvalidEmail = false;
                    return $scope.isInvalidInput;
                }
                if (!filter.test($scope.Email)) {
                    $scope.isInvalidEmail = true;
                    $scope.isInvalidInput= false;
                    return $scope.isInvalidEmail;
                }
            };
            $scope.goBack = function(){
                window.location = "#/";
            };
            $scope.$on(Notify.PASSWORD_EMAIL_SENT_SUCCESSFULLY, function(event){
                alert("Email has been sent successfully.");
            });
            $scope.$on(Notify.PASSWORD_EMAIL_SENT_UNSUCCESSFULLY, function(event){
                alert("Uh oh! Unregistered Email!.Please verify the provided Email");
            });
        }]);
});
