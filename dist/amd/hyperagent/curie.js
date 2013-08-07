define("/hyperagent/curie",
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