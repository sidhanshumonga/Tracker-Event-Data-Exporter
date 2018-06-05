/**
 * Created by hisp on 2/12/15.
 */

var trackerReportsAppServices = angular.module('trackerReportsAppServices', [])
    .service('MetadataService',function(){
       return {
           getOrgUnit : function(id){
               var def = $.Deferred();
               $.ajax({
                   type: "GET",
                   dataType: "json",
                   contentType: "application/json",
                   //url: '../../organisationUnits/'+id+".json?fields=id,name,programs[id,name,programTrackedEntityAttributes[*],programStages[id,name,programStageDataElements[id,dataElement[id,name],sortOrder]]]",
                  // url: '../../organisationUnits/'+id+".json?fields=id,name,programs[id,name,programTrackedEntityAttributes[*],programStages[id,name,programStageDataElements[id,dataElement[id,name,optionSet[options[code,displayName]]],sortOrder]]]&paging=false",
                    url: '../../organisationUnits/'+id+".json?fields=id,name,programs[id,name,programTrackedEntityAttributes[*],programStages[id,name,programStageDataElements[id,dataElement[id,name,optionSet[options[code,displayName]]],sortOrder]]]&paging=false",
                   success: function (data) {
                       def.resolve(data);
                   }
               });
               return def;
           },
           getAllPrograms : function () {
               var def = $.Deferred();
               $.ajax({
                   type: "GET",
                   dataType: "json",
                   contentType: "application/json",
                   url: '../../programs.json?fields=id,name,withoutRegistration,programTrackedEntityAttributes[*],programStages[id,name,programStageDataElements[id,dataElement[id,name,optionSet[options[code,displayName]],sortOrder]]]&paging=false',
                   success: function (data) {
                       def.resolve(data);
                   }
               });
               return def;
           },
           getSQLView : function(sqlViewUID,param){
               var def = $.Deferred();
               $.ajax({
                   type: "GET",
                   dataType: "json",
                   contentType: "application/json",
                   url: '../../sqlViews/'+sqlViewUID+"/data?"+param,
                   success: function (data) {
                       def.resolve(data);
                   }
               });
               return def;
           },

           getALLAttributes : function(){
               var def = $.Deferred();
               $.ajax({
                   type: "GET",
                   dataType: "json",
                   contentType: "application/json",
                   url: '../../trackedEntityAttributes.json?fields=id,name,attributeValues[*,attribute[id,name,code]]&paging=false',
                   success: function (data) {
                       def.resolve(data);
                   }
               });
               return def;
           },
           getProgramStages : function(id){
               var def = $.Deferred();
               $.ajax({
                   type: "GET",
                   dataType: "json",
                   contentType: "application/json",
                   url: "../../programs/"+ id +".json?fields=programStages[id,name]",
                   success: function (data) {
                       def.resolve(data);
                   }
               });
               return def;
           }

       }
    });
