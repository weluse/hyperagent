"use strict";
var config = require("hyperagent/config");

function loadAjax(options) {
  var deferred = config.defer();
  config.ajax(config._.extend(options, {
    headers: {
      'Accept': 'application/hal+json, application/json, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest'
    },
    success: deferred.resolve,
    error: deferred.reject,
    dataType: 'html'  // We don't want auto-converting
  }));

  return deferred.promise;
}


exports.loadAjax = loadAjax;