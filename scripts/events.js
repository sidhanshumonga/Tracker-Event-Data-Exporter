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
      var file = new Blob([text], { type: type });
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
        async: false,
        dataType: "json",
        contentType: "application/json",
        url: "../../organisationUnits/" + ou + ".json?&fields=[name,id]",
        success: function (data) {
          def = data.name;
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
      saveAs(blob, "Events report.xls");

    };

    var jsonData = {
      events: []
    };

    $scope.exportDataJson = function (program) {
      var mwflag3 = false;

      var myWorkerJson4 = new Worker('worker.js');
      var url4 = '../../events.json?ou=' + $scope.selectedOrgUnit.id + '&program=' + program.id + '&order=eventDate:ASC&skipPaging=true&startDate=' + $scope.startdateSelected + '&endDate=' + $scope.enddateSelected;
      myWorkerJson4.postMessage(url4);
      myWorkerJson4.addEventListener('message', function (response4) {
        var res = (response4.data).split('&&&');
        if (url4 != res[1]) { return }
        var obj = jQuery.parseJSON(res[0]);
        var data = obj;

        for (var j = 0, arr = obj.events.length; j < arr; j++) {
           jsonData.events.push(obj.events[j]); 
        }
        mwflag3 = true;
        if (mwflag3) {
          myWorkerJson4.terminate();
        }
      });
    };

    $scope.downloadJson = function () {
      download(JSON.stringify(jsonData), 'exported data_' + $scope.selectedOrgUnit.id + '_' + $scope.startdateSelected + '_to_' + $scope.enddateSelected + '.json');
    };


    function showLoad() {// alert( "inside showload method 1" );
      setTimeout(function () {
      }, 1000);
  }
    function hideLoad() {}

    var optionSetArr = [];
    var getOptionName = function () {
      var w4flag = false;
      var myWorker4 = new Worker('worker.js');
      var url = '../../dataElements.json?fields=id,optionSetValue,optionSet[options[name,code]]&paging=none';
      myWorker4.postMessage(url);
      myWorker4.addEventListener('message', function (response) {
        var res = (response.data).split('&&&');
        if (url != res[1]) { return }
        var obj = jQuery.parseJSON(res[0]);
        var data = obj;
        for (var y = 0, arrL = data.dataElements.length; y < arrL; y++) {
          if (data.dataElements[y].optionSetValue == true) {
            for (var x = 0, arrLn = data.dataElements[y].optionSet.options.length; x < arrLn; x++) {
              optionSetArr[data.dataElements[y].optionSet.options[x].code] = data.dataElements[y].optionSet.options[x].name;
            }
          }
        }
        // console.log(optionSetArr);
        w4flag = true;
        if (w4flag) {
          myWorker4.terminate();
          document.getElementById('loader').style.display = "none";
          // allTeiData();
        }
      });

    };

    var getOptionName2 = function () {
      var w44flag = false;
      var myWorker44 = new Worker('worker.js');
      var url = '../../trackedEntityAttributes.json?fields=id,optionSetValue,optionSet[options[name,code]]&paging=none';
      myWorker44.postMessage(url);
      myWorker44.addEventListener('message', function (response) {
        var res = (response.data).split('&&&');
        if (url != res[1]) { return }
        var obj = jQuery.parseJSON(res[0]);
        var data = obj;
        for (var y = 0, arrL = data.trackedEntityAttributes.length; y < arrL; y++) {
          if (data.trackedEntityAttributes[y].optionSetValue == true) {
            for (var x = 0, arrLn = data.trackedEntityAttributes[y].optionSet.options.length; x < arrLn; x++) {
              optionSetArr[data.trackedEntityAttributes[y].optionSet.options[x].code] = data.trackedEntityAttributes[y].optionSet.options[x].name;
            }
          }
        }
        w44flag = true;
        if (w44flag) {
          myWorker44.terminate();
          document.getElementById('loader').style.display = "none";
        }
      });

    };

    var printReport = function (finalKeyMap, newRow) {
      for (var h = 1, arrLen3 = keyMap2.length; h < arrLen3; h++) {
        //console.log(finalKeyMap[4])
        if (finalKeyMap.hasOwnProperty(h) && finalKeyMap[h] != null) {
          newRow = newRow + "<td>" + finalKeyMap[h] + "</td>";
        }
        else {
          newRow = newRow + "<td></td>";
        }
      }
      $('.eventsreporttable').append(newRow + "</tr>");
      document.getElementById('loader').style.display = "none";
    };

    var keyMap = [];
    var keyMap2 = [];

    var getEvents = function (keyMap, program) {
      var myWorker6 = new Worker('worker.js');
      var url3 = '../../events.json?ou=' + $scope.selectedOrgUnit.id + '&program=' + program.id + '&order=eventDate:ASC&skipPaging=true&startDate=' + $scope.startdateSelected + '&endDate=' + $scope.enddateSelected;
      // console.log(url3);
      myWorker6.postMessage(url3);
      myWorker6.addEventListener('message', function (response) {
        var res3 = (response.data).split('&&&');
        if (url3 != res3[1]) { return }
        var obj = jQuery.parseJSON(res3[0]);
        var data = obj;

        data.events.forEach(function (eventElement) {
          var pidd = eventElement.programStage;
          var finalKeyMap = [];
          for (var n = 0, arr = eventElement.dataValues.length; n < arr; n++) {
            var value = eventElement.dataValues[n].value;
            if (value == 'true') { value = "Yes" }
            if (value == 'false') { value = "No" }
            var optionValue = optionSetArr[value];
            if (typeof optionValue === undefined || optionValue === undefined) { }
            else { var value = optionValue; }
            var count2 = keyMap[pidd + '+' + eventElement.dataValues[n].dataElement];
            finalKeyMap[count2] = value;
          }
          printReport(finalKeyMap, "<tr>");
        });
      });
    };

    $scope.generateEventsReport = function (program) {
      $scope.isDisabled = false;
      programid = program.id;
      // $scope.exportDataJson(program);
      var w1flag = false;
      document.getElementById('loader').style.display = "block";

      var myWorker1 = new Worker('worker.js');
      $(".eventsreporttable tbody").remove();
      $(".eventsreporttable tbody").detach();
      //      var row = "<tr style='background-color:#c6c6c8;border:1px solid black' ><th style='background-color:#c6c6c8;border:1px solid black'>Event Name</th><th style='background-color:#c6c6c8;border:1px solid black'>Event Date</th><th style='background-color:#c6c6c8;border:1px solid black'>Orgunit</th>";
      //  var json = "";
      var ouname = _getOrgUnitName($scope.selectedOrgUnit.id);
      var index = 1;
      var counter = 0;

      var url = '../../programs/' + program.id + '.json?fields=programStages[id,name,programStageDataElements[dataElement[id,name]]]';
      myWorker1.postMessage(url);
      myWorker1.addEventListener('message', function (response) {
        var res1 = (response.data).split('&&&');
        if (url != res1[1]) { return }
        var obj = jQuery.parseJSON(res1[0]);
        var data2 = obj;
        var row = "";
        var hr = "<tr>";
        for (var j = 0, arrLen1 = data2.programStages.length; j < arrLen1; j++) {
          // getHeaderRow(json,program, row, hr, index, j);
          var pid = data2.programStages[j].id;
          hr = hr + "<th colspan ='" + data2.programStages[j].programStageDataElements.length + "'>" + data2.programStages[counter].name + "</th>";
          for (var k = 0, arrL = data2.programStages[j].programStageDataElements.length; k < arrL; k++) {
            var nameDe = data2.programStages[j].programStageDataElements[k].dataElement.name;
            var idDe = data2.programStages[j].programStageDataElements[k].dataElement.id;
            row = row + "<th class='eventrows' id='" + idDe + "'>" + nameDe + "</th>";
            keyMap[pid + '+' + idDe] = index;
            keyMap2[index] = pid + '+' + idDe;
            index++;
          }
          counter++;
          if (counter == data2.programStages.length) {
            $('.eventsreporttable').append(hr + "</tr>" + row + "</tr>");
            console.log(keyMap);
            console.log(keyMap2);
            getEvents(keyMap, program);
          }
        }
        //     getRows(row, hr, program, index);
        w1flag = true;

        if (w1flag) {
          myWorker1.terminate();
        }


      }, false);
    };





  });
