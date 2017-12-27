/**
 * Created by harsh on 28/11/16.
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
    .controller('EventReportController', function( $rootScope,
                                                     $scope,
                                                     $timeout,
                                                     MetadataService){

        // const SQLVIEW_TEI_PS = "nBCleImsp8E";
        // const SQLVIEW_TEI_ATTR = "NJKQr9q6kOO";
        // const SQLVIEW_TEI_PS =  "EX2dsz6vmES";
        // const SQLVIEW_TEI_ATTR = "pUiDfNYflvv";

        const SQLVIEW_TEI_PS =  "FcXYoEGIQIR";
        const SQLVIEW_TEI_ATTR = "WMIMrJEYUxl";
        const SQLVIEW_EVENT = "IQ78273FQtF";

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

        // Listen for OU changes
        selection.setListenerFunction(function(){
            getAllPrograms();
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
        getAllPrograms = function(){
            MetadataService.getAllPrograms().then(function(prog) {
                $scope.allPrograms = prog.programs;
                $scope.programs = [];
                for(var i=0; i<prog.programs.length;i++){
                    if(prog.programs[i].withoutRegistration == true){
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

        $scope.generateReport = function(program){

            $scope.program = program;

            for(var i=0; i<$scope.program.programTrackedEntityAttributes.length;i++){
                var str = $scope.program.programTrackedEntityAttributes[i].displayName;
                var n = str.lastIndexOf('-');
                $scope.program.programTrackedEntityAttributes[i].displayName = str.substring(n + 1);

            }
            $scope.psDEs = [];
            $scope.Options =[];
            $scope.attribute = "Attributes";
            $scope.enrollment =["Enrollment date" , "Enrolling orgUnit"];
            var options = [];

            var index=0;
            for (var i=0;i<$scope.program.programStages.length;i++){

                var psuid = $scope.program.programStages[i].id;
                $scope.psDEs.push({dataElement : {id : "orgUnit",name : "orgUnit",ps:psuid}});
                $scope.psDEs.push({dataElement : {id : "eventDate",name : "eventDate",ps:psuid}});

                for (var j=0;j<$scope.program.programStages[i].programStageDataElements.length;j++){

                    $scope.program.programStages[i].programStageDataElements[j].dataElement.ps = psuid;
                    var de =$scope.program.programStages[i].programStageDataElements[j];
                    $scope.psDEs.push(de);

                    if ($scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet != undefined) {
                        if ($scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options != undefined) {

                            for (var k = 0; k < $scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options.length; k++) {
                                index=index+1; // $scope.Options.push($scope.program.programStages[i].programStageDataElements[j]);
                                var code = $scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options[k].code;
                                var name = $scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options[k].displayName;

                                options.push({code:code,name:name});
                                $scope.Options[$scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options[k].code + "_index"] = $scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options[k].displayName;
                            }
                        }
                    }
                }
            }

            //  var param = "var=program:"+program.id + "&var=orgunit:"+$scope.selectedOrgUnit.id+"&var=startdate:"+moment($scope.date.startDate).format("YYYY-MM-DD")+"&var=enddate:"+moment($scope.date.endDate).format("YYYY-MM-DD");
            var param = "var=program:"+program.id + "&var=orgunit:"+$scope.selectedOrgUnit.id+"&var=startdate:"+$scope.startdateSelected+"&var=enddate:"+$scope.enddateSelected;

            MetadataService.getSQLView(SQLViewsName2IdMap[SQLQUERY_EVENT_NAME], param).then(function (stageData) {
                $scope.stageData = stageData;
                arrangeDataX($scope.stageData);
            })
        };

        function showLoad()
        {
            // alert( "inside showload method 1" );
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

        function arrangeDataX(stageData){

            // For Data values
            const index_deuid = 4;
            const index_devalue = 6;
            const index_ps = 0;
            const index_ev = 2;
            const index_evDate = 3;
            const index_ou = 7;

            $scope.eventList = [];
            $scope.eventMap = [];
            $scope.eventDeWiseValueMap = [];

            for (var i=0;i<stageData.height;i++) {

                var psuid = stageData.rows[i][index_ps];
                var evuid = stageData.rows[i][index_ev];
                var evDate = stageData.rows[i][index_evDate];
                var deuid = stageData.rows[i][index_deuid];
                var devalue = stageData.rows[i][index_devalue];
                var ou = stageData.rows[i][index_ou];

                if (!$scope.eventMap[evuid]){
                    $scope.eventMap[evuid] = {
                                                event : evuid,
                                                data : []
                                };
                    $scope.eventDeWiseValueMap[evuid + "-orgUnit"] = ou;
                    $scope.eventDeWiseValueMap[evuid + "-eventDate"] = evDate;



                }

                $scope.eventMap[evuid].data.push( {
                                            de : deuid,
                                            value : devalue
                });
                $scope.eventDeWiseValueMap[evuid + "-" + deuid] = devalue;


                for(m in $scope.Options){

                    if(devalue+'_index' == m){

                        $scope.eventDeWiseValueMap[evuid + "-" + deuid] = $scope.Options[m];
                    }

                }
            }

            $timeout(function(){
                $scope.eventList = prepareListFromMap($scope.eventMap);

            })

        }

    });
