angular.module('app').factory('apiAcceptanceTest', function($resource) {
    return $resource('/api/acceptance-tests/:projectCode/:featureCode/:userStoryCode/:acceptanceTestCode', {projectCode: "@projectCode", featureCode: "@featureCode", userStoryCode: "@userStoryCode", acceptanceTestCode: "@acceptanceTestCode"}, {
        getAll: {method: 'GET', isArray: false, cancellable: true, url: '/api/acceptance-tests/all/:projectCode/:featureCode/:userStoryCode'},
        getOne: {method: 'GET', isArray: false, cancellable: true, url: '/api/acceptance-tests/one/:projectCode/:featureCode/:acceptanceTestCode'},
        search: {method: 'GET', isArray: true, cancellable: true, url: '/api/acceptance-tests/search/:projectCode/:criteria'},
        update: {method: 'PUT', isArray: false}
    });
});