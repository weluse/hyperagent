define("/hyperagent/miniscore",
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