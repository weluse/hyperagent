/*global describe, it, chai, Hyperagent, beforeEach, fixtures */
'use strict';
(function () {
  describe('Hyperagent.LazyResource', function () {
    it('should create resources on access', function () {
      var lazy = new Hyperagent.LazyResource({
        url: 'https://example.com'
      }, { foo: { bar: 'baz' } });
      assert.equal(lazy.foo.props.bar, 'baz')
    });

    it('should transform values', function () {
      var parent = new Hyperagent.Resource({
        url: 'http://example.com'
      });
      var lazy = new Hyperagent.LazyResource(parent, {
        foo: {
        }
      }, {
        factory: function (object, options) {
          var resource = new Hyperagent.Resource(options);
          resource._load(object);
          resource.omfg = true;
          return resource;
        }
      });

      assert(lazy.foo.omfg);
    });

    it('should set sub-resource urls', function () {
      var parent = new Hyperagent.Resource({ url: 'http://example.com/' });
      var lazy = new Hyperagent.LazyResource(parent, {
        foo: {
          _links: {
            self: { href: 'http://example.com/foo/' }
          },
          title: 'bar'
        }
      })

      assert.equal(lazy.foo.props.title, 'bar');
      assert.equal(parent.url(), 'http://example.com/');
      assert.equal(lazy.foo.url(), 'http://example.com/foo/');
    });
  });
}());
