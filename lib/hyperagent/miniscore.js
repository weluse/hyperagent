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

  return ._any(obj, function (value) {
    return value === target;
  });
};

// _.pick
// _.extend
// _.defaults

export = _;
