var mongoose = require('mongoose');

var systemTestSchema = mongoose.Schema({
    name: {type:String, required:'{PATH} is required'},
    code: {type: String, required: '{PATH} is required'},
    description: {type:String},
    projectCode: {type:String, required: '{PATH} is required'}
});

systemTestSchema.index({code: 1, projectCode: 1}, {unique: true});

//Creates a new system test
systemTestSchema.statics.createSystemTest = function createSystemTest(newSystemTestData) {
    
    //Return a promise
    return new Promise(function(resolve, reject) {

        //If the project exists
        mongoose.model('Project').exists(newSystemTestData.projectCode).then(function() {

            //Create the system test
            mongoose.model('SystemTest').create(newSystemTestData, function(error, systemTest) {

                //If an error occurred
                if(error) {

                    //If the error code was 11000
                    if (error.code == 11000) {

                        //Update the error message to be more user friendly
                        error.errmsg = 'A system test with the same code already exists.';
                    }

                    //Return the error
                    reject(error);
                }
                else {

                    //Otherwise, return the system test and project code
                    resolve({code: systemTest.code, projectCode: systemTest.projectCode});
                }
            });
        }, function(error) {

            //Return the error
            reject(error);
        });
    });
};

//Checks whether the system test with the supplied code exists
systemTestSchema.statics.exists = function exists(projectCode, systemTestCode) {

    //Return a promise
    return new Promise(function(resolve, reject) {

        //Find the number of system tests by code
        mongoose.model('SystemTest').count({code: systemTestCode, projectCode: projectCode}).exec(function(error, count) {

            //If an error occurred
            if (error) {

                //Return the error
                reject(error);
            }
            //Else if the system test couldn't be found
            else if (!count) {

                //Return a 404 error
                reject({code: 404, errmsg: 'System test not found'});
            }
            //Else if multiple system tests were found
            else if (count > 1) {

                //Return a 400 error
                reject({code: 400, errmsg: 'Multiple system tests found with the same code'});
            }
            else {

                //Otherwise, return successfully
                resolve();
            }
        });
    });
};

//Gets all system tests by project code
systemTestSchema.statics.getAllSystemTestsByProject = function getAllSystemTestsByProject(projectCode) {

	//Return a promise
	return new Promise(function(resolve, reject) {

        //Find the system tests by project code
        mongoose.model('SystemTest').find({projectCode: projectCode}, '-_id code description name').sort('name').exec(function(error, systemTests) {

            //If an error occurred
            if (error) {

                //Return the error
                reject(error);
            }
            else {

                //Otherwise, return the system tests
                resolve(systemTests);
            }
        });
    });
};

//Gets the system test with the supplied system test code
systemTestSchema.statics.getSystemTest = function getSystemTest(projectCode, systemTestCode) {

    //Return a promise
    return new Promise(function(resolve, reject) {

        //Find the systemTest
        mongoose.model('SystemTest').findOne({code: systemTestCode, projectCode: projectCode}, '-_id code description name projectCode').exec(function(error, systemTest) {

            //If an error occurred
            if (error) {

                //Return the error
                reject(error);
            }
            else {

                //Otherwise, return the systemTest
                resolve(systemTest);
            }
        });
    });
};

//Gets overall statistics for system tests associated with the project
systemTestSchema.statics.getSystemTestStatsForProject = function getSystemTestStatsForProject(projectCode) {

    //Return a promise
    return new Promise(function(resolve, reject) {
        
        //Count the number of system tests associated with the project
        var projectCount = mongoose.model('SystemTest').count({projectCode: projectCode}).exec();

        //If all the promises are successful
        Promise.all([projectCount]).then(function(data) {

            //Return the statistics
            resolve({total: data[0]});

        }, function(error) {
            
            //Return the error
            reject(error);
        });
    });
};

//Updates an existing system test
systemTestSchema.statics.updateSystemTest = function updateSystemTest(newSystemTestData) {
    
    //Return a promise
    return new Promise(function(resolve, reject) {

        //Find the system test and update it
        mongoose.model('SystemTest').findOneAndUpdate({code: newSystemTestData.code, projectCode: newSystemTestData.projectCode}, newSystemTestData, function(error, systemTest) {

            //If an error occurred
            if (error) {

                //Return the error
                reject(error);
            }
            //Else if the system test wasn't found
            else if (!systemTest) {

                //Return a 404 error
                reject({code: 404, errmsg: 'SystemTest not found'});
            }
            else {

                //Otherwise, return successfully
                resolve();
            }
        });
    });
};

var SystemTest = mongoose.model('SystemTest', systemTestSchema);