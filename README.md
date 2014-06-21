# hyperagent.js [![Build Status](https://secure.travis-ci.org/weluse/hyperagent.png?branch=master)](https://travis-ci.org/weluse/hyperagent) [![Coverage Status](https://coveralls.io/repos/weluse/hyperagent/badge.png?branch=master)](https://coveralls.io/r/weluse/hyperagent?branch=master) [![devDependency Status](https://david-dm.org/weluse/hyperagent/dev-status.svg)](https://david-dm.org/weluse/hyperagent#info=devDependencies)


hyperagent.js is a JavaScript library for consuming [HAL] hypermedia APIs in the
browser.

## Installation

Download with bower or alternatively
[install manually](http://weluse.github.io/hyperagent/install/).

```bash
bower install hyperagent
```

## Compatibility

hyperagent aims to be compatible with draft 5 of the HAL specification. As the
spec is still being developed, hyperagent.js is unlikely to have a stable API
until HAL itself stabilizes.

## Dependencies

hyperagent.js has one hard and two soft dependencies:

- [URI.js](http://medialize.github.io/URI.js/) (+ URITemplate.js)
- A jQuery-compatible AJAX implementation (e.g [jQuery](http://jquery.com/),
  [zepto](http://zeptojs.com/), [reqwest](https://github.com/ded/reqwest)), *default*:
  jQuery
- A Promise/A+ implementation (e.g [q](http://documentup.com/kriskowal/q/), [RSVP.js](https://github.com/tildeio/rsvp.js)), *default*: q

To use other than the default implementations, see `configure` below.

## Demo

You can see the library in action in the
[live sample application](http://weluse.github.io/hyperagent/sample/) and check
out the source in [`sample/`](https://github.com/weluse/hyperagent/tree/master/sample).

## Plugins

hyperagent.js provides some facilities for plugins to hook into and work with
data from the response object. There is currently one plugin:

- [hyperagent-forms.js](https://github.com/weluse/hyperagent-forms) adds
  support for a custom HAL forms profile

## Example

The following JSON response represents the entry point of
`https://api.example.com` and shall serve as an example for using hyperclient.

```json
{
  "_links": {
    "self": {
      "href": "/"
    },
    "curies": [
      {
        "name": "ht",
        "href": "http://haltalk.herokuapp.com/rels/{rel}",
        "templated": true
      }
    ],
    "ht:users": {
      "href": "/users"
    },
    "ht:signup": {
      "href": "/signup"
    },
    "ht:me": {
      "href": "/users/{name}",
      "templated": true
    },
    "ht:latest-posts": {
      "href": "/posts/latest"
    }
  },
  "_embedded": {
    "ht:post": [{
      "_links": {
        "self": {
          "href": "/posts/4ff8b9b52e95950002000004"
        },
        "ht:author": {
          "href": "/users/mamund",
          "title": "Mike Amundsen"
        }
      },
      "content": "having fun w/ the HAL Talk explorer",
      "created_at": "2012-07-07T22:35:33+00:00"
    }, {
      "_links": {
        "self": {
          "href": "/posts/4ff9331ee85ace0002000001"
        },
        "ht:author": {
          "href": "/users/mike",
          "title": "Mike Kelly"
        },
        "ht:in-reply-to": {
          "href": "/posts/4ff8b9b52e95950002000004"
        }
      },
      "content": "Awesome! Good too see someone figured out how to post something!! ;)",
      "created_at": "2012-07-08T07:13:34+00:00"
    }]
  },
  "welcome": "Welcome to a haltalk server.",
  "hint_1": "You need an account to post stuff..",
  "hint_2": "Create one by POSTing via the ht:signup link..",
  "hint_3": "Click the orange buttons on the right to make POST requests..",
  "hint_4": "Click the green button to follow a link with a GET request..",
  "hint_5": "Click the book icon to read docs for the link relation."
}
```

### Instantiating

Using defaults:

```javascript
var Resource = require('hyperagent').Resource;
var api = new Resource('https://api.example.com/');

api.fetch().then(function (root) {
  console.log('API root resolved:', root);
  assert(root.url() === 'https://api.example.com/');
}, function (err) {
  console.warn('Error fetching API root', err);
});
```

With custom connection parameters:

```javascript
var Resource = require('hyperagent').Resource;
var api = new Resource({
  url: 'https://api.example.com/',
  headers: { 'Accept': 'application/vnd.example.com.hal+json' },
  username: 'foo',
  password: 'bar',
  ajax: {
    foo: 'bar'
  }
});
```

The options `username`, `password`, `headers` as well as any additional options
in `ajax` will be passed on to the AJAX implementation. For example, the above
request would call the underlying AJAX function with these parameters:

```javascript
config.ajax({
  url: 'https://api.example.com/',
  headers: { 'Accept': 'application/vnd.example.com.hal+json' },
  username: 'foo',
  password: 'bar',
  foo: 'bar'
});
```

### Attributes

Attributes are exposed as the `props` object on the Resource instance:

```javascript
var welcome = root.props.welcome;
var hint1 = root.props.hint_1;

assert(welcome === 'Welcome to a haltalk server.');
assert(hint1 === 'You need an account to post stuff..');
```

### Embedded resources

Embedded ressources are exposed via the `embedded` attribute of the Resource
object and can be accessed either via the expanded URI or their currie.
Resources are Resource instances of their own.

```javascript
assert(root.embedded['ht:post'][0].props.content ===
       'having fun w/ the HAL Talk explorer');

root.embedded['ht:post'][1].links['ht:in-reply-to'].fetch().then(function (post) {
  console.log('User replying to comment #2:', post.links['ht:author'].props.title);
})
```

Sub-resources like `embedded` or `links` are also enumerable, so you can use
them like this:

```javascript
var contents = root.embedded['ht:post'].map(function (post) {
  return post.props.content;
});
assert(contents[0], 'having fun w/ the HAL Talk explorer');
assert(contents[1], 'Awesome! Good too see someone figured out how to post something!! ;)');
```

### Links

Links are exposed through the `links` attribute and are either Resource
instances or a list of instances.

Using standalone links:

```javascript
assert(root.links.self.url() === root.url());

// Access via currie ht:users
root.links['ht:users'].fetch().then(function (users) {
  // Access via expanded URI
  return users.links['http://haltalk.herokuapp.com/rels/user'][0].fetch();
}).then(function (user) {
  console.log('First user name: ', user.props.title);
});
```

To use [RFC6570] templated links, you can provide additional options to the
`link` function:

```javascript
root.link('ht:me', { name: 'mike' }).fetch().then(function (user) {
  assert(user.props.username === 'mike');
});
```

Using the `url()` accessor, you can get the absolute URL of the resource you are
accessing:

```javascript
var url = root.links['ht:signup'].url();
assert(url === 'http://haltalk.herokuapp.com/signup');
```

By default, `fetch()` only requests the resource once from the server and
directly returns a promise on the cached result on successive calls. If you want
to force a refresh from the server, you can set the `force` flag in an options
object:

```javascript
root.links['ht:users'].fetch().then(...);

// Enforce a refresh.
root.links['ht:users'].fetch({ force: true }).then(...);
```

If you want to pass in custom options to the AJAX call, you can specify them via
the `ajax` option:

```javascript
root.links['ht:users'].fetch({ ajax: { headers: { 'X-Awesome': '1337' } } }).then(...);
```


### Curies

[Curies] are supported in that you can access links, properties and embedded
resources either with their short form or the expanded link, which means the
following two statements are equivalent:

```javascript
var link1 = root.links['ht:signup'];
var link2 = root.links['http://haltalk.herokuapp.com/rels/signup'];

assert.deepEqual(link1, link2);
```

## API

### configure

Hyperagent depends on an AJAX and a Promise/A+ implementation,
which are replaceable as long as they implement the common interface. The
default implementations are:

- `ajax` -- `window.$.ajax`
- `defer` -- `window.Q.defer`
- `_` -- `Hyperagent.miniscore` (based on underscore.js)

You can use the `configure` function to override those defaults:

```javascript
Hyperagent.configure('ajax', reqwest);
Hyperagent.configure('defer', RSVP.Promise);
Hyperagent.configure('_', lodash);
```

### Resource#url()

Returns the URL of where the resource was or is about to be fetched from. This
value is always an absolute, normalized URL in contrast to the value of
`links.self.href`.

### Resource#fetch([options])

Loads the document from the URL provided and enabled the access via `props`,
`links`, and `embedded`. Returns a chainable promise.

```javascript
(new Resource('http://example.com/')).fetch().then(function (api) {
  console.log('href: ', api.links.self.props.href);
});
```

The optional `options` object can have these keys:

  - `force`: defaults to `false`, overrides the internal cache
  - `ajax`: overrides Resource-level AJAX options

### Resource#loaded

A boolean indicating whether the resource has been completely loaded or is
potentially incomplete. Resources retrieved via `fetched()` and embedded
resources are considered as fully loaded.

### Resource#links

An object, containing links with their rel as key. Links are resources, lazily
created on access or arrays of links.

### Resource#link(rel[, params])

Creates a new link resource identified by the given `rel` and expands the link
template if params are provided. For non-templated links, those too calls are
equivalent:

```javascript
assert.deepEqual(api.links.self, api.link('self'));
```

Calling with parameters:

```javascript
// Given a `me` URI template of `http://example.com/users/{username}`
var link = api.link('me', { username: 'sindresorhus' });
assert(link.url() === 'http://example.com/users/sindresorhus');
```

### Resource#embedded

An object containing all embedded resource, created lazily on access.

### Resources#props

An object containing all properties on the current resource. This includes all
properties of the resource, except `_links` and `_embedded`.

### Resource.resolveUrl(oldUrl, newUrl)

Combines an old with a new URL:

```javascript
var res = Hyperagent.Resource.resolveUrl('http://example.com/foo', '/bar');
assert.equal(res, 'http://example.com/bar');
```

## FAQ

### Promises?

For now, hyperagent only supports a promise-based callback mechanism, because I
believe that working with Hypermedia APIs inherently leads to deeply nested code
using the standard callback-based approach. Promises, however, solve this
beautifully by providing chaining mechanisms to flatten those calls.

It is not impossible though, that hyperagent will eventually get an alternative
callback-based API.

  [RFC6570]: http://tools.ietf.org/html/rfc6570
  [HAL]: http://tools.ietf.org/html/draft-kelly-json-hal-05
  [Curies]: http://www.w3.org/TR/curie/

## License

Licensed under MIT
