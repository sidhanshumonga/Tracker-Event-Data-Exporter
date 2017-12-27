/**
 * Created by harsh on 6/1/17.
 */

function exportData(startDate,endDate,program,ou){
const dateFormat = "YYYY-MM-DD";
    var anonymousAttributes = {};
var counter = 0;
    var sqlviewTEI = "PU5yLRnwuux";
    var sqlviewEvent = "xR624wriSdx";
    var sqlviewEnrol = "Xq8XCKgX277";

  //  var sqlviewTEI = "gKoyecyesIy";
   // var sqlviewEvent = "wP1mRygtI6v";
   // var sqlviewEnrol = "mpJURzehHtv";
    var jsonData = {
        trackedEntityInstance : [],
        enrollments : [],
        events: []
    };

    getTEAttributes().then(function(tea){

        for (var key in tea){
            if (tea[key].attributeValues.length > 0){
                var val = extractMetaAttributeValue(tea[key].attributeValues,Anonymous_Attribute_Code);
                if (val){
                    anonymousAttributes[tea[key].id] = tea[key];
                }
            }
        }

        //get all TEI
        getTEIBetweenDateAndProgram(moment(startDate).format(dateFormat),moment(endDate).format(dateFormat),program.id,ou.id)
            .then(function(teis) {

                getTEIBetweenDateAndProgramSQLView(moment(startDate).format(dateFormat), moment(endDate).format(dateFormat), program.id, ou.id,sqlviewTEI)
                    .then(function (teissql) {

                        for (var i = 0; i < teis.length; i++) {
                            anonymizeTEAS(anonymousAttributes, teis[i].attributes);
                        }
                        if(teissql.length>0){
                            for (var i = 0; i < teissql.length; i++) {

                                for(var j=0; j<teis.length; j++) {
                                    if (teissql[i][0] == teis[j].trackedEntityInstance) {

                                        jsonData.trackedEntityInstance.push(teis[j]);

                                    }
                                }
                            }

                        }
                        //jsonData.trackedEntityInstance = teis;
                        counterCallback();
                    });
            });
    })


    getEnrollmentsBetweenDateAndProgram(moment(startDate).format(dateFormat),moment(endDate).format(dateFormat),program.id,ou.id).then(function(enrollments) {

        getEnrollmentsBetweenDateAndProgramSQLView(moment(startDate).format(dateFormat), moment(endDate).format(dateFormat), program.id, ou.id, sqlviewEnrol)
            .then(function (enrollmentssql) {

                if(enrollmentssql.length>0){
                    for (var i = 0; i < enrollmentssql.length; i++) {

                        for(var j=0; j<enrollments.length; j++) {
                            if (enrollmentssql[i][0] == enrollments[j].enrollment) {

                                jsonData.enrollments.push(enrollments[j]);

                            }
                        }
                    }

                }
              //  jsonData.enrollments = enrollments;
                counterCallback();
            });
    });

    getEventsBetweenDateAndProgram(moment(startDate).format(dateFormat),moment(endDate).format(dateFormat),program.id,ou.id).then(function(events) {

        getEventsBetweenDateAndProgramSQLView(moment(startDate).format(dateFormat), moment(endDate).format(dateFormat), program.id, ou.id, sqlviewEvent)
            .then(function (eventssql) {

                if(eventssql.length>0){
                    for (var i = 0; i < events.length; i++) {

                        for(var j=0; j<eventssql.length; j++) {
                            if (eventssql[j][0] == events[i].event) {

                                jsonData.events.push(events[i]);

                            }
                        }
                    }

                }
             //   jsonData.events = events;
                counterCallback();
            });
    });

    function counterCallback(){
        counter++;
        if (counter >2){
            download(JSON.stringify(jsonData), 'tracker-'+moment(new Date()).format("YYYY-MM-DD h:mm:ss")+'.json', 'application/json');
        }
    }
}

function anonymizeTEAS(map,teas){

    for (key in map){
        for (var i=0;i<teas.length;i++){
            if (teas[i].attribute == key){
                var attr = map[key];
                switch(attr.valueType){
                    case "TEXT":
                            teas[i].value = "PRIVATE";
                        break
                    case "PHONE_NUMBER":
                        teas[i].value = "PRIVATE";
                        break
                    case "DATE" :
                        teas[i].value = "1970-01-01";
                        break
                }
            }
        }
    }
}
function download(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}

function getEvent(index,map,teis,program,ou,teiMap){
    if (index == teis.length){
        return;
    }
    var tei = teis[index].trackedEntityInstance;
    teiMap[tei] = teis[index];
    map[tei]={};
    var param = {
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: '../../events?trackedEntityInstance='+tei+'&program='+program.id+'&orgUnit='+ou.id+'&ouMode=DESCENDANTS&skipPaging=true',
    };
    request(param,callback);

    function callback(error,response,body){
        if (error){

        }else{
            for (var i=0;i<response.events.length;i++){
                var ev = response.events[i];
                map[tei][ev.event] = ev;
            }
        }
        getEvent(index+1,map,teis,program,ou,teiMap);
    }
}