/*global angular, Hyperagent, jQuery */
/*exported HALCtrl */

var module = angular.module('hal', []);

module.factory('HALTalkResource', function HALTalkResource() {
  'use strict';

  // Configure Hyperagent to prefix every URL with the unicorn proxy.
  Hyperagent.configure('ajax', function ajax(options) {
    options.url = 'http://unicorn-cors-proxy.herokuapp.com/' + options.url;

    return jQuery.ajax(options);
  });

  return new Hyperagent.Resource('http://haltalk.herokuapp.com/');
});

module.controller('HALCtrl', function HALCtrl($scope, $location, HALTalkResource) {
  'use strict';

  $scope.location = $location;
  $scope.posts = null;
  $scope.user = null;
  $scope.users = [];

  $scope.$watch('location.path()', function (path) {
    // Strip the leading slash
    var username = path.substring(1);
    if (!username) {
      return;
    }

    HALTalkResource.fetch().then(function () {
      var user = HALTalkResource.link('ht:me', { name: username });
      $scope.navigateToUser(user);
    });
  });

  $scope.navigateToUser = function (user) {
    user.fetch().then(function () {
      $scope.$apply(function () {
        $scope.user = user;
        $scope.posts = null;
      });

      return user.links['ht:posts'].fetch();
    }).then(function (posts) {
      $scope.$apply(function () {
        $scope.posts = posts.embedded['ht:post'];
      });
    }).fail(function () {
      console.error('Failed to fetch user.');
    });
  };

  HALTalkResource.fetch().then(function () {
    return HALTalkResource.links['ht:users'].fetch();
  }).then(function (users) {
    $scope.$apply(function () {
      $scope.users = users.links['ht:user'];
    });
  }).fail(function (err) {
    console.error('Something went wrong: ', err);
  });
});
