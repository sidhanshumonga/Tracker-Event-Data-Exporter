/**
 * Created by harsh on 9/1/17.
 */

getTEIBetweenDateAndProgram = function(startDate,endDate,program,ou){

    var def = $.Deferred();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
      //  url: '../../trackedEntityInstances?program='+program+'&startDate='+startDate+'&endDate='+endDate+'&ou='+ou+'&ouMode=DESCENDANTS&paging=false',
        url: '../../trackedEntityInstances?program='+program+'&ou='+ou+'&ouMode=DESCENDANTS&skipPaging=true',
        success: function (data) {
            def.resolve(data.trackedEntityInstances);
        },
        error : function(a,b,c){
            def.resolve(null);

        }
    });
    return def;
}

getTEIBetweenDateAndProgramSQLView = function(startDate,endDate,program,ou,sqlViewid){

    var def = $.Deferred();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        //  url: '../../trackedEntityInstances?program='+program+'&startDate='+startDate+'&endDate='+endDate+'&ou='+ou+'&ouMode=DESCENDANTS&paging=false',
        url: '../../sqlViews/'+sqlViewid+'/data.json?var=program:'+program+'&var=startDate:'+startDate+'&var=endDate:'+endDate+'&var=ou:'+ou,
        success: function (data) {
            def.resolve(data.rows);
        },
        error : function(a,b,c){
            def.resolve(null);

        }
    });
    return def;
}

getEnrollmentsBetweenDateAndProgram = function(startDate,endDate,program,ou){

    var def = $.Deferred();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        //url: '../../enrollments?program='+program+'&startDate='+startDate+'&endDate='+endDate+'&ou='+ou+'&ouMode=DESCENDANTS&paging=false',
        url: '../../enrollments?program='+program+'&ou='+ou+'&ouMode=DESCENDANTS&skipPaging=true',
        success: function (data) {
            def.resolve(data.enrollments);
        },
        error : function(a,b,c){
            def.resolve(null);

        }
    });
    return def;
}

getEnrollmentsBetweenDateAndProgramSQLView = function(startDate,endDate,program,ou,sqlViewid){

    var def = $.Deferred();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        //url: '../../enrollments?program='+program+'&startDate='+startDate+'&endDate='+endDate+'&ou='+ou+'&ouMode=DESCENDANTS&paging=false',
        url: '../../sqlViews/'+sqlViewid+'/data.json?var=program:'+program+'&var=startDate:'+startDate+'&var=endDate:'+endDate+'&var=ou:'+ou,
        success: function (data) {
            def.resolve(data.rows);
        },
        error : function(a,b,c){
            def.resolve(null);

        }
    });
    return def;
}


getEventsBetweenDateAndProgram = function(startDate,endDate,program,ou){

    var def = $.Deferred();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        //url: '../../events?program='+program+'&startDate='+startDate+'&endDate='+endDate+'&ou='+ou+'&ouMode=DESCENDANTS&skipPaging=true',
        url: '../../events?program='+program+'&ou='+ou+'&ouMode=DESCENDANTS&skipPaging=true',
        success: function (data) {
            def.resolve(data.events);
        },
        error : function(a,b,c){
            def.resolve(null);

        }
    });
    return def;
}

getEventsBetweenDateAndProgramSQLView = function(startDate,endDate,program,ou,sqlViewid){

    var def = $.Deferred();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        //url: '../../events?program='+program+'&startDate='+startDate+'&endDate='+endDate+'&ou='+ou+'&ouMode=DESCENDANTS&skipPaging=true',
        url: '../../sqlViews/'+sqlViewid+'/data.json?var=program:'+program+'&var=startDate:'+startDate+'&var=endDate:'+endDate+'&var=ou:'+ou,
        success: function (data) {
            def.resolve(data.rows);
        },
        error : function(a,b,c){
            def.resolve(null);

        }
    });
    return def;
}


request = function(param,callback){
    param.success = success;
    param.error = error;
    $.ajax(param);

    function success(response){
        callback(null,response);
    }

    function error(response){
        callback(true,response);
    }
}

getTEAttributes = function(){
    var def = $.Deferred();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: '../../trackedEntityAttributes?fields=id,name,valueType,attributeValues[attribute[id,code],value]&paging=false',
        success: function (data) {
            def.resolve(data.trackedEntityAttributes);
        },
        error : function(a,b,c){
            def.resolve(null);

        }
    });
    return def;
}