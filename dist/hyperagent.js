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

define('hyperagent',
  ["hyperagent/resource","hyperagent/properties","hyperagent/curie","hyperagent/config","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, config, __exports__) {
    "use strict";
    var Resource = __dependency1__.Resource;
    var LazyResource = __dependency1__.LazyResource;
    var LinkResource = __dependency1__.LinkResource;
    var Properties = __dependency2__.Properties;
    var CurieStore = __dependency3__.CurieStore;

    function configure(name, value) {
      config[name] = value;
    }


    __exports__.Resource = Resource;
    __exports__.Properties = Properties;
    __exports__.LazyResource = LazyResource;
    __exports__.LinkResource = LinkResource;
    __exports__.CurieStore = CurieStore;
    __exports__.configure = configure;
  });
define('hyperagent/config',
  ["hyperagent/miniscore"],
  function(_) {
    "use strict";

    var config = {};

    // Provide defaults in case we're in a browser.
    if (typeof window !== 'undefined') {
      config.ajax = window.$ && window.$.ajax.bind(window.$);
      config.defer = window.Q && window.Q.defer;
      config._ = _;
    }


    return config;
  });
define('hyperagent/curie',
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
define('hyperagent/loader',
  ["hyperagent/config","exports"],
  function(c, __exports__) {
    "use strict";

    function loadAjax(options) {
      var deferred = c.defer();
      c.ajax(c._.extend(options, {
        headers: {
          'Accept': 'application/hal+json, application/json, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest'
        },
        success: deferred.resolve,
        error: deferred.reject,
        dataType: 'html'  // We don't want auto-converting
      }));

      return deferred.promise;
    }


    __exports__.loadAjax = loadAjax;
  });
define('hyperagent/miniscore',
  [],
  function() {
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

    _.identity = function (val) {
      return val;
    };

    _.any = function (obj, iterator, context) {
      var result = false;
      if (!iterator) {
        iterator = _.identity;
      }

      if (obj === null || obj === undefined) {
        return result;
      }
      if (obj.some === Array.prototype.some) {
        return obj.some(iterator, context);
      }

      _.each(obj, function (value, index, list) {
        if (result || (result = iterator.call(context, value, index, list))) {
          return breaker;
        }
      });
      return !!result;
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


    return _;
  });
define('hyperagent/properties',
  ["hyperagent/config","exports"],
  function(c, __exports__) {
    "use strict";

    function Properties(response, options) {
      // XXX: This function is too large. Let's figure out if we could instead build
      // one large object for defineProperties first and call on that in the end
      // and if that would make the code cleaner.
      options = options || {};
      if (Object(response) !== response) {
        throw new Error('The Properties argument must be an object.');
      }
      // Overwrite the response object with the original properties if provided.
      c._.extend(response, options.original || {});

      var skipped = ['_links', '_embedded'];
      Object.keys(response).forEach(function (key) {
        if (!c._.contains(skipped, key)) {
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
            enumerable: true, /// XXX
            value: this[key]
          });
        }
      }.bind(this));
    }


    __exports__.Properties = Properties;
  });
define('hyperagent/resource',
  ["hyperagent/loader","hyperagent/properties","hyperagent/curie","hyperagent/config","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, c, __exports__) {
    "use strict";
    var loadAjax = __dependency1__.loadAjax;
    var Properties = __dependency2__.Properties;
    var CurieStore = __dependency3__.CurieStore;
    /*jshint strict:false, latedef:false */

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

    Resource.factory = function (Cls) {
      return function (object, options) {
        return new Cls(object, options);
      };
    };

    Resource.prototype.fetch = function fetch() {
      // Pick only AJAX-relevant options.
      var options = c._.pick(this._options, 'headers', 'username',
          'password', 'url');
      if (this._options.ajax) {
        c._.extend(options, this._options.ajax);
      }

      return loadAjax(options).then(function _ajaxThen(response) {
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
      this.props = new Properties(object, {
        curies: this.curies,
        original: this.props
      });
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


    __exports__.Resource = Resource;
    __exports__.LazyResource = LazyResource;
    __exports__.LinkResource = LinkResource;
  });
window.Hyperagent = requireModule('hyperagent');
}());