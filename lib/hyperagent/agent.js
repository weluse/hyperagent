import 'hyperagent/config' as c;
import 'hyperagent/loader' as loader;

function Agent(args) {
  if (args === Object(args)) {
    this._options = args;
  } else {
    this._options = { url: args };
  }
}

Agent.prototype.fetch = function fetch() {
  // Pick only AJAX-relevant options.
  var options = c._.pick(this._options, 'jsonp', 'headers', 'username',
      'password', 'url');

  return loader(options).then(function (response) {
    var agent = new Agent(options);
    agent._parse(response);

    return agent;
  });
};

Agent.prototype.url = function url() {
  return this.options.url;
};

Agent.prototype._parse = function _parse() {
  console.log('Parsing, parsing ...', arguments);
};

export Agent;
