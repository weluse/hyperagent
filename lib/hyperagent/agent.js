import 'hyperagent/config' as c;
import 'hyperagent/loader' as loader;

function Agent(args) {
  if (args === Object(args)) {
    this.options = args;
  } else {
    this.options = { url: args };
  }
}

Agent.prototype.fetch = function fetch() {
  // Pick only AJAX-relevant options.
  var options = c._.pick(this._options, 'jsonp', 'headers', 'username',
      'password', 'url');
  return loader(options);
};

Agent.prototype.url = function url() {
  return this.options.url;
};

export Agent;
