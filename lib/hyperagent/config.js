var config = {};

// Provide defaults in case we're in a browser.
if (typeof window !== 'undefined') {
  config.ajax = window.$ && window.$.ajax.bind(window.$);
  config._ = window._;
  config.defer = window.Q && window.Q.defer;
}

export = config;
