import 'hyperagent/config' as c;

function Properties(response) {
  if (Object(response) !== response) {
    throw new Error('The Properties argument must be an object.');
  }

  var skipped = ['_links', '_embedded'];
  Object.keys(response).forEach(function (key) {
    if (!c._.contains(skipped, key)) {
      this[key] = response[key];
    }
  }.bind(this));
}

export Properties;
