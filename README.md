# hyperagent

A JavaScript library running ~~both on NodeJS and~~ in the browser for consuming
[HAL] hypermedia APIs. NodeJS support is postponed until browser support is
stabilized.

## Compatibility

hyperagent aims to be compatible with draft 5 of the HAL specification. As the
spec is still being developed, hypermedia is unlikely to have a stable API until
HAL itself stabilizes.

## Dependencies

During development, there are a few requirements (see [issue #4](https://github.com/passy/hyperagent/issues/4)):

- jQuery (\*)
- Q (\*)
- underscore (\*)
- URI.js (+ URITemplate.js)

\* These are soft dependencies and can be replaced with compatible
implementations. See `configure` below for more information.

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
  password: 'bar'
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

Using the `url()` accessor, you can get the absolute of the resource you are
accessing:

```javascript
var url = root.links('ht:signup').url();
assert(url === 'http://haltalk.herokuapp.com/signup');
```

## API

### configure

Hyperagent depends on an underscore, an AJAX and a Promise/A+ implementation, which
are replaceable as long as they implement the common interface. The default
implementations are:

- `_` -- `window._`
- `ajax` -- `window.$.ajax`
- `defer` -- `window.Q.defer`

You can use the `configure` function to override those defaults:

```javascript
Hyperagent.configure('_', lodash);
Hyperagent.configure('ajax', reqwest);
Hyperagent.configure('defer', RSVP.Promise);
```

### Resource#url()

Returns the URL of where the resource was or is about to be fetched from. This
value is always an absolute, normalized URL in contrast to the value of
`links.self.href`.

### Resource#fetch()

Loads the document from the URL provided and enabled the access via `props`,
`links`, and `embedded`. Returns a chainable promise.

```javascript
(new Resource('http://example.com/')).fetch().then(function (api) {
  console.log('href: ', api.links.self.props.href);
});
```

### Resource#loaded

A boolean indicating whether the resource has been completely loaded or is
potentially incomplete. Resources retrieved via `fetched()` and embedded
resources are considered as fully loaded.

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

## License

Licensed under MIT
