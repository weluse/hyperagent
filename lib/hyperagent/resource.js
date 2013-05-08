import 'hyperagent/config' as c;
import 'hyperagent/ajax' as ajax;
import Properties from 'hyperagent/properties';
import CurieStore from 'hyperagent/curie';

function Resource(args) {
  if (args === Object(args)) {
    this._options = args;
  } else {
    this._options = { url: args };
  }

  // Create empty attributes by default.
  this.props = new Properties({});
  this.embedded = {};
  this.links = {};
  this.curies = new CurieStore();

  this.loaded = false;
}

Resource.factory = function (cls) {
  return function (object, options) {
    return new cls(object, options);
  }
};

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
 * Creates a new link resource identified by the given `rel` and expands the link
 * template if params are provided.
 *
 * Arguments:
 *  - rel: The rel of the link.
 *  - params: Optional parameters to expand the link if it is a templated link.
 */
Resource.prototype.link = function link(rel, params) {
  var link = this.links[rel];
  if (params) {
    link.expand(params);
  }

  return link;
};

/**
 * Parses a response string.
 */
Resource.prototype._parse = function _parse(response) {
  var object = JSON.parse(response);
  this._load(object);
};

Resource.prototype._load = function _load(object) {
  // HAL actually defines this as OPTIONAL
  if (object._links) {
    if (object._links.curies) {
      this._loadCuries(object._links.curies);
      // Don't expose these through the normal link interface.
      delete object._links.curies;
    }

    // Don't access through this.links to avoid triggering recursions
    if (object._links.self) {
      this._navigateUrl(object._links.self.href);
    }

    this.links = new LazyResource(this, object._links, {
      factory: Resource.factory(LinkResource),
      curies: this.curies
    });
  }

  if (object._embedded) {
    this.embedded = new LazyResource(this, object._embedded, {
      factory: Resource.factory(EmbeddedResource),
      curies: this.curies
    });
  }

  // Must come after _loadCuries
  this.props = new Properties(object, { curies: this.curies });
};

/**
 * Saves a list of curies to the local curie store.
 */
Resource.prototype._loadCuries = function _loadCuries(curies) {
  if (!Array.isArray(curies)) {
    console.warn('Expected `curies` to be an array, got instead: ', curies);
    return;
  }

  curies.forEach(function (value) {
    if (!value.templated) {
      console.warn('CURIE links should always be marked as templated: ', value);
    }

    this.curies.register(value.name, value.href);
  }.bind(this));
};

/**
 * Updates the internal URL to the new, relative change. This is not an
 * idempotent function.
 */
Resource.prototype._navigateUrl = function _navigateUrl(value) {
  if (!value) {
    throw new Error('Expected absolute or relative URL, but got: ' + value);
  }

  var uri = new URI(value);
  if (uri.is('absolute')) {
    // Replace the current url if it's absolute
    this._options.url = uri.normalize().toString();
  } else if (value[0] === '/') {
    this._options.url = (new URI(this._options.url))
      .resource(value).normalize().toString();
  } else {
    // TODO: Handle relative changes
    this._options.url = new URI([this._options.url, value].join('/'))
      .normalize().toString();
  }
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
 *    - factory: A function taking a the object and the options to wrap inside a
 *      Resource.
 */
function LazyResource(parentResource, object, options) {
  this._parent = parentResource;
  this._options = c._.defaults(options || {}, {
    factory: function (object, options) {
      var resource = new Resource(options);
      resource._load(object);

      return resource;
    }
  });

  // Set _parent and _options to not be enumerable, to allow easy looping over
  // all entries.
  Object.defineProperties(this, {
    _parent: {
      enumerable: false
    },
    _options: {
      enumerable: false
    }
  });

  c._.each(object, function (obj, key) {
    if (Array.isArray(obj)) {
      this._setLazyArray(key, obj, true);
    } else {
      this._setLazyObject(key, obj, true);
    }
  }.bind(this));

  // Again for curies
  var curies = this._options.curies;
  if (curies && !curies.empty()) {
    c._.each(object, function (obj, key) {
      if (curies.canExpand(key)) {
        var expanded = curies.expand(key);

        if (Array.isArray(obj)) {
          this._setLazyArray(expanded, obj, false);
        } else {
          this._setLazyObject(expanded, obj, false);
        }
      }
    }.bind(this));
  }
}

LazyResource.prototype._setLazyObject = function _setLazy(key, object, enumerable) {
  // Define a lazy getter for the resource.
  Object.defineProperty(this, key, {
    enumerable: enumerable,
    get: this._makeGetter(object)
  });
};

LazyResource.prototype._setLazyArray = function _setLazy(key, array, enumerable) {
  // Define a lazy getter for the resource that contains the array.
  Object.defineProperty(this, key, {
    enumerable: enumerable,
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
      return new options.factory(object, c._.clone(parent._options));
  }.bind(this);
};


function EmbeddedResource(object, options) {
  // Inherit from Resource
  Resource.call(this, options);

  this._load(object);

  // Embedded resources are alsways considered as loaded.
  this.loaded = true;
}

c._.extend(EmbeddedResource.prototype, Resource.prototype);

function LinkResource(object, options) {
  // Inherit from Resource
  Resource.call(this, options);

  // Store href for later expansion in case it's a templated URI.
  this.href = object.href;
  this.templated = object.templated;

  // The href is OPTIONAL, even for links.
  if (!this.href) {
    console.warn('Link object did not provide an `href`: ', object);
  } else if (!this.templated) {
    this._navigateUrl(this.href);
  }

  this._load(object);
}

c._.extend(LinkResource.prototype, Resource.prototype);

LinkResource.prototype.expand = function (params) {
  if (!this.templated) {
    console.log('Trying to expand non-templated LinkResource: ', this);
  }

  var url = (new URI.expand(this.href, params)).toString();
  this._navigateUrl(url);
};

LinkResource.prototype.toString = function () {
  return 'LinkResource(url="' + this.url() + '")';
};

export { Resource, LazyResource, LinkResource };
