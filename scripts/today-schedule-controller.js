/**
 * Created by hisp on 2/12/15.
 */
msfReportsApp.directive('calendar', function () {
    return {
        require: 'ngModel',
        link: function (scope, el, attr, ngModel) {
            $(el).datepicker({
                dateFormat: 'yy-mm-dd',
                onSelect: function (dateText) {
                    scope.$apply(function () {
                        ngModel.$setViewValue(dateText);
                    });
                }
            });
        }
    };
});
msfReportsApp
    .controller('TodayScheduleController', function( $rootScope,
                                            $scope,
                                            $timeout,
                                            MetadataService){





//PSI
        //const SQLVIEW_TEI_PS =  "FcXYoEGIQIR";
        // const SQLVIEW_TEI_ATTR = "WMIMrJEYUxl";
        var def = $.Deferred();
        //MSF
        const SQLVIEW_TEI_PS =  "Ysi6iyNK1Ha";
        const SQLVIEW_TEI_ATTR = "GoPX942y3eV";
        jQuery(document).ready(function () {
            hideLoad();
        })
       $timeout(function(){
            $scope.date = {};
            $scope.date.startDate = new Date();
            $scope.date.endDate = new Date();
        },0);

        //initially load tree
        selection.load();

        getAllPrograms();
        // Listen for OU changes
        selection.setListenerFunction(function(){
            $scope.selectedOrgUnitUid = selection.getSelected();
            loadPrograms();
        },false);

        loadPrograms = function(){
            MetadataService.getOrgUnit($scope.selectedOrgUnitUid).then(function(orgUnit){
                $timeout(function(){
                    $scope.selectedOrgUnit = orgUnit;
                });
            });
        }
        $scope.selectedProgram = {};
        function getAllPrograms(){
            MetadataService.getAllPrograms().then(function(prog) {
                $scope.allPrograms = prog.programs;
                $scope.programs = [];
                for(var i=0; i<prog.programs.length;i++){
                    if(prog.programs[i].withoutRegistration == false){
                        $scope.programs.push(prog.programs[i]);
                    }
                }
            });
        }


        var psArray = [];

        $scope.loadProgramStages = function(response){
          psArray = [];
            for(var i=0;i<response.programStages.length;i++){
              psArray[response.programStages[i].id] = response.programStages[i].name;
            }
        };

        $scope.updateStartDate = function(startdate){
            var date = startdate;
            var output = date.replace(/(\d\d)\/(\d\d)\/(\d{4})/, "$3-$1-$2");
            $scope.startdateSelected = output;
            //  alert("$scope.startdateSelected---"+$scope.startdateSelected);
        };

        $scope.updateEndDate = function(enddate){
          var date = enddate;
          var output = date.replace(/(\d\d)\/(\d\d)\/(\d{4})/, "$3-$1-$2");
            $scope.enddateSelected = output;
            //  alert("$scope.enddateSelected---"+ $scope.enddateSelected);
        };

        $scope.fnExcelReport = function(){

            var blob = new Blob([document.getElementById('divId').innerHTML], {
                type: 'text/plain;charset=utf-8'
            });
            saveAs(blob, "Report.xls");

        };

        var jsonData = {
            trackedEntityInstances : [],
            enrollments : [],
            events: []
        };


        $scope.exportDataJson = function(program){
          var mwflag1 = false, mwflag2 = false, mwflag3 = false, mwflag4 = false, mwflag7 = false;
          var teiArr = [];
          var cEventsTei = [];
          var cEventsId = [];
          var teisTobeAdded = [];


          var myWorkerJson5 = new Worker('worker.js');
          var url5 = '../../events.json?ou='+ $scope.selectedOrgUnit.id +'&program='+ program.id+'&startDate='+ $scope.startdateSelected +'&endDate='+ $scope.enddateSelected +'&skipPaging=true';
          myWorkerJson5.postMessage(url5);
          myWorkerJson5.addEventListener('message',function(response5){
            var res = (response5.data).split('&&&');
            if(url5 != res[1]){return}
               var obj = jQuery.parseJSON(res[0]);
               var data = obj;
            jsonData.events = obj.events;
            for(var j=0,arr = obj.events.length;j<arr;j++){
              cEventsTei[obj.events.trackedEntityInstance] = true;
              teisTobeAdded.push(obj.events.trackedEntityInstance);
              cEventsId[obj.events.event] = true;
            }
            if(mwflag4){
                myWorkerJson5.terminate();
            }
          });


          var myWorkerJson4 = new Worker('worker.js');
          var url4 = '../../events.json?ou='+ $scope.selectedOrgUnit.id +'&program='+ program.id+'&lastUpdatedStartDate='+ $scope.startdateSelected +'&lastUpdatedEndDate='+ $scope.enddateSelected +'&skipPaging=true';
          myWorkerJson4.postMessage(url4);
          myWorkerJson4.addEventListener('message',function(response4){
            var res = (response4.data).split('&&&');
            if(url4 != res[1]){return}
               var obj = jQuery.parseJSON(res[0]);
               var data = obj;

            for(var j=0,arr = obj.events.length;j<arr;j++){
              if(!cEventsId[obj.events.event] || typeof cEventsId[obj.events.event] === undefined || cEventsId[obj.events.event] === undefined){
                jsonData.events.push(obj.events[j]);
                teisTobeAdded.push(obj.events.trackedEntityInstance);
                cEventsTei[obj.events.trackedEntityInstance] = true;
              }
            }
            if(mwflag3){
                myWorkerJson4.terminate();
            }
          });

          var myWorkerJson1 = new Worker('worker.js');
          var url1 = '../../enrollments.json?ou='+$scope.selectedOrgUnit.id+'&ouMode=DESCENDANTS&program='+ program.id + '&programStartDate='+ $scope.startdateSelected +'&programEndDate='+ $scope.enddateSelected +'&skipPaging=true';
          myWorkerJson1.postMessage(url1);
          myWorkerJson1.addEventListener('message',function(response1){
            var res = (response1.data).split('&&&');
            if(url1 != res[1]){return}
               var obj = jQuery.parseJSON(res[0]);
               var data = obj;
            jsonData.enrollments = obj.enrollments;
            if(mwflag2){
                myWorkerJson1.terminate();
            }
          });

          var myWorkerJson2 = new Worker('worker.js');
          var url2 = '../../trackedEntityInstances.json?ou='+$scope.selectedOrgUnit.id+'&program='+ program.id +'&programStartDate='+ $scope.startdateSelected +'&programEndDate='+ $scope.enddateSelected +'&skipPaging=true';
          myWorkerJson2.postMessage(url2);
          myWorkerJson2.addEventListener('message',function(response2){
            var res = (response2.data).split('&&&');
            if(url2 != res[1]){return}
               var obj = jQuery.parseJSON(res[0]);
               var data = obj;
            jsonData.trackedEntityInstances = obj.trackedEntityInstances;
            for(var i=0,arr=obj.trackedEntityInstances.length;i<arr;i++){
              teiArr[obj.trackedEntityInstances.trackedEntityInstance] = true;
            }
            if(mwflag1){
                myWorkerJson2.terminate();
            }
          });
          for(var t=0,arr=teisTobeAdded.length;t<arr;t++){
            var value = teiArr[teisTobeAdded[t]];
            if(!value || typeof value === undefined || value === undefined){

              var myWorkerJson7 = new Worker('worker.js');
              var url7 = '../../trackedEntityInstances/'+ value +'.json?&skipPaging=true';
              myWorkerJson7.postMessage(url2);
              myWorkerJson7.addEventListener('message',function(response7){
                var res = (response7.data).split('&&&');
                if(url7 != res[1]){return}
                   var obj = jQuery.parseJSON(res[0]);
                   var data = obj;
                jsonData.trackedEntityInstances.push(obj);
                if(mwflag7){
                    myWorkerJson7.terminate();
                }
              });

            }
          }
        };

        $scope.downloadJson = function(){
          download(JSON.stringify(jsonData), 'exported data_'+ $scope.selectedOrgUnit.id + '_' + $scope.startdateSelected + '_to_' + $scope.enddateSelected + '.json');
        };


        function showLoad()
        {// alert( "inside showload method 1" );
            setTimeout(function(){


              //  document.getElementById('load').style.visibility="visible";
             //   document.getElementById('tableid').style.visibility="hidden";

            },1000);

            //     alert( "inside showload method 2" );
        }
        function hideLoad() {

          //  document.getElementById('load').style.visibility="hidden";
          //  document.getElementById('tableid').style.visibility="visible";


        }

        var getAjaxData =  function(url){
          return $.get(url);
        };

        var keyMap = [];
		    var keyMap2 = [];
        var json = "";
        var flag = "";
        var flagCount = "";
        var programid =  "";
        var optionSetArr = [];

        function isEmpty(obj) {
            for(var key in obj) {
                if(obj.hasOwnProperty(key))
                return false;
              }
        return true;
      }
      var enrollmentsArr = [];
        var getEnrollments = function(id){
          var w3flag = false;
          var myWorker3 = new Worker('worker.js');
          var url = '../../enrollments.json?ou='+$scope.selectedOrgUnit.id+'&ouMode=DESCENDANTS&program='+ id +'&programStartDate='+ $scope.startdateSelected +'&programEndDate='+ $scope.enddateSelected +'&fields=trackedEntityInstance&skipPaging=true';
          myWorker3.postMessage(url);
          myWorker3.addEventListener('message',function(response){
            var res = (response.data).split('&&&');
            if(url != res[1]){return}
               var obj = jQuery.parseJSON(res[0]);
               var data = obj;
               for(var p=0,arr=data.enrollments.length;p<arr;p++){
                 enrollmentsArr[p] = data.enrollments[p].trackedEntityInstance;
               }
               w3flag = true;
               if(w3flag){
                   myWorker3.terminate();
               }
             });
        };
        var getOptionName =  function(){
          var w4flag = false;
        var myWorker4 = new Worker('worker.js');
          var url = '../../dataElements.json?fields=id,optionSetValue,optionSet[options[name,code]]&paging=none';
          myWorker4.postMessage(url);
          myWorker4.addEventListener('message',function(response){
            var res = (response.data).split('&&&');
            if(url != res[1]){return}
               var obj = jQuery.parseJSON(res[0]);
               var data = obj;
              for(var y=0,arrL=data.dataElements.length;y<arrL;y++){
                 if(data.dataElements[y].optionSetValue == true){
                   for(var x=0,arrLn = data.dataElements[y].optionSet.options.length;x<arrLn;x++){
                     optionSetArr[data.dataElements[y].optionSet.options[x].code]=data.dataElements[y].optionSet.options[x].name;
                   }
                 }
               }
               console.log(optionSetArr);
               w4flag = true;
               if(w4flag){
                   myWorker4.terminate();
               }
           });
        };

        var printReport =  function(finalKeyMap, newRow){
          for(var h=1,arrLen3 = keyMap2.length;h<arrLen3;h++){
            if(finalKeyMap.hasOwnProperty(h) && finalKeyMap[h] != null){
              newRow =  newRow + "<td>"+finalKeyMap[h]+"</td>";
            }
            else{
              newRow =  newRow + "<td></td>";
            }
          }
          $('.reporttable').append(newRow + "</tr>");
        };

      //  getOptionName();
        var terminateWork = false;
        var getDataValues =  function(keyMap,program){
          var tei= "";
            var w6flag = false;
             flag = enrollmentsArr.length;
             if(enrollmentsArr.length == 0){
               w6flag = true;
             }
              $.each(enrollmentsArr,function(g,value){
                    tempMap = [];
                tei = enrollmentsArr[g];
                var myWorker5 = new Worker('worker.js');
                var url2 = '../../trackedEntityInstances/'+ tei +'.json?fields=*';
                var w5flag = false;
                var tempMap = [];
                console.log(url2);
                myWorker5.postMessage(url2);
                myWorker5.addEventListener('message',function(response){

                  var res2 = (response.data).split('&&&');
                  if(url2 != res2[1]){return}
                     var obj = jQuery.parseJSON(res2[0]);
                     var data = obj;
                     console.log(data);
                     $.each(data.attributes,function(e,values){
                                                var count = keyMap[data.attributes[e].attribute];
                                                var value = data.attributes[e].value;
                                                if(value == "true"){value = "Yes"}
                                                if(value == "false"){value  = "No"}
                                                if(value == null || value == "null"){value = ""}
                                                tempMap[count] = value;
                  });
                  w5flag =  true;
                  if(w5flag){
                      myWorker5.terminate();
                  }
                  });
                    var myWorker6 = new Worker('worker.js');
                    var url3 = '../../events.json?trackedEntityInstance='+tei+'&program='+ program.id +'&order=eventDate:ASC&skipPaging=true';
                    console.log(url3);
                    myWorker6.postMessage(url3);
                    myWorker6.addEventListener('message',function(response){

                    var res3 = (response.data).split('&&&');
                    if(url3 != res3[1]){return}
                       var obj5 = jQuery.parseJSON(res3[0]);
                       var data5 = obj5;

                    $.each(data5.events,function(m,values){
                      var finalKeyMap = [];
                      //finalKeyMap = tempMap;
                      finalKeyMap = JSON.parse(JSON.stringify(tempMap));
                      //console.log(finalKeyMap);
                      var pidd = data5.events[m].programStage;
                      finalKeyMap[1] = psArray[pidd];
                      if(data5.events[m].eventDate === undefined || typeof data5.events[m].eventDate === undefined){finalKeyMap[2] == ""}
                      else{finalKeyMap[2] = (data5.events[m].eventDate).split('T')[0];}
                      finalKeyMap[3] = data5.events[m].orgUnitName;
                      
                      if(finalKeyMap[1] == "First Visit"){var newRow = "<tr style='background-color:#abbedf'>";}
                      else if(finalKeyMap[1] == "Follow-up Visit"){var newRow = "<tr>";}
                      else if(finalKeyMap[1] == "Exit"){var newRow = "<tr style='background-color:#95a3ba'>";}
                      else{
                        if(m == 0){
                          var newRow = "<tr style='background-color:#95a3ba'>";
                        }
                        else{
                          var newRow = "<tr>";
                        }
                      }
                      for(var n = 0,arr=data5.events[m].dataValues.length;n<arr;n++){
                        var value = data5.events[m].dataValues[n].value;
                        if(value == 'true'){value = "Yes"}
                        if(value == 'false'){value = "No"}
                        var optionValue = optionSetArr[value];
                        if(typeof optionValue === undefined || optionValue === undefined){}
                        else{var value = optionValue;}
                        var count2 = keyMap[pidd +'+'+ data5.events[m].dataValues[n].dataElement];
                        finalKeyMap[count2] = value;
                      }

                      printReport(finalKeyMap, newRow);

                    });
                    w6flag = true;
                    if(w6flag){
                        myWorker6.terminate();
                        //  document.getElementById('loader').style.display = "none";
                    }
                    if(g == enrollmentsArr.length-1){

                          terminateWork = true;
                            document.getElementById('loader').style.display = "none";
                    }
                });


          });
          if(w6flag){
          //  myWorker6.terminate();
                document.getElementById('loader').style.display = "none";
          }
    };

  var getRows = function(row,hr,program,index){
    var w2flag = false;
    var url1 = '../../programs/'+ program.id +'.json?fields=programStages[id,name,programStageDataElements[dataElement[id,name]]]';
    var myWorker2 = new Worker('worker.js');
    myWorker2.postMessage(url1);
    myWorker2.addEventListener('message',function(response){
      var res1 = (response.data).split('&&&');
      if(url1 != res1[1]){return}
          var obj1 = jQuery.parseJSON(res1[0]);
           var data2 = obj1;
                json = data2;
                var counter =0;

    //  for(var j=0, arrLen = data2.programStages.length;j<arrLen;j++){
      for(var j=0,arrLen1=data2.programStages.length;j<arrLen1;j++){
          // getHeaderRow(json,program, row, hr, index, j);
          var pid = data2.programStages[j].id;
          hr = hr + "<th colspan ='"+ data2.programStages[j].programStageDataElements.length +"'>"+ json.programStages[counter].name +"</th>";
          for(var k=0,arrL=data2.programStages[j].programStageDataElements.length;k<arrL;k++){
              var nameDe = data2.programStages[j].programStageDataElements[k].dataElement.name;
              var idDe = data2.programStages[j].programStageDataElements[k].dataElement.id;
              row = row + "<th class='rows' id='"+idDe+"'>"+nameDe+"</th>";
              keyMap[pid+'+'+idDe] = index;
              keyMap2[index] = pid+'+'+idDe;
              index++;
          }
              counter++;
              if(counter == data2.programStages.length){
                    $('.reporttable').append(hr + "</tr>" + row + "</tr>");
                    getDataValues(keyMap,program);
              }
      }
      w2flag = true;
      if(w2flag){
          myWorker2.terminate();
      }
    });
  };
  var flagg = 0;
  $scope.generateReport = function(program){
     keyMap = [];
     keyMap2 = [];
     //json = "";
     //flag = "";
    // flagCount = "";
    // programid =  "";
    programid = program.id;
    getEnrollments(program.id);
    $scope.exportDataJson(program);
    var w1flag = false;
  document.getElementById('loader').style.display = "block";

    var myWorker1 = new Worker('worker.js');
    getOptionName();
    $(".reporttable tbody").remove();
    $(".reporttable tbody").detach();
    var row =  "<tr><th>Event Name</th><th>Event Date</th><th>Orgunit</th>";
      var json = "";
      var index = 4;
      var url ='../../programs/'+program.id+'.json?fields=programTrackedEntityAttributes';
      myWorker1.postMessage(url);
      myWorker1.addEventListener('message',function(response){
        var res1 = (response.data).split('&&&');
        if(url != res1[1]){return}
            var obj = jQuery.parseJSON(res1[0]);
             var data1 = obj;
          for(var i=0,arrayLength=data1.programTrackedEntityAttributes.length;i<arrayLength;i++){
            keyMap[data1.programTrackedEntityAttributes[i].trackedEntityAttribute.id] = index;
            keyMap2[index] = data1.programTrackedEntityAttributes[i].trackedEntityAttribute.id;
            index++;
            row = row + "<th class='rows' id='"+ data1.programTrackedEntityAttributes[i].trackedEntityAttribute.id +"'>"+ data1.programTrackedEntityAttributes[i].displayName +"</th>";
          }
          var hr = "<tr><th colspan='"+(data1.programTrackedEntityAttributes.length+3)+"'>Attributes</th>";
          flagg = 1;
          getRows(row,hr,program,index);
          w1flag = true;

          if(w1flag){
              myWorker1.terminate();
          }


      },false);

  };



    });
