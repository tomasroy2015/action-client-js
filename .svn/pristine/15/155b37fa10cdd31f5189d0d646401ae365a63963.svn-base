define(['application-configuration', 'accountFactory', 'alertsService'], function (app) {

    app.register.controller('loginController', ['$scope', '$rootScope', 'accountFactory', 'alertsService', '$location','Notify','appSettings',
        function ($scope, $rootScope, accountFactory, alertsService, $location,Notify,appSettings) {

            $rootScope.closeAlert = alertsService.closeAlert;
            $rootScope.alerts = [];
            $scope.isInvalidInput = false;
            $scope.isInvalidUser = false;
            $scope.loginErrorText ="";
            //$scope.isNeedToShowLoading = false;
            $scope.UserData = null;
            $scope.Version = appSettings.APPLICATION_VERSION;

            angular.element(document).ready(function () {
                //console.log('Rootscope'+ $rootScope.IsLoginFromPentaho);
                if ($rootScope.IsLoginFromPentaho === true)
                    angular.element('#login-form').css({'display':'none',opacity:0});
            });

            $scope.initializeController = function () {
                $scope.Email = "";
                $scope.Password = "";
                $rootScope.isNeedToShowLoading = false;
               // alertsService.RenderSuccessMessage("Please register if you do not have an account.");
            };

            $scope.login = function () {
                $rootScope.IsloggedIn = false;
                $scope.isInvalidInput = false;

                var isInvalid =  $scope.validateInput();
                if(isInvalid)
                    return;

                $rootScope.isNeedToShowLoading = true;
                $rootScope.loadTitle = "Log in";
                var user = $scope.createLoginCredentials();
                accountFactory.GetLoginData(user);
            };

            $scope.validateInput = function(){
                if($scope.Email === "" || typeof $scope.Email === "undefined") {
                    $scope.isInvalidInput= true;
                }
                if($scope.Password === "" || typeof $scope.Password === "undefined") {
                    $scope.isInvalidInput= true;
                }
                return $scope.isInvalidInput;
            };

//            $scope.loginCompleted = function (response) {
//                $scope.isInvalidUser = false;
//                $rootScope.MenuItems = response.MenuItems;
//                $rootScope.UserData = response;
//                $scope.isNeedToShowLoading = false;
//                window.location = "#/Dataset";
//            };
//
//            $scope.loginError = function (response) {
//
//                alertsService.RenderErrorMessage(response.ReturnMessage);
//                $scope.isInvalidUser = true;
//                $scope.isNeedToShowLoading = false;
//                $scope.clearValidationErrors();
//                alertsService.SetValidationErrors($scope, response.ValidationErrors);
//
//            };
            $scope.$on(Notify.LOGIN_SUCCESSFUL, function(event){
                $scope.isInvalidUser = false;
               // $rootScope.MenuItems = response.MenuItems;
                $scope.UserData = accountFactory.UserData();
                $rootScope.isNeedToShowLoading = false;
                window.location = "#/Dataset";
            });
            $scope.$on(Notify.LOGIN_UNSUCCESSFUL, function(event,response){
                //alertsService.RenderErrorMessage(response.ReturnMessage);
                $scope.isInvalidUser = true;
                $scope.loginErrorText = response.Message;
                $rootScope.isNeedToShowLoading = false;
                $scope.clearValidationErrors();
                //alertsService.SetValidationErrors($scope, response.ValidationErrors);
            });
            //Logout

            //End Logout

            $scope.clearValidationErrors = function () {

                $scope.UserNameInputError = false;
                $scope.PasswordInputError = false;

            };

            $scope.createLoginCredentials = function () {

                var params = {
                    Email   : $scope.Email,
                    Password: $scope.Password
                };

                return params
            };

            //reset password
            $scope.reset = function () {
                window.location = "#/ResetPassword";
            }
        }]);
});
