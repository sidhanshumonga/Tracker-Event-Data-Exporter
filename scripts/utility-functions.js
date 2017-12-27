/**
 * Created by harsh on 7/5/16.
 */


prepareIdToObjectMap = function(object,id){
    var map = [];
    for (var i=0;i<object.length;i++){
        map[object[i][id]] = object[i];
    }
    return map;
}

prepareMapGroupedById= function(object,id){
    var map = [];
    for (var i=0;i<object.length;i++){
        if (!map[object[i][id]]){
            map[object[i][id]] = [];
        }
        map[object[i][id]].push(object[i]);
    }
    return map;
}

prepareListFromMap= function(map){
    var list = [];
    for (var key in map){
        list.push(map[key]);
    }
    return list;
}

function getConflicts(response){

    if (response.responseText){

        if (!isJson(response.responseText))
            return ([{object:"Unexpected Error Occurred",value:response.responseText}]);

        var jsonRT = JSON.parse(response.responseText);

        if (jsonRT.response){
            if (jsonRT.response.conflicts){
                return jsonRT.response.conflicts;
            }
            if (jsonRT.response.importSummaries[0].conflicts){
                return jsonRT.response.importSummaries[0].conflicts;
            }
            if (jsonRT.response.importSummaries[0].status == "ERROR"){
                return ([{object:jsonRT.response.importSummaries[0].description,value:""}]);
            }
        }
    }else{
        if (response.httpStatus){
            if (response.httpStatus.response)
            if (response.httpStatus.response.conflicts){
                return response.httpStatus.response.conflicts;
            }
        }
    }

    if (response.conflicts)
    return response.conflicts;

    if (response.importConflicts)
    return response.importConflicts;

    return false;
}

function findReference(response){

    if (response.response){

        if (response.response.reference){
            return response.response.reference;
        }

        if (response.response.importSummaries ){
            if (response.response.importSummaries[0].reference)
                return response.response.importSummaries[0].reference;
        }
    }

    if (response.lastImported){
        return response.lastImported;
    }
return "";
}

function findStatus(response){

    if (response.statusText){
        return response.statusText
    }

    if (response.status){
        return response.status
    }

    return "";
}
//http://stackoverflow.com/questions/9804777/how-to-test-if-a-string-is-json-or-not
//http://stackoverflow.com/users/3119662/kubosho
function isJson(item) {
    item = typeof item !== "string"
        ? JSON.stringify(item)
        : item;

    try {
        item = JSON.parse(item);
    } catch (e) {
        return false;
    }

    if (typeof item === "object" && item !== null) {
        return true;
    }

    return false;
}

 function createSQLView(sqlView){
     var name = sqlView.name;
    var def = $.Deferred();
    $.ajax({
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data : JSON.stringify(sqlView),
        url: '../../sqlViews',
        success: function (data) {
            data.name = name;
            def.resolve(data);
        },
        error : function(a,b,c){
            debugger
        }
    });
    return def;
}


function getAllSQLViews(){
    var def = $.Deferred();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: '../../sqlViews?fields=[id,name]&paging=false',
        success: function (data) {
            def.resolve(data.sqlViews);
        },
        error : function(a,b,c){
            debugger
        }
    });
    return def;
}
function extractMetaAttributeValue(attributeValues,code){
    var value = undefined;
    for (var i=0;i<attributeValues.length;i++){
        if (attributeValues[i].attribute.code == code){
            value = attributeValues[i].value;
        }
    }
    return value;
}