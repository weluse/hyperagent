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

    it('should allow for custom self getters', function () {
      var HREF = 'https://example.com/orders';
      var lazy = new Hyperagent.LazyResource({
        url: 'http://example.com',
        selfAccessor: function (o) {
          return o.props.self.href;
        }
      }, {
        foo: {
          self: { href: HREF }
        }
      });

      assert.equal(lazy.foo.url(), HREF);
    });
  });
}());
