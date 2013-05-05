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

  // HAL actually defines this as OPTIONAL
  if (object._links) {
    this.links = new LazyResource(this._options, object._links);
  }

  if (object._embedded) {
    this.embedded = new LazyResource(this._options, object._embedded);
  }
};

/**
 * Wrap a resource inside a lazy container that loads all properties of the
 * given `object` on access in a Resource.
 *
 * Arguments:
 *  - options: options of the root resource, url will be overwritten
 *  - object: the object to wrap
 */
function LazyResource(options, object) {
  this._options = options;

  _.each(object, function (obj, key) {
    if (Array.isArray(obj)) {
      this._setLazyArray(key, obj);
    } else {
      this._setLazyObject(key, obj);
    }
  }.bind(this));
}

LazyResource.prototype._setLazyObject = function _setLazy(key, object) {
  var options = this._options;

  // Define a lazy getter for the resource.
  Object.defineProperty(this, key, {
    get: this._makeGetter(options, object)
  });
};

LazyResource.prototype._setLazyArray = function _setLazy(key, array) {
  var options = this._options;

  // Define a lazy getter for the resource that contains the array.
  Object.defineProperty(this, key, {
    get: function () {
      return array.map(function (object) {
        return this._makeGetter(options, object)();
      }.bind(this));
    }
  });
};

LazyResource.prototype._makeGetter = function _makeGetter(options, object) {
  return function () {
      var resource = new Resource(options);
      resource._load(object);
      resource.loaded = true;
      return resource;
  }.bind(this);
};

export { Resource, LazyResource };
