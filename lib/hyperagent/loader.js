import 'hyperagent/config' as c;

function loader(options) {
  return new c.Promise(function (resolve, reject) {
    c.ajax(c._.extend(options, {
      success: resolve,
      error: reject
    }));
  });
}

export loader;
