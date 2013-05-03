import 'hyperagent/config' as c;

function Agent(args) {
  if (args === Object(args)) {
    this.options = args;
  } else {
    this.options = { url: args };
  }
}

Agent.prototype._ajax = function ajax(options) {
  return new c.Promise(function (resolve, reject) {
    c.ajax(c._.extend(options, {
      success: resolve,
      error: reject
    }));
  });
}

Agent.prototype.fetch = function fetch() {
  // Pick only AJAX-relevant options.
  var options = c._.pick(this._options, 'jsonp', 'headers', 'username',
      'password', 'url');
  return this._ajax(options);
};

export Agent;
