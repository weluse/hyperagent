define("/hyperagent/loader",
  ["hyperagent/config","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var config = __dependency1__.config;

    function loadAjax(options) {
      var deferred = config.defer();
      config.ajax(config._.extend({
        headers: {
          'Accept': 'application/hal+json, application/json, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest'
        },
        success: deferred.resolve,
        error: deferred.reject,
        dataType: 'html'  // We don't want auto-converting
      }, options));

      return deferred.promise;
    }

    __exports__.loadAjax = loadAjax;
  });