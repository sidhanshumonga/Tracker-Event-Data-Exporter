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
    .controller('EventReportController', function ($rootScope,
      $scope,
      $timeout,
      MetadataService) {
  
  
      //PSI
      //const SQLVIEW_TEI_PS =  "FcXYoEGIQIR";
      // const SQLVIEW_TEI_ATTR = "WMIMrJEYUxl";
      var def = $.Deferred();
      //MSF
      const SQLVIEW_TEI_PS = "Ysi6iyNK1Ha";
      const SQLVIEW_TEI_ATTR = "GoPX942y3eV";
      jQuery(document).ready(function () {
        hideLoad();
      })
      $timeout(function () {
        $scope.date = {};
        $scope.date.startDate = new Date();
        $scope.date.endDate = new Date();
      }, 0);
  
      //initially load tree
      selection.load();
  
      getAllPrograms();
      // Listen for OU changes
      selection.setListenerFunction(function () {
        $scope.selectedOrgUnitUid = selection.getSelected();
        loadPrograms();
      }, false);
  
      loadPrograms = function () {
        MetadataService.getOrgUnit($scope.selectedOrgUnitUid).then(function (orgUnit) {
          $timeout(function () {
            $scope.selectedOrgUnit = orgUnit;
          });
        });
      }

      function download(text, name, type) {
        var a = document.createElement("a");
        var file = new Blob([text], {type: type});
        a.href = URL.createObjectURL(file);
        a.download = name;
        a.click();
    }
    
      $scope.selectedProgram = {};
      function getAllPrograms() {
        MetadataService.getAllPrograms().then(function (prog) {
          $scope.allPrograms = prog.programs;
          $scope.programs = [];
          for (var i = 0; i < prog.programs.length; i++) {
            if (prog.programs[i].withoutRegistration == true) {
              $scope.programs.push(prog.programs[i]);
            }
          }
        });
      }
  
  
      var psArray = [];

      var _getOrgUnitName = function (ou) {
        var def = "";
        $.ajax({
            type: "GET",
            async:false,
            dataType: "json",
            contentType: "application/json",
            url: "../../organisationUnits/"+ ou +".json?&fields=[name,id]",
            success: function (data) {
                def  = data.name;
            }
        });
        return def;
    };
     
  
      $scope.loadProgramStages = function (response) {
        psArray = [];
        for (var i = 0; i < response.programStages.length; i++) {
          psArray[response.programStages[i].id] = response.programStages[i].name;
        }
        $scope.program = response;
        document.getElementById('loader').style.display = "block";
        document.getElementById('loaderdata').innerHTML = "Please wait, loading data!";
        getOptionName();
        getOptionName2();
      };
  
      $scope.updateStartDate = function (startdate) {
        var date = startdate;
        var output = date.replace(/(\d\d)\/(\d\d)\/(\d{4})/, "$3-$1-$2");
        $scope.startdateSelected = output;
        //  alert("$scope.startdateSelected---"+$scope.startdateSelected);
      };
  
      $scope.updateEndDate = function (enddate) {
        var date = enddate;
        var output = date.replace(/(\d\d)\/(\d\d)\/(\d{4})/, "$3-$1-$2");
        $scope.enddateSelected = output;
        //  alert("$scope.enddateSelected---"+ $scope.enddateSelected);
      };
  
      $scope.fnExcelReport = function () {
  
        var blob = new Blob([document.getElementById('divId').innerHTML], {
          type: 'text/plain;charset=utf-8'
        });
        saveAs(blob, "Report.xls");
  
      };
  
      var jsonData = {
        trackedEntityInstances: [],
        enrollments: [],
        events: []
      };
  
      var gettei = function(tei){
        var mwflag7 = false;
        var data = "";
        $.ajax({
          async: false,
          type: "GET",
          url: "../../trackedEntityInstances/" + tei + ".json?&skipPaging=true",
          success: function (response) {
            data = response;
          }
         
        });
       
          return data;
      };
    $scope.downloadJson = function () {
        download(JSON.stringify(jsonData), 'exported data_' + $scope.selectedOrgUnit.id + '_' + $scope.startdateSelected + '_to_' + $scope.enddateSelected + '.json');
      };
  
  
      function showLoad() {// alert( "inside showload method 1" );
        setTimeout(function () {
  
  
          //  document.getElementById('load').style.visibility="visible";
          //   document.getElementById('tableid').style.visibility="hidden";
  
        }, 1000);
  
        //     alert( "inside showload method 2" );
      }
      function hideLoad() {
  
        //  document.getElementById('load').style.visibility="hidden";
        //  document.getElementById('tableid').style.visibility="visible";
  
  
      }
  
   
  
      
      
  
  
  
    });
  