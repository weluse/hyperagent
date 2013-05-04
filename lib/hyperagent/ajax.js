import 'hyperagent/config' as c;

function ajax(options) {
  var deferred = c.defer();
  c.ajax(c._.extend(options, {
    success: deferred.resolve,
    error: deferred.reject
  }));

  return deferred.promise;
}

export = ajax;
