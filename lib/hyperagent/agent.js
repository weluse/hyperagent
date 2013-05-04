import 'hyperagent/config' as c;
import 'hyperagent/loader' as loader;
import Properties from 'hyperagent/properties';

function Agent(args) {
  if (args === Object(args)) {
    this._options = args;
  } else {
    this._options = { url: args };
  }

  // Create empty attributes by default.
  this.props = Properties({});
  this.loaded = false;
}

Agent.prototype.fetch = function fetch() {
  // Pick only AJAX-relevant options.
  var options = c._.pick(this._options, 'jsonp', 'headers', 'username',
      'password', 'url');

  return loader(options).then(function (response) {
    this._parse(response);

    // Return the agent back.
    return this;
  }.bind(this));
};

Agent.prototype.url = function url() {
  return this._options.url;
};

Agent.prototype._parse = function _parse(response) {
  var object = JSON.parse(response);
  this.props = new Properties(object);

  this.loaded = true;
};

export Agent;
