/*exported HALCtrl */

function HALCtrl($scope, $location) {
  'use strict';

  $scope.location = $location;
  $scope.users = [{
    "href": "/users/graste",
    "title": "gra ste"
  },
  {
    "href": "/users/mamund",
    "title": "Mike Amundsen"
  },
  {
    "href": "/users/amir",
    "title": "Amir Mohtasebi"
  }];
  $scope.$watch('location.path()', function (path) {
    console.log('New Pathhhh: ', path);
  });
}
