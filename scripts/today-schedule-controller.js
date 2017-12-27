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
		
		var keyMap = [];
		
		var getRows = function(data2, row){
			//$('.reporttable').append(row);
			var row = "";
			for(var j=0;j<data2[0].programStages.length;j++){
					$.when(
						$.getJSON("../../programStages/"+data2[0].programStages[j].id+".json?fields=programStageDataElements[dataElement[id,name]]", {
						format: "json"
					})		
					).then(function (data3) {
						for(var k=0;k<data3.programStageDataElements.length;k++){
							var nameDe = data3.programStageDataElements[k].dataElement.name;
							var idDe = data3.programStageDataElements[k].dataElement.id;
							keyMap[idDe] = nameDe;
						}
					});
				}
					return keyMap;
		};
	
	$scope.generateReport = function(program){
			var row =  "<tr>";
			var json = "";
		$.when(
                $.getJSON("../../trackedEntityAttributes.json", {
                    format: "json"
                }),
				$.getJSON("../../programs/"+ program.id +".json?fields=programStages[id,name]", {
                    format: "json"
                })
            ).then(function (data1,data2) {
					json =  data2;
				for(var i=0;i<data1[0].trackedEntityAttributes.length;i++){
					row = row + "<th class='rows' id='"+ data1[0].trackedEntityAttributes[i].id +"'><b>"+ data1[0].trackedEntityAttributes[i].displayName +"</b></th>";
				}	
				
				var keyMapp = getRows(json , row);
				console.log(keyMapp);
				var index = 0;
						Object.keys(keyMapp).forEach(function(key) {
							// console.log(key + ': ' + keyMapp[key]);
							row = row + "<th class='rows' id='"+ key +"'>"+ keyMapp[key] +"</th>";
							index++;
							if(index == Object.keys(keyMapp).length){
								$('.reporttable').append( row + "</tr>");
							}
							
						});
				
            });
			
	};



    });

