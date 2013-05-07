/*global describe, it, Hyperagent, beforeEach, fixtures, assert, _ */
'use strict';
(function () {
  describe('Hyperagent.LinkResource', function () {
    it('should construct', function () {
      var link = new Hyperagent.LinkResource({foo: 'bar', href: '/'}, {});
      assert.equal(link.props.foo, 'bar');
    });

    it('should expand links', function () {
      var link = new Hyperagent.LinkResource(
        {
          href: '/users/{user}',
          templated: true
        },
        { url: 'http://example.com/' }
      );
      link.expand({ user: 'stephenplusplus' });
      assert.equal(link.url(), 'http://example.com/users/stephenplusplus');
    });
  });
}());
