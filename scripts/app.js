/**
 * Created by hisp on 1/12/15.
 */

var msfReportsApp = angular.module('msfReportsApp',['ui.bootstrap',
    'ngRoute',
    'ngCookies',
    'ngSanitize',
    'ngMessages',
    'd2HeaderBar',
    'd2Directives',
    'd2Filters',
    'd2Services',
    'pascalprecht.translate',
    'trackerReportsAppServices'
])

.config(function($routeProvider,$translateProvider){
        $routeProvider.when('/', {
            templateUrl:'views/home.html',
            controller: 'exportappcontroller'
        }).when('/exportapp', {
            templateUrl:'views/exportapp.html',
            controller: 'exportappcontroller'

        }).when('/event-report', {
            templateUrl:'views/event-report.html',
            controller: 'EventReportController'

        }).otherwise({
            redirectTo : '/'
        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy('escaped');
        $translateProvider.useLoader('i18nLoader');


});
