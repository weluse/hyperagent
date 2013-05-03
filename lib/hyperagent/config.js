var config = {};

// Provide defaults in case we're in a browser.
if (typeof windows !== 'undefined') {
  config.ajax = window.$ && window.$.ajax.bind(window.$);
  config._ = window._;
  config.Promise = window.RSVP && window.RSVP.Promise.bind(window.RSVP);
}

export config;
