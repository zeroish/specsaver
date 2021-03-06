angular.module('app').controller('ctrlViewProject', function($scope, $rootScope, $location, $routeParams, dbProject) {
    
    //Get the route parameters
    var projectCode = $routeParams.projectCode;

    //Set the page title
    $rootScope.title += projectCode;

    //Set the navigation settings
    $scope.nav = {
        project: {isCurrentSection: true},
        settings: {isExpanded: true}
    };

	//Get data related to the project
	dbProject.getProject(projectCode).$promise.then(function(data)
    {
        //Store the data in the scope
        $scope.project = data.project;
        $scope.stats = data.stats;

        //Record whether a field is being edited
        $scope.edit = {};

        //Store the old value of a field as it is being edited
        $scope.oldData = {};

        //Shows or hides the form used to edit the field
        $scope.showEdit = function(field, show) {

            //If the form should be shown
            if (show) {
                
                //Store the old data
                $scope.oldData[field] = $scope.project[field];
            }

            //Show the edit fields
            $scope.edit[field] = show;
        };

        //Cancels editing the field and hides the form
        $scope.cancelEdit = function(field) {
            
            //Reset the value
            $scope.project[field] = $scope.oldData[field];

            //Stop editing
            $scope.showEdit(field, false);
        };

        //Submits the edits made to the field to the server
        $scope.submitEdit = function(field) {
            
            //Save the project
            dbProject.updateProject($scope.project);

            //Stop editing
            $scope.showEdit(field, false);
        };

        //Exports all data in the project to JSON
        $scope.exportProject = function() {

            //Export the project
            dbProject.exportProject(projectCode).$promise.then(function(data) {
                
                //Clear any error messages in the scope
                $scope.exportProjectError = null;
                
                //Store the data in the scope
                $scope.exported = JSON.stringify(data);

            }, function(error) {
                
                //Add the error message to the scope
                $scope.exportProjectError = error.data.message;
            });
        };
    }, function(error) {
        
        //Redirect to the error page
        $location.path('/' + error.status);
    });
});