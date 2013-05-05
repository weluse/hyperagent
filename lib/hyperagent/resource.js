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
  this.embedded = {};
  this.links = {};

  this.loaded = false;
}

Resource.prototype.fetch = function fetch() {
  // Pick only AJAX-relevant options.
  var options = c._.pick(this._options, 'jsonp', 'headers', 'username',
      'password', 'url');

  return ajax(options).then(function (response) {
    this._parse(response);
    this.loaded = true;

    // Return the agent back.
    return this;
  }.bind(this));
};

Resource.prototype.url = function url() {
  return this._options.url;
};

/**
 * Parses a response string.
 */
Resource.prototype._parse = function _parse(response) {
  var object = JSON.parse(response);
  this._load(object);
};

Resource.prototype._load = function _load(object) {
  this.props = new Properties(object);
  if (object._embedded) {
    this.embedded = new LazyResource(this._options, object._embedded);
  }
};

function LazyResource(options, object) {
  this._options = options;

  Object.keys(object).forEach(function (key) {
    var obj = object[key];

    if (Array.isArray(obj)) {
      this._setLazyArray(key, obj);
    } else {
      this._setLazyObject(key, obj);
    }
  }.bind(this));
}

LazyResource.prototype._setLazyObject = function _setLazy(key, object) {
  var options = this._options;
  console.log('setting lazy obj for ', key);

  // Define a lazy getter for the resource.
  Object.defineProperty(this, key, {
    get: function () {
      var resource = new Resource(options);
      resource._load(object);
      resource.loaded = true;
      return resource;
    }
  })
};

LazyResource.prototype._setLazyArray = function _setLazy(key, array) {
  var options = this._options;
  console.log('setting lazy array for ', key);

  // Define a lazy getter for the resource that contains the array.
  Object.defineProperty(this, key, {
    get: function () {
      return array.map(function (object) {
        var resource = new Resource(options);
        resource._load(object);
        resource.loaded = true;  // FIXME: Read spec if this is always the case.
        return resource;
      });
    }
  })
};

export { Resource, LazyResource };
