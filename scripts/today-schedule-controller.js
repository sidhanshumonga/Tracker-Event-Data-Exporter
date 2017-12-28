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
        var finalKeyMap = [];
        var tempMap = [];
        var getDataValues =  function(keyMap,program){
          var tei= "";

          $.ajax({
                    async: false,
                    type: "GET",
                    url: "../../enrollments.json?ou="+$scope.selectedOrgUnit.id+"&program="+ program.id +"&programStartDate="+ $scope.startdateSelected +"&programEndDate="+ $scope.enddateSelected +"&skipPaging=true",
                    success: function (data0) {
                      for(var g=0;g<data0.enrollments.length;g++){
                        tei = data0.enrollments[g].trackedEntityInstance;
                        document.getElementById('perc').innerHTML = (g/data0.enrollments.length)*100;

          $.ajax({
                    async: false,
                    type: "GET",
                    url: "../../trackedEntityInstances/"+ tei +".json?fields=*",
                    success: function (data) {
                          for(var e=0;e<data.attributes.length;e++){
                            var count = keyMap[data.attributes[e].attribute];
                            tempMap[count] = data.attributes[e].value;
                          }
                          // tempMap = finalKeyMap;
                      $.ajax({
                                async: false,
                                type: "GET",
                                url: "../../events.json?trackedEntityInstance="+tei+"&order=eventDate:ASC",
                                success: function (data5) {

                                  for(var m=0;m<data5.events.length;m++){
                                    var finalKeyMap = tempMap;

                                    var newRow = "<tr>";
                                    for(var n=0;n<data5.events[m].dataValues.length;n++){
                                      var count2 = keyMap[data5.events[m].dataValues[n].dataElement];
                                      finalKeyMap[count2] = data5.events[m].dataValues[n].value;
                                    }


                                    for(var h=1;h<keyMap2.length;h++){
                                      if(finalKeyMap.hasOwnProperty(h)){
                                        newRow =  newRow + "<td>"+finalKeyMap[h]+"</td>";
                                      }
                                      else{
                                        newRow =  newRow + "<td></td>";
                                      }
                                    }
                                    $('.reporttable').append(newRow + "</tr>");
                                  }

                                  }

                              });
                          }


                  });
                }

                document.getElementById('loader').style.display = "none";
              }
              });
        };

        var keyMap = [];
		    var keyMap2 = [];
        var json = "";
  var getRows = function(row,hr,program,index){
    //$('.reporttable').append(row);
    //var row = "";
    $.ajax({
              async: false,
              type: "GET",
              url: "../../programs/"+ program.id +".json?fields=programStages[id,name]",
              success: function (data2) {
                json = data2;
      for(var j=0;j<data2.programStages.length;j++){

        $.ajax({
                  async: false,
                  type: "GET",
                  url: "../../programStages/"+data2.programStages[j].id+".json?fields=programStageDataElements[dataElement[id,name]]&order=displayName:ASC",
                  success: function (data3) {
                    hr = hr + "<th colspan ='"+ (data3.programStageDataElements.length) +"'>"+ json.programStages[j].name +"</th>";
          for(var k=0;k<data3.programStageDataElements.length;k++){
            var nameDe = data3.programStageDataElements[k].dataElement.name;
            var idDe = data3.programStageDataElements[k].dataElement.id;
            row = row + "<th class='rows' id='"+idDe+"'>"+nameDe+"</th>";
            keyMap[idDe] = index;
            keyMap2[index] = idDe;
            index++;
          }

          if(j == data2.programStages.length-1){
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

    $(".reporttable tbody").remove();
$(".reporttable tbody").detach();

  document.getElementById('loader').style.display = "block";

      var row =  "<tr>";
      var json = "";
      var index = 1;
      $.ajax({
                async: true,
                type: "GET",
                url: "../../programs/"+program.id+".json?fields=programTrackedEntityAttributes",
                success: function (data1) {
          //json =  data2;
        for(var i=0;i<data1.programTrackedEntityAttributes.length;i++){
          keyMap[data1.programTrackedEntityAttributes[i].id] = index;
          keyMap2[index] = data1.programTrackedEntityAttributes[i].id;
          index++;
          row = row + "<th class='rows' id='"+ data1.programTrackedEntityAttributes[i].id +"'>"+ data1.programTrackedEntityAttributes[i].displayName +"</th>";
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
}
            });

  };



    });
