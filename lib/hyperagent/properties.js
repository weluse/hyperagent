import 'hyperagent/config' as c;

function Properties(response, options) {
  options = options || {};
  if (Object(response) !== response) {
    throw new Error('The Properties argument must be an object.');
  }

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

export Properties;
