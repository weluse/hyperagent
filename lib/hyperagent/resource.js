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

  return ajax(options).then(function _ajaxThen(response) {
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
    this.links = new LazyResource(this, object._links, {
      transform: function (resource, object) {
        // The href is OPTIONAL, even for links.
        if (object.href) {
          resource._navigateUrl(object.href);
        } else {
          console.warn('Link object did not provide a `href`: ', object);
        }

        return resource;
      }
    });

    // Don't access through this.links to avoid triggering recursions
    if (object._links.self) {
      this._navigateUrl(object._links.self.href);
    }
  }

  if (object._embedded) {
    this.embedded = new LazyResource(this, object._embedded, {
      transform: function (resource) {
        // Assume that embedded resources are as complete as if they were
        // fetched from the server.
        resource.loaded = true;
        return resource;
      }
    });
  }
};

/**
 * Updates the internal URL to the new, relative change. This is not an
 * idempotent function.
 */
Resource.prototype._navigateUrl = function _navigateUrl(value) {
  if (!value) {
    throw new Error('Expected absolute or relative URL, but got: ' + value);
  }

  // TODO: Handle relative changes
  this._options.url = value;
};

/**
 * Wrap a resource inside a lazy container that loads all properties of the
 * given `object` on access in a Resource.
 *
 * Arguments:
 *  - parentResource: the resource this one depends is created from
 *    extract a custom URL value.
 *  - object: the object to wrap
 *  - options: optional options
 *    - transform: A function applied to the resource once accessed, receives
 *      the new resource and the source object as parameters and is expected to
 *      return the resource.
 */
function LazyResource(parentResource, object, options) {
  this._parent = parentResource;
  this._options = _.defaults(options || {}, {
    transform: _.identity
  });

  _.each(object, function (obj, key) {
    if (Array.isArray(obj)) {
      this._setLazyArray(key, obj);
    } else {
      this._setLazyObject(key, obj);
    }
  }.bind(this));
}

LazyResource.prototype._setLazyObject = function _setLazy(key, object) {
  // Define a lazy getter for the resource.
  Object.defineProperty(this, key, {
    get: this._makeGetter(object)
  });
};

LazyResource.prototype._setLazyArray = function _setLazy(key, array) {
  // Define a lazy getter for the resource that contains the array.
  Object.defineProperty(this, key, {
    get: function () {
      return array.map(function (object) {
        return this._makeGetter(object)();
      }.bind(this));
    }
  });
};

LazyResource.prototype._makeGetter = function _makeGetter(object) {
  var parent = this._parent;
  var options = this._options;

  return function () {
      var resource = new Resource(_.clone(parent._options));
      resource._load(object);
      return options.transform(resource, object);
  }.bind(this);
};

export { Resource, LazyResource };
