import { _ } from 'hyperagent/miniscore';

var config = {};

// Provide defaults in case we're in a browser.
if (typeof window !== 'undefined') {
  config.ajax = window.$ && window.$.ajax.bind(window.$);
  config.defer = window.Q && window.Q.defer;
  config._ = _;
  config.loadHooks = [];
}

export { config };
