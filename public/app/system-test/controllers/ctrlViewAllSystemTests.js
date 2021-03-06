angular.module('app').controller('ctrlViewAllSystemTests', function($scope, $rootScope, $location, $routeParams, dbSystemTest) {
    
    //Get the route parameters
    var projectCode = $routeParams.projectCode;
    
	//Set the page title
    $rootScope.title += projectCode;

    //Set the navigation settings
    $scope.nav = {
        systemTest: {isCurrentSection: true},
    };

    //Get the system tests associated with the project
    dbSystemTest.getAllSystemTests(projectCode).$promise.then(function(data) {

        //Store the data in the scope
        $scope.project = data.project;
        $scope.systemTests = data.systemTests;
        $scope.stats = data.stats;

        //Set the clickable row URL function
        $scope.goTo = function(systemTestCode) {
            $location.path('/p/' + $scope.project.code + '/s/' + systemTestCode);
        };

    }, function(error) {
        
        //Redirect to the error page
        $location.path('/' + error.status);
    });
});