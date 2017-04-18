var app = angular.module("app",["ngRoute"]);

app.config(function($routeProvider,$locationProvider){
    // $routeProvider.when('/',
    // {
    //     templateUrl : "Views/index.htm"
    // })
    $routeProvider.when('/login',
    {
        templateUrl : "Views/UserManagement/login.htm",
        controller : "loginController"
    })
    .when('/register',
    {
        templateUrl : "Views/UserManagement/register.htm",
        controller : "loginController"//,
        //controllerAs : 'login'
    })
    .otherwise(
    {
        template : "<h1>Page Not Found</h1>"
    })

    // get rid of the hash in the URL
    $locationProvider.html5Mode(true);
})