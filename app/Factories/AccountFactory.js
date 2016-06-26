define(['application-configuration', 'accountsService'], function (app) {
    app.register.factory('accountFactory', ['$rootScope', '$http', 'accountsService','Notify','UserType', function ($rootScope, $http, accountsService,Notify,UserType) {
        var userData = null;
        var onGetLoginData = function(response){
            $rootScope.IsLoginFromPentaho = false;
            userData = response;
            $rootScope.$broadcast(Notify.LOGIN_SUCCESSFUL);
        };
        var onResetPassword = function(response){
            $rootScope.$broadcast(Notify.PASSWORD_EMAIL_SENT_SUCCESSFULLY);
        };
        var loginError = function(response){
            //Error handling goes here.
            //window.alert("Error in loading DataSet");
            $rootScope.$broadcast(Notify.LOGIN_UNSUCCESSFUL,response);
        };
        var onLogout = function(response){
            $rootScope.$broadcast(Notify.LOGOUT_SUCCESSFUL);
        };
        var logoutError = function(response){
            //Error handling goes here.
            //$rootScope.$broadcast(Notify.LOGIN_UNSUCCESSFUL);
        };
        var resetPasswordError = function(response){
            $rootScope.$broadcast(Notify.PASSWORD_EMAIL_SENT_UNSUCCESSFULLY);
        };
        var getDetailsRoleStatus = function (){
            var status = false;
            if(userData){
                switch(userData.UserType){
                    case UserType.GIARTE_ADMIN :
                    case UserType.CUSTOMER_ADMIN :
                        status = true;
                        break;
                    case UserType.END_USER :
                        var userToRoles  = userData.UserToRoles;
                        if(userToRoles)
                        {
                            _.forEach(userToRoles,function(item){
                                if(item.RoleType === 3){
                                    status = true;
                                }
                            } )
                        }
                        else
                        status = false;
                        break;
                    default :
                        status = false;
                }
                return status;
            }
            else
            return false;
        }

        return{
           GetLoginData:function(user){
                accountsService.login(user,onGetLoginData,loginError);
           },
            LogOut:function(user){
                accountsService.logout(user,onLogout,logoutError);
            },
            UserData:function(){
                return userData;
            },
            SendEmail:function(email){
                accountsService.resetPassword(email,onResetPassword,resetPasswordError);
            },
            SetUserData:function(val){ /*For By pass Login page to set the user */
                userData = val;
            },
            IsDetailsRoleActive:function(){
                return getDetailsRoleStatus();
            }
        };
    }]);
});
