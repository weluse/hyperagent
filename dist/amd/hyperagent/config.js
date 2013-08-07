define("/hyperagent/config",
  ["hyperagent/miniscore","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var _ = __dependency1__._;

    var config = {};

    // Provide defaults in case we're in a browser.
    if (typeof window !== 'undefined') {
      config.ajax = window.$ && window.$.ajax.bind(window.$);
      config.defer = window.Q && window.Q.defer;
      config._ = _;
      config.loadHooks = [];
    }


    __exports__.config = config;
  });