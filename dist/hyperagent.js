(function () {
var define, requireModule;

(function () {
  'use strict';
  var registry = {}, seen = {};

  define = function (name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requireModule = function (name) {
    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    var mod = registry[name],
        deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i = 0, l = deps.length; i < l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(deps[i]));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;
  };
}());

define("hyperagent",
  ["hyperagent/resource","hyperagent/properties","hyperagent/curie","hyperagent/config","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var Resource = __dependency1__.Resource;
    var LazyResource = __dependency1__.LazyResource;
    var LinkResource = __dependency1__.LinkResource;
    var Properties = __dependency2__.Properties;
    var CurieStore = __dependency3__.CurieStore;
    var _config = __dependency4__.config;

    function configure(name, value) {
      _config[name] = value;
    }


    __exports__.Resource = Resource;
    __exports__.Properties = Properties;
    __exports__.LazyResource = LazyResource;
    __exports__.LinkResource = LinkResource;
    __exports__.CurieStore = CurieStore;
    __exports__.configure = configure;
    __exports__._config = _config;
  });
define("hyperagent/config",
  ["hyperagent/miniscore","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var _ = __dependency1__._;

    var config = {};

    // Provide defaults in case we're in a browser.
    if (typeof window !== 'undefined') {
      config.ajax = window.$ && window.$.ajax.bind(window.$);
      config.defer = window.Q && window.Q.defer;
      config._ = _;
      config.loadHooks = [];
    }


    __exports__.config = config;
  });
define("hyperagent/curie",
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
     * A simple data storage to register and expand CURIES:
     * http://www.w3.org/TR/curie/
     */
    function CurieStore() {
      this._store = {};
    }

    CurieStore.prototype.register = function register(key, value) {
      this._store[key] = URITemplate(value);
    };

    CurieStore._split = function (value) {
      var index = value.indexOf(':');
      var curie = value.substring(0, index);
      var ref = value.substring(index + 1);

      if (value === -1 || value === (value.length - 1)) {
        return null;
      }

      return [curie, ref];
    };

    /**
     * Boolean if the store is empty.
     */
    CurieStore.prototype.empty = function empty() {
      return Object.keys(this._store).length === 0;
    };

    /**
     * Expands a CURIE value or returns the value back if it cannot be
     * expanded.
     */
    CurieStore.prototype.expand = function expand(value) {
      var template;
      var curie = CurieStore._split(value);

      if (!curie) {
        return value;
      }

      template = this._store[curie[0]];
      if (template === undefined) {
        return value;
      }

      return template.expand({ rel: curie[1] });
    };

    /**
     * A boolean indicator whether a value can (probably) be expanded.
     */
    CurieStore.prototype.canExpand = function canExpand(value) {
      var curie = CurieStore._split(value);

      if (!curie) {
        return false;
      }

      return this._store[curie[0]] !== undefined;
    };

    __exports__.CurieStore = CurieStore;
  });
define("hyperagent/loader",
  ["hyperagent/config","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var config = __dependency1__.config;

    function loadAjax(options) {
      var deferred = config.defer();
      if (options.headers) {
        config._.extend(options.headers, {
          'Accept': 'application/hal+json, application/json, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest'
        });
      }
      config.ajax(config._.extend({
        success: deferred.resolve,
        error: deferred.reject,
        dataType: 'html'  // We don't want auto-converting
      }, options));

      return deferred.promise;
    }

    __exports__.loadAjax = loadAjax;
  });
define("hyperagent/miniscore",
  ["exports"],
  function(__exports__) {
    "use strict";
    /*jshint strict:false */
    /**
     * A minimal collection of underscore functions used in the project without
     * pre-ES5 compatibility.
     */

    var _ = {};
    var breaker = {};

    _.each = _.forEach = function (obj, iterator, context) {
      if (obj === null || obj === undefined) {
        return;
      }

      if (obj.forEach === Array.prototype.forEach) {
        obj.forEach(iterator, context);
      } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
          if (iterator.call(context, obj[i], i, obj) === breaker) {
            return;
          }
        }
      } else {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (iterator.call(context, obj[key], key, obj) === breaker) {
              return;
            }
          }
        }
      }
    };

    _.contains = function (obj, target) {
      if (obj === null || obj === undefined) {
        return false;
      }

      if (obj.indexOf === Array.prototype.indexOf) {
        return obj.indexOf(target) !== -1;
      }

      return _.any(obj, function (value) {
        return value === target;
      });
    };

    _.pick = function (obj) {
      var copy = {};
      var keys = Array.prototype.concat.apply(Array.prototype,
          Array.prototype.slice.call(arguments, 1));

      _.each(keys, function (key) {
        if (key in obj) {
          copy[key] = obj[key];
        }
      });
      return copy;
    };

    _.extend = function (obj) {
      _.each(Array.prototype.slice.call(arguments, 1), function (source) {
        if (source) {
          for (var prop in source) {
            obj[prop] = source[prop];
          }
        }
      });
      return obj;
    };

    _.defaults = function (obj) {
      _.each(Array.prototype.slice.call(arguments, 1), function (source) {
        if (source) {
          for (var prop in source) {
            if (obj[prop] === null || obj[prop] === undefined) {
              obj[prop] = source[prop];
            }
          }
        }
      });
      return obj;
    };

    _.clone = function (obj) {
      if (obj !== Object(obj)) {
        return obj;
      }

      return Array.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };

    __exports__._ = _;
  });
define("hyperagent/properties",
  ["hyperagent/config","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var config = __dependency1__.config;

    function Properties(response, options) {
      // XXX: This function is too large. Let's figure out if we could instead build
      // one large object for defineProperties first and call on that in the end
      // and if that would make the code cleaner.
      options = options || {};
      if (Object(response) !== response) {
        throw new Error('The Properties argument must be an object.');
      }
      // Overwrite the response object with the original properties if provided.
      config._.defaults(response, options.original || {});

      var skipped = ['_links', '_embedded'];
      Object.keys(response).forEach(function (key) {
        if (!config._.contains(skipped, key)) {
          this[key] = response[key];
        }
      }.bind(this));

      // Set up curies
      var curies = options.curies;
      if (!curies) {
        return;
      }

      Object.keys(this).forEach(function (key) {
        if (curies.canExpand(key)) {
          Object.defineProperty(this, curies.expand(key), {
            enumerable: true,
            value: this[key]
          });
        }
      }.bind(this));
    }

    __exports__.Properties = Properties;
  });
define("hyperagent/resource",
  ["hyperagent/config","hyperagent/loader","hyperagent/properties","hyperagent/curie","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var config = __dependency1__.config;
    var loadAjax = __dependency2__.loadAjax;
    var Properties = __dependency3__.Properties;
    var CurieStore = __dependency4__.CurieStore;
    /*jshint strict:false, latedef:false */

    var _ = config._;

    function Resource(args) {
      if (Object(args) === args) {
        this._options = args;
      } else {
        this._options = { url: args };
      }

      // Create empty attributes by default.
      this.props = new Properties({});
      this.embedded = {};
      this.links = {};
      this.curies = new CurieStore();

      // Set up default loadHooks and add configurables to the end.
      this._loadHooks = [
        this._loadLinks,
        this._loadEmbedded,
        this._loadProperties
      ].concat(config.loadHooks);

      this.loaded = false;
    }

    Resource.factory = function (Cls) {
      return function (object, options) {
        return new Cls(object, options);
      };
    };

    /**
     * Fetch the resource from server at the resource's URL using the `loadAjax`
     * module. By default the following instance options are passed to the AJAX
     * function:
     *
     * - headers
     * - username
     * - password
     * - url (not directly set by the user)
     *
     * In addition, all options from `options.ajax` of the Resource instance are
     * mixed in.
     *
     * Parameters:
     * - options:
     *   - force: defaults to false, whether to force a new request if the result is
     *   cached, i. e this resource is already marked as `loaded`.
     *   - ajax: optional hash of options to override the Resource AJAX options.
     *
     * Returns a promise on the this Resource instance.
     */
    Resource.prototype.fetch = function fetch(options) {
      options = _.defaults(options || {}, { force: false });

      if (this.loaded && !options.force) {
        // Could use Q sugar here, but that would break compatibility with other
        // Promise/A+ implementations.
        var deferred = config.defer();
        deferred.resolve(this);
        return deferred.promise;
      }

      // Pick only AJAX-relevant options.
      var ajaxOptions = _.pick(this._options, 'headers', 'username',
          'password', 'url');
      if (this._options.ajax) {
        _.extend(ajaxOptions, this._options.ajax);
      }
      if (options.ajax) {
        _.extend(ajaxOptions, options.ajax);

      }

      return loadAjax(ajaxOptions).then(function _ajaxThen(response) {
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
      var _link = this.links[rel];
      if (params) {
        _link.expand(params);
      }

      return _link;
    };

    /**
     * Parses a response string.
     */
    Resource.prototype._parse = function _parse(response) {
      var object = JSON.parse(response);
      this._load(object);
    };

    /**
     * Loads the Resource.links resources on creation of the object.
     */
    Resource.prototype._loadLinks = function _loadLinks(object) {
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
    };

    /**
     * Loads the Resource.embedded resources on creation of the object.
     */
    Resource.prototype._loadEmbedded = function _loadEmbedded(object) {
      if (object._embedded) {
        this.embedded = new LazyResource(this, object._embedded, {
          factory: Resource.factory(EmbeddedResource),
          curies: this.curies
        });
      }
    };


    /**
     * Loads the Resource.props resources on creation of the object.
     */
    Resource.prototype._loadProperties = function _loadProperties(object) {
      // Must come after _loadCuries
      this.props = new Properties(object, {
        curies: this.curies,
        original: this.props
      });
    };

    Resource.prototype._load = function _load(object) {
      this._loadHooks.forEach(function (hook) {
        hook.bind(this)(object);
      }.bind(this));
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

    Resource.resolveUrl = function _resolveUrl(oldUrl, newUrl) {
      if (!newUrl) {
        throw new Error('Expected absolute or relative URL, but got: ' + newUrl);
      }

      var uri = new URI(newUrl);
      if (uri.is('absolute')) {
        // Replace the current url if it's absolute
        return uri.normalize().toString();
      } else if (newUrl[0] === '/') {
        return (new URI(oldUrl))
          .resource(newUrl).normalize().toString();
      } else {
        return new URI([oldUrl, newUrl].join('/'))
          .normalize().toString();
      }
    };

    /**
     * Updates the internal URL to the new, relative change. This is not an
     * idempotent function.
     *
     * Returns a boolean indicating whether the navigation changed the previously
     * used URL or not.
     */
    Resource.prototype._navigateUrl = function _navigateUrl(value) {
      var newUrl = Resource.resolveUrl(this._options.url, value);
      if (newUrl !== this._options.url) {
        this._options.url = newUrl;
        return true;
      }

      return false;
    };

    /**
     * Wrap a resource inside a lazy container that loads all properties of the
     * given `object` on access in a Resource.
     *
     * Arguments:
     *  - parentResource: the parent resource the new lazy one inherits its options
     *    from
     *  - object: the object to wrap
     *  - options: optional options
     *    - factory: A function taking a the object and the options to wrap inside a
     *      Resource.
     */
    function LazyResource(parentResource, object, options) {
      this._parent = parentResource;
      this._options = _.defaults(options || {}, {
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

      _.each(object, function (obj, key) {
        if (Array.isArray(obj)) {
          this._setLazyArray(key, obj, true);
        } else {
          this._setLazyObject(key, obj, true);
        }
      }.bind(this));

      // Again for curies
      var curies = this._options.curies;
      if (curies && !curies.empty()) {
        _.each(object, function (obj, key) {
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
      var instance;

      return function () {
        if (instance === undefined) {
          instance = new options.factory(object, _.clone(parent._options));
        }
        return instance;
      };
    };


    function EmbeddedResource(object, options) {
      // Inherit from Resource
      Resource.call(this, options);

      this._load(object);

      // Embedded resources are alsways considered as loaded.
      this.loaded = true;
    }

    _.extend(EmbeddedResource.prototype, Resource.prototype);

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

    _.extend(LinkResource.prototype, Resource.prototype);

    LinkResource.prototype.expand = function (params) {
      if (!this.templated) {
        console.log('Trying to expand non-templated LinkResource: ', this);
      }

      var url = (new URI.expand(this.href, params)).toString();

      // If expansion triggered a URL change, consider the current data stale.
      if (this._navigateUrl(url)) {
        this.loaded = false;
      }
    };

    LinkResource.prototype.toString = function () {
      return 'LinkResource(url="' + this.url() + '")';
    };


    __exports__.Resource = Resource;
    __exports__.LazyResource = LazyResource;
    __exports__.LinkResource = LinkResource;
  });
window.Hyperagent = requireModule('hyperagent');
}());