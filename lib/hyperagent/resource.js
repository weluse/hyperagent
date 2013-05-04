import 'hyperagent/config' as c;
import 'hyperagent/ajax' as ajax;
import Properties from 'hyperagent/properties';

function Resource(args) {
  if (args === Object(args)) {
    this._options = args;
  } else {
    this._options = { url: args };
  }

  // Create empty attributes by default.
  this.props = Properties({});
  this.loaded = false;
}

Resource.prototype.fetch = function fetch() {
  // Pick only AJAX-relevant options.
  var options = c._.pick(this._options, 'jsonp', 'headers', 'username',
      'password', 'url');

  return ajax(options).then(function (response) {
    this._parse(response);

    // Return the agent back.
    return this;
  }.bind(this));
};

Resource.prototype.url = function url() {
  return this._options.url;
};

Resource.prototype._parse = function _parse(response) {
  var object = JSON.parse(response);
  this.props = new Properties(object);

  this.loaded = true;
};

export Resource;
