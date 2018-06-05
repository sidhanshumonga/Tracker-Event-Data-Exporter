//Controller for column show/hide
msfReportsApp.controller('LeftBarMenuController',
        function($scope,
                $location) {
    $scope.exportappFun = function(){
        $location.path('/exportapp').search();
    };
            $scope.showEventReport = function(){
                $location.path('/event-report').search();
            };


        });