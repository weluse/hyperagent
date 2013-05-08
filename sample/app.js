/*exported HALCtrl */

function HALCtrl($scope, $location) {
  'use strict';

  $scope.location = $location;
  $scope.posts = [];
  $scope.user = null;
  $scope.users = [];

  $scope.$watch('location.path()', function (path) {
    console.log('New Pathhhh: ', path);
  });
}
