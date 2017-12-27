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
            controller: 'homeController'
        }).when('/schedule-today', {
            templateUrl:'views/schedule-today.html',
            controller: 'TodayScheduleController'

        }).when('/event-report', {
            templateUrl:'views/event-report.html',
            controller: 'EventReportController'

        }).otherwise({
            redirectTo : '/'
        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy('escaped');
        $translateProvider.useLoader('i18nLoader');

        initSQLView();

});

function initSQLView() {

    SQLViewsName2IdMap = [];
    getAllSQLViews().then(function(sqlViews){
        var requiredViews = [];
        requiredViews[SQLQUERY_TEI_ATTR_NAME] = false;
        requiredViews[SQLQUERY_EVENT_NAME] = false;
        requiredViews[SQLQUERY_TEI_DATA_VALUE_NAME] = false;

        for (var i=0;i<sqlViews.length;i++){
            SQLViewsName2IdMap[sqlViews[i].name] = sqlViews[i].id;

            if (sqlViews[i].name == SQLQUERY_TEI_ATTR_NAME){
                delete requiredViews[SQLQUERY_TEI_ATTR_NAME];
            }
            else if (sqlViews[i].name == SQLQUERY_TEI_DATA_VALUE_NAME){
               delete requiredViews[SQLQUERY_TEI_DATA_VALUE_NAME];
            }
            else if (sqlViews[i].name == SQLQUERY_EVENT_NAME){
                delete requiredViews[SQLQUERY_EVENT_NAME];
            }
        }

        createRequiredViews(requiredViews);
    })
}

function createRequiredViews(reqViews){

    for (var key in reqViews){

        var sqlViewTemplate =
        {
            "name": SQLView_Init_Map[key].name,
            "sqlQuery": SQLView_Init_Map[key].query,
            "displayName": SQLView_Init_Map[key].name,
            "description": SQLView_Init_Map[key].desc,
            "type": SQLView_Init_Map[key].type
        }

        createSQLView(Object.assign({},sqlViewTemplate)).then(function(response){
            SQLViewsName2IdMap[response.name] = response.response.lastImported;
            console.log("SQL View created.");debugger

        })
    }



}