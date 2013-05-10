define(
  ["hyperagent/config","exports"],
  function(c, __exports__) {
    "use strict";

    function loadAjax(options) {
      var deferred = c.defer();
      c.ajax(c._.extend(options, {
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


    __exports__.loadAjax = loadAjax;
  });