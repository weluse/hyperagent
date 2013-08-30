import { config } from 'hyperagent/config';

export function loadAjax(options) {
  var deferred = config.defer();
  if (options.headers) {
    config._.extend(options.headers,{
      'Accept': 'application/hal+json, application/json, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest'
    })
  }
  config.ajax(config._.extend({
    success: deferred.resolve,
    error: deferred.reject,
    dataType: 'html'  // We don't want auto-converting
  }, options));

  return deferred.promise;
}
