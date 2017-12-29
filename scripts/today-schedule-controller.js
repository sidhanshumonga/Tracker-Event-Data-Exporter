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

        $scope.exportData = function(program){
         //   exportData($scope.date.startDate,$scope.date.endDate,program,$scope.selectedOrgUnit);
        //    exportData($scope.startdateSelected,$scope.enddateSelected,program,$scope.selectedOrgUnit);

        }



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
          var url = '../../enrollments.json?ou='+$scope.selectedOrgUnit.id+'&program='+ id +'&programStartDate='+ $scope.startdateSelected +'&programEndDate='+ $scope.enddateSelected +'&fields=trackedEntityInstance&skipPaging=true';
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
               w4flag = true;
               if(w4flag){
                   myWorker4.terminate();
               }
           });
        };
      //  getOptionName();
        var terminateWork = false;
        var getDataValues =  function(keyMap,program){

          var tei= "";
             flag = enrollmentsArr.length;
              $.each(enrollmentsArr,function(g,value){
                var finalKeyMap = [];
                var tempMap = [];
                tei = enrollmentsArr[g];
                flagCount = g;
                 $scope.perc = (flagCount/flag)*100;
                 var myWorker5 = new Worker('worker.js');
                var url2 = '../../trackedEntityInstances/'+ tei +'.json?fields=*';
                var w5flag = false;
                myWorker5.postMessage(url2);
                myWorker5.addEventListener('message',function(response){
                  var res2 = (response.data).split('&&&');
                  if(url2 != res2[1]){return}
                     var obj = jQuery.parseJSON(res2[0]);
                     var data = obj;
                     $.each(data.attributes,function(e,values){
                                                var count = keyMap[data.attributes[e].attribute];
                                                var value = data.attributes[e].value
                                                if(value == "true"){value = "Yes"}
                                                if(value == "false"){value  = "No"}
                                                tempMap[count] = value;
                  });
                  w5flag =  true;
                  if(w5flag){
                      myWorker5.terminate();
                  }
                    });
                    var myWorker6 = new Worker('worker.js');
                    var url3 = '../../events.json?trackedEntityInstance='+tei+'&order=eventDate:ASC';
                    var w5flag = false;
                  myWorker6.postMessage(url3);
                  myWorker6.addEventListener('message',function(response){

                    var res3 = (response.data).split('&&&');
                    if(url3 != res3[1]){return}
                       var obj5 = jQuery.parseJSON(res3[0]);
                       var data5 = obj5;


                    $.each(data5.events,function(m,values){
                      var finalKeyMap = tempMap;
                      finalKeyMap[1] = psArray[data5.events[m].programStage];
                      finalKeyMap[2] = (data5.events[m].eventDate).split('T')[0];
                      finalKeyMap[3] = data5.events[m].orgUnitName;
                      if(finalKeyMap[1] == "First Visit"){var newRow = "<tr>";}
                      if(finalKeyMap[1] == "Follow-up Visit"){var newRow = "<tr style='background-color:#abbedf'>";}
                      if(finalKeyMap[1] == "Exit"){var newRow = "<tr style='background-color:#95a3ba'>";}

                      $.each(data5.events[m].dataValues,function(n,values){
                        var value = data5.events[m].dataValues[n].value;
                        if(value == "true"){value = "Yes"}
                        if(value == "false"){value  = "No"}
                        var optionValue = optionSetArr[value];
                        if(typeof optionValue === undefined || optionValue === undefined){}
                        else{var value = optionValue;}
                        var count2 = keyMap[data5.events[m].dataValues[n].dataElement];
                        finalKeyMap[count2] = value;
                      });


                      for(var h=1,arrLen3 = keyMap2.length;h<arrLen3;h++){
                        if(finalKeyMap.hasOwnProperty(h)){
                          newRow =  newRow + "<td>"+finalKeyMap[h]+"</td>";
                        }
                        else{
                          newRow =  newRow + "<td></td>";
                        }
                      }
                      $('.reporttable').append(newRow + "</tr>");
                    });
                    w6flag = true;
                    if(w6flag){
                        myWorker6.terminate();
                          document.getElementById('loader').style.display = "none";
                    }
                });
                if(g == enrollmentsArr.length-1){

                      terminateWork = true;
                }
          });
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
          hr = hr + "<th colspan ='"+ data2.programStages[j].programStageDataElements.length +"'>"+ json.programStages[counter].name +"</th>";
          for(var k=0,arrL=data2.programStages[j].programStageDataElements.length;k<arrL;k++){
              var nameDe = data2.programStages[j].programStageDataElements[k].dataElement.name;
              var idDe = data2.programStages[j].programStageDataElements[k].dataElement.id;
              row = row + "<th class='rows' id='"+idDe+"'>"+nameDe+"</th>";
              keyMap[idDe] = index;
              keyMap2[index] = idDe;
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
    programid = program.id;
    getEnrollments(program.id);
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
