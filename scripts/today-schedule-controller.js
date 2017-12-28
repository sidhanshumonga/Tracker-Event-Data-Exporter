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

        $scope.updateStartDate = function(startdate){
            $scope.startdateSelected = startdate;
            //  alert("$scope.startdateSelected---"+$scope.startdateSelected);
        };

        $scope.updateEndDate = function(enddate){
            $scope.enddateSelected = enddate;
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
        var finalKeyMap = [];
        var tempMap = [];
        var keyMap = [];
		    var keyMap2 = [];
        var json = "";
        var flag = "";
        var flagCount = "";
        var programid =  "";


        var getEvents =  function(tei){


          var url1 = "../../events.json?trackedEntityInstance="+tei+"&order=eventDate:ASC";
          $.when(getAjaxData(url1)).done(function(data5){


            $.each( data5.events,function(m,values){
              var finalKeyMap = tempMap;

              var newRow = "<tr>";

              $.each(data5.events[m].dataValues,function(n,values){
                var value = data5.events[m].dataValues[n].value;
                if(value == "true"){value = "Yes"}
                if(value == "false"){value  = "No"}
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
              document.getElementById('loader').style.display = "none";
            });

                  });


        };

        var getTeis =  function(tei){

          var url1 = "../../trackedEntityInstances/"+ tei +".json?fields=*";
          $.when(getAjaxData(url1)).done(function(data){


            $.each(data.attributes,function(e,values){
                                          var count = keyMap[data.attributes[e].attribute];
                                          var value = data.attributes[e].value
                                          if(value == "true"){value = "Yes"}
                                          if(value == "false"){value  = "No"}
                                          tempMap[count] = value;
            });
                  });

        };

        var getDataValues =  function(keyMap,program){
          var tei= "";

          var url1 = "../../enrollments.json?ou="+$scope.selectedOrgUnit.id+"&program="+ program.id +"&programStartDate="+ $scope.startdateSelected +"&programEndDate="+ $scope.enddateSelected +"&skipPaging=true";
          $.when(getAjaxData(url1)).done(function(data0){

              $.each(data0.enrollments,function(g,value){
                tei = data0.enrollments[g].trackedEntityInstance;
                flag = data0.enrollments.length;
                flagCount = g;
                document.getElementById('perc').innerHTML = parseInt((flagCount/flag)*100) + "%";
                getTeis(tei);
                getEvents(tei);
              });

              });
        };

  var getRows = function(row,hr,program,index){
    //$('.reporttable').append(row);
    //var row = "";

    $.ajax({
      async: false,
      type: "GET",
      dataType: "json",
      contentType: "application/json",
      url: "../../programs/"+ program.id +".json?fields=programStages[id,name]",
       success: function (data2) {
                json = data2;
                var flag =0;
    //  for(var j=0, arrLen = data2.programStages.length;j<arrLen;j++){
      for(var j=0,arrLen1=data2.programStages.length;j<arrLen1;j++){
          // getHeaderRow(json,program, row, hr, index, j);
          $.ajax({
            async: false,
            type: "GET",
            dataType: "json",
            contentType: "application/json",
            url: "../../programStages/"+data2.programStages[j].id+".json?fields=programStageDataElements[dataElement[id,name]]",
             success: function (data3) {
          //  console.log(j);
            hr = hr + "<th colspan ='"+ (data3.programStageDataElements.length) +"'>"+ json.programStages[j].name +"</th>";

            for(var k=0, arrLen = data3.programStageDataElements.length;k<arrLen;k++){
              var nameDe = data3.programStageDataElements[k].dataElement.name;
              var idDe = data3.programStageDataElements[k].dataElement.id;
              row = row + "<th class='rows' id='"+idDe+"'>"+nameDe+"</th>";
              keyMap[idDe] = index;
              keyMap2[index] = idDe;
              index++;
            }

                if(j == json.programStages.length-1){
                      $('.reporttable').append(hr + "</tr>" + row + "</tr>");
                      console.log(keyMap2);
                     console.log(keyMap);
                     console.log(Object.keys(keyMap2).length);
                     console.log(Object.keys(keyMap).length);
                      getDataValues(keyMap,program);
                }
              }
          });
        }
}
    });
//        return keyMap;
  };

  $scope.generateReport = function(program){
    programid = program.id;

    $(".reporttable tbody").remove();
$(".reporttable tbody").detach();

  document.getElementById('loader').style.display = "block";

      var row =  "<tr>";
      var json = "";
      var index = 1;
      var url = "../../programs/"+program.id+".json?fields=programTrackedEntityAttributes";
      $.when(getAjaxData(url)).done(function(data1){
          //json =  data2;
        for(var i=0,arrayLength=data1.programTrackedEntityAttributes.length;i<arrayLength;i++){
          keyMap[data1.programTrackedEntityAttributes[i].trackedEntityAttribute.id] = index;
          keyMap2[index] = data1.programTrackedEntityAttributes[i].trackedEntityAttribute.id;
          index++;
          row = row + "<th class='rows' id='"+ data1.programTrackedEntityAttributes[i].trackedEntityAttribute.id +"'>"+ data1.programTrackedEntityAttributes[i].displayName +"</th>";
        }
        //console.log(keyMap);
        //console.log(keyMap2);
        var hr = "<tr><th colspan='"+(data1.programTrackedEntityAttributes.length)+"'>Attributes</th>";
        getRows(row,hr,program,index);
        //console.log(keyMapp);
        //var index = 0;
        //    Object.keys(keyMapp).forEach(function(key) {
              // console.log(key + ': ' + keyMapp[key]);
        //      row = row + "<th class='rows' id='"+ key +"'>"+ keyMapp[key] +"</th>";
        //      index++;
        //      if(index == Object.keys(keyMapp).length){
        //        $('.reporttable').append( row + "</tr>");
        //      }

        //    });
            });

  };



    });
