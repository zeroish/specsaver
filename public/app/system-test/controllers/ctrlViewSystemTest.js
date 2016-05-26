angular.module('app').controller('ctrlViewSystemTest', function($scope, $rootScope, $location, $routeParams, dbSystemTest, dbTestStep) {
    
	//Get the route parameters
	var projectCode = $routeParams.projectCode;
	var systemTestCode = $routeParams.systemTestCode;

    //Set the page title
    $rootScope.title += projectCode + '-S' + systemTestCode;

    //Gets the test step text from a string
    var getTestStepTextFromString = function(testStepString) {
        
        //If the argument opening bracket does not exist in the string, just return the string
        //Otherwise, return a substring up to the start of the argument
        return testStepString.indexOf('{') < 0
            ? testStepString
            : testStepString.substring(0, testStepString.indexOf('{'));
    };

    //Gets the test step argument name from a string
    var getArgumentNameFromString = function(testStepString) {
        
        //If the argument opening bracket does not exist in the string, just return an empty string
        //Otherwise, return a substring after the start of the bracket
        return argumentName = testStepString.indexOf('{') < 0
            ? ''
            : testStepString.substring(testStepString.indexOf('{') + 1, testStepString.length);
    };

    //Gets the test step argument value from a string
    var getArgumentValueFromString = function(testStepString, testStepIndex) {
        
        //Get the argument name from the string
        var argumentName = getArgumentNameFromString(testStepString);

        //If the argument name couldn't be found
        if (!argumentName) {
            
            //Return an empty string
            return '';
        }

        //Get the test step
        var testStep = $scope.systemTest.testStepArguments[testStepIndex];

        //If any arguments have already been recorded
        if (testStep.arguments) {

            //For each argument
            for (var argument of testStep.arguments) {

                //If the argument name matches
                if (argument.name == argumentName) {

                    //Return the value of the argument
                    return argument.value;
                }
            }
        }

        //If this point is reached, just return the argument name in brackets
        return '{' + argumentName + '}';
    };

    //Updates the test steps in the scope, both in original form and also by separating out the arguments
    var updateTestStepsInScope = function(testSteps) {

        //For each test step
        for (var t in testSteps) {

            //Create a new section in the test step to store the split version
            testSteps[t].split = [];
            
            //Split the step by closing argument brackets
            var splitSections = testSteps[t].step.split('}');

            //For each split section
            for (var s in splitSections) {

                //Get the test step text
                var text = getTestStepTextFromString(splitSections[s]);

                //Get the argument name
                var argumentName = getArgumentNameFromString(splitSections[s]);

                //Get the argument value
                var argumentValue = getArgumentValueFromString(splitSections[s], t);

                //If the test step text is not empty
                if (text) {

                    //Add it to the split test step array
                    testSteps[t].split.push({isEditable: false, type: 'test-step-text', value: text});
                }

                //If the argument name is not empty
                if (argumentName) {

                    //Add it to the split test step array
                    testSteps[t].split.push({isEditable: false, type: 'test-step-argument-name', value: argumentName});
                }

                //If the argument value is not empty
                if (argumentValue) {

                    //Determine the type
                    var type = argumentValue.startsWith('{') && argumentValue.endsWith('}')
                        ? 'test-step-argument-value-not-supplied'
                        : 'test-step-argument-value-supplied';

                    //Add it to the split test step array
                    testSteps[t].split.push({isEditable: true, type: type, value: argumentValue});
                }
            }
        }
        
        //Add the test steps to the scope
        $scope.testSteps = testSteps;
    };

    //Get the systemTest data
    dbSystemTest.getSystemTest(projectCode, systemTestCode).$promise.then(function(data) {

        //Store the data in the scope
        $scope.project = data.project;
        $scope.systemTest = data.systemTest;
        updateTestStepsInScope(data.testSteps);
        $scope.stats = data.stats;

        //Record whether a field is being edited
        $scope.edit = {};

        //Store the old value of a field as it is being edited
        $scope.oldData = {};

        //Shows or hides the form used to edit the field
        $scope.showEdit = function(show, fieldID, testStepNumber, sectionNumber) {

            //If the form should be shown
            if (show) {

                //If the test step and section numbers were supplied
                if (typeof testStepNumber !== 'undefined' && typeof sectionNumber !== 'undefined') {
                    
                    //Store the old data from the test steps section
                    $scope.oldData[fieldID] = $scope.testSteps[testStepNumber].split[sectionNumber].value;
                }
                else {
                    
                    //Store the old data from the system test section
                    $scope.oldData[fieldID] = $scope.systemTest[fieldID];
                }
            }

            //Show the edit fields
            $scope.edit[fieldID] = show;
        };

        //Cancels editing the field and hides the form
        $scope.cancelEdit = function(fieldID, testStepNumber, sectionNumber) {

            //If the test step and section numbers were supplied
            if (typeof testStepNumber !== 'undefined' && typeof sectionNumber !== 'undefined') {
                
                //Reset the old data from the test steps section
                $scope.testSteps[testStepNumber].split[sectionNumber].value = $scope.oldData[fieldID];
            }
            else {
                
                //Reset the old data from the system test section
                $scope.systemTest[fieldID] = $scope.oldData[fieldID];
            }

            //Stop editing
            $scope.showEdit(false, fieldID, testStepNumber, sectionNumber);
        };

        //Submits the edits made to the system test or a test step argument to the server
        $scope.submitEdit = function(fieldID, testStepNumber, sectionNumber, argumentName, argumentValue) {

            //If the test step and section numbers were supplied
            if (typeof testStepNumber !== 'undefined' && typeof sectionNumber !== 'undefined') {
                
                //Get the arguments for the test step
                var arguments = $scope.systemTest.testStepArguments[testStepNumber].arguments;

                //If the arguments list is non-existent
                if (!arguments) {
                    
                    //Create it with the argument name and value
                    arguments = [{name: argumentName, value: argumentValue}];
                }
                else {
                    
                    //Record if a matching argument is found
                    var isMatch = false;
                    
                    //For each existing argument
                    for (var argument of arguments) {
                        
                        //If the argument name matches
                        if (argument.name == argumentName) {
                            
                            //Update the value
                            argument.value = argumentValue;
                            
                            //Record that the argument was found and updated
                            isMatch = true;
                            
                            //Break from the loop
                            break;
                        }
                    }
                    
                    //If the argument was not found
                    if (!isMatch) {
                        
                        //Add it to the arguments list
                        arguments.push({name: argumentName, value: argumentValue});
                    }
                }

                //Update the arguments in the scope
                $scope.systemTest.testStepArguments[testStepNumber].arguments = arguments;
            }

            //Save the system test
            dbSystemTest.updateSystemTest($scope.systemTest);
            
            //Stop editing
            $scope.showEdit(false, fieldID, testStepNumber, sectionNumber);
        };

        //Store test step search results
        $scope.searchResults = [];

        //Searches for matching steps
        $scope.searchForTestStep = function() {

            //Search for a match
            dbTestStep.searchForTestStep(projectCode, $scope.newTestStep.type, $scope.newTestStep.step).$promise.then(function(results) {

                //Add the search results to the scope
                $scope.searchResults = results;

                //Set the current time
                $scope.searchResultsTime = new Date();
            });
        };

        //Store data on new test steps which are added
        $scope.newTestStep = {};

        //Clears the test step search window and sets the new test step position to the end of the list
        $scope.clearTestStepSearch = function() {

            //If a test step was selected previously
            if ($scope.newTestStep.code) {

                //Clear all the form fields
                $scope.newTestStep = {};

                //Clear the search results
                $scope.searchResults = [];

                //Clear the search time
                $scope.searchResultsTime = null;
            }

            //Set the position to be at the end of the list
            $scope.newTestStep.position = $scope.testSteps.length;
        };

        //Sets the new test step position
        $scope.setTestStepPosition = function(position) {

            //Set the position
            $scope.newTestStep.position = position;
        };

        //Adds a test step to the system test
        $scope.addTestStep = function() {

            //Get the test step data from the scope
            var testStep = {
                code: $scope.newTestStep.code,
                position: $scope.newTestStep.position,
                projectCode: projectCode,
                systemTestCode: systemTestCode
            };

            //Add the test step
            dbTestStep.addTestStep(testStep).$promise.then(function(data) {

                //Clear any existing errors
                $scope.testStepError = null;

                //Store the updated data in the scope
                $scope.systemTest = data.systemTest;
                updateTestStepsInScope(data.testSteps);
                
                //Close the dialog (JQuery)
                $("#ModalAddCloseButton").trigger('click');

            }, function(error) {

                //Add the error message to the scope
                $scope.testStepError = error.data.message;
            });
        };

        //Creates a test step and adds it to the system test
        $scope.createTestStep = function() {

            //Get the test step data from the scope
            var testStep = {
                code: null,
                type: $scope.newTestStep.type,
                step: $scope.newTestStep.step,
                projectCode: projectCode
            };

            //Create the test step
            dbTestStep.createTestStep(testStep).then(function(data) {

                //Clear any existing errors
                $scope.testStepError = null;
                
                //Store the new test step code in the scope
                $scope.newTestStep.code = data.code;

                //Add the step to the system test
                $scope.addTestStep();

            }, function(error) {

                //Add the error message to the scope
                $scope.testStepError = error.data.message;
            });
        };
    }, function(error) {
        
        //Redirect to the error page
        $location.path('/' + error.status);
    });
});