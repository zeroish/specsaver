angular.module('app').controller('ctrlViewFeatureUserStories', function($scope, $rootScope, $location, $routeParams, dbUserStory) {
    
    //Get the route parameters
    var projectCode = $routeParams.projectCode;
    var featureCode = $routeParams.featureCode;

    //Set the page title
    $rootScope.title += projectCode + '-' + featureCode;

    //Set the navigation settings
    $scope.nav = {
        userStory: {isCurrentSection: true},
    };

    //Get the user stories data
    dbUserStory.getAllUserStories(projectCode, featureCode).$promise.then(function(data) {

        //Store the data in the scope
        $scope.project = data.project;
        $scope.feature = data.feature;
        $scope.userStories = data.userStories;
        $scope.stats = data.stats;
        
        //Set the clickable row URL function
        $scope.goTo = function(userStoryCode) {
            $location.path('/p/' + $scope.project.code + '/f/' + $scope.feature.code + '/u/' + userStoryCode);
        };

    }, function(error) {
        
        //Redirect to the error page
        $location.path('/' + error.status);
    });
});