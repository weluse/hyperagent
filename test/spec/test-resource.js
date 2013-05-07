/*global describe, it, Hyperagent, beforeEach, fixtures, assert, _ */
'use strict';
(function () {
  describe('Resource', function () {
    it('should initialize', function () {
      var agent = new Hyperagent.Resource('http://example.com/');
      assert(agent.fetch);
    });

    it('should accept options hash', function () {
      var agent = new Hyperagent.Resource({
        url: 'http://example.com/'
      });
      assert(agent.fetch);
    });

    it('should return its url', function () {
      var agent = new Hyperagent.Resource('http://example.com/');
      assert(agent.url(), 'http://example.com/');
    });

    it('should return its url from an options hash', function () {
      var agent = new Hyperagent.Resource({ url: 'http://example.com/' });
      assert(agent.url(), 'http://example.com/');
    });

    it('should not be loaded by default', function () {
      var agent = new Hyperagent.Resource({ url: 'http://example.com/' });
      assert.isFalse(agent.loaded);
    });

    it('should normalize relative paths', function () {
      var agent = new Hyperagent.Resource({
        url: 'http://example.com/subresource'
      });
      agent._load({ _links: { order: { href: '../orders' } } });
      assert.equal(agent.links.order.url(), 'http://example.com/orders');
    });

    it('should absolutize paths', function () {
      var agent = new Hyperagent.Resource({
        url: 'http://example.com/subresource/nested'
      });
      agent._load({ _links: { order: { href: '/orders' } } });
      assert.equal(agent.links.order.url(), 'http://example.com/orders');
    });

    it('should absolutize full urls', function () {
      var agent = new Hyperagent.Resource({
        url: 'http://example.com/subresource/nested'
      });
      agent._load({ _links: { order: { href: 'http://example.com/orders' } } });
      assert.equal(agent.links.order.url(), 'http://example.com/orders');
    });

    describe('Resource.props', function () {
      beforeEach(function () {
        this.agent = new Hyperagent.Resource({ url: 'http://example.com/' });
      });

      it('should propagate properties via _parse', function () {
        this.agent._parse(JSON.stringify({ title: 'Hello World' }));
        assert(this.agent.props.title, 'Hello World');
      });

      it('should be iterable', function () {
        this.agent._load({prop1: 1, prop2: 2, prop3: 3});
        var pairs = _.pairs(this.agent.props);
        assert.deepEqual(pairs, [['prop1', 1], ['prop2', 2], ['prop3', 3]]);
      });
    });

    describe('Resource.embedded', function () {
      beforeEach(function () {
        this.agent = new Hyperagent.Resource({ url: 'http://example.com/' });
      });

      it('should expose embedded after parsing', function () {
        this.agent._parse(JSON.stringify(fixtures.embeddedOrders));
        assert.equal(this.agent.embedded.single.props.title, 'yours truly');
        assert.equal(this.agent.embedded.orders.length, 2);
        assert.equal(this.agent.embedded.orders[0].props.status, 'shipped');
      });

      it('should support recursively embedded resources', function () {
        this.agent._load(fixtures.recursiveEmbed);

        assert.equal(this.agent.embedded.single.embedded.user.props.title,
          'passy');
      });

      it('should have loaded embeds', function () {
        this.agent._parse(JSON.stringify(fixtures.embeddedOrders));

        assert(this.agent.embedded.single.loaded,
          'single should be marked as loaded');
        assert(this.agent.embedded.orders[0].loaded,
          'first order be marked as loaded');
      });

      it('should have the self url of the embedded resource', function () {
        this.agent._parse(JSON.stringify(fixtures.embeddedOrders));

        assert.equal(this.agent.embedded.single.url(),
          'http://example.com/self/');
      });

      it('should be iterable', function () {
        this.agent._parse(JSON.stringify(fixtures.embeddedOrders));

        var keys = Object.keys(this.agent.embedded);
        assert.deepEqual(keys, ['orders', 'single']);
      });
    });

    describe('Resource.links', function () {
      beforeEach(function () {
        this.agent = new Hyperagent.Resource({ url: 'http://example.com/' });
      });

      it('should expose their props', function () {
        this.agent._load({ _links: { self: { href: 'http://example.com/self' } } });
        assert.equal(this.agent.links.self.props.href, 'http://example.com/self');
      });

      it('should expose self link without fetching', function () {
        this.agent._load({ _links: { self: { href: 'http://example.com/self' } } });
        assert.equal(this.agent.links.self.url(), 'http://example.com/self');
      });

      it('should have its self href as url', function () {
        this.agent._load(fixtures.simpleLink);

        assert.equal(this.agent.links.orders.url(),
          'https://example.com/orders/');
      });

      it('should be iterable', function () {
        this.agent._load(fixtures.simpleLink);

        var keys = Object.keys(this.agent.links);
        assert.deepEqual(keys, ['self', 'orders']);
      });

      describe('Templated Links', function () {
        it('should expand links', function () {
          this.agent._load({ _links: {
            user: { href: 'http://example.com/users/{user}', templated: true }
          } });
          var link = this.agent.link('user', { user: 'passy' });
          assert.equal(link.url(), 'http://example.com/users/passy');
        });

        it('should be equivalent to call link or access links', function () {
          this.agent._load({ _links: {
            users: { href: 'http://example.com/users/' } }
          });
          assert.deepEqual(this.agent.link('users'), this.agent.links['users']);
        });
      });
    });

  });
}());
