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

    it('should resolve URLs', function () {
      var result = Hyperagent.Resource.resolveUrl('http://example.com/foo',
        '/bar');
      assert.equal(result, 'http://example.com/bar');
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

    it('should support expanded curies in properties', function () {
      var agent = new Hyperagent.Resource({
        url: 'http://example.com/'
      });

      agent._load({
        _links: {
          curies: [{
            name: 'ex',
            href: 'http://example.com/rels/{rel}',
            templated: true
          }]
        },

        'ex:order': {
          bought: true
        }
      });

      var order1 = agent.props['ex:order'];
      var order2 = agent.props['http://example.com/rels/order'];

      assert(order1);
      assert.deepEqual(order1, order2);
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

      it('should be cached', function () {
        this.agent._load({ _links: { orders: { href: 'http://example.com/orders' } } });
        assert.equal(this.agent.links.orders, this.agent.links.orders);
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

      it('should not override pre-loaded link properties', function () {
        this.agent._load(fixtures.extendedLink);
        var orders = this.agent.links.orders;
        assert.equal(orders.props.title, 'Orders');
        orders._load({
          description: 'Some fancy list of orders.'
        });
        assert.equal(orders.props.title, 'Orders',
          'title attribute should still be there');
        assert.equal(orders.props.description, 'Some fancy list of orders.');
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

      describe('CURIE Links', function () {
        it('should treat CURIE links like normal links', function () {
          this.agent._load({ _links: {
            'ht:users': { href: '/users/' },
            curies: [{
              name: 'ht',
              href: 'http://example.com/rels/{rel}',
              templated: true
            }]
          } });

          var link = this.agent.links['ht:users'];
          var link2 = this.agent.links['http://example.com/rels/users'];

          assert(link);
          assert.deepEqual(link, link2);
        });

        it('should not make expanded CURIES enumerable', function () {
          this.agent._load({ _links: {
            'ht:users': { href: '/users/' },
            curies: [{
              name: 'ht',
              href: 'http://example.com/rels/{rel}',
              templated: true
            }]
          } });

          var links = Object.keys(this.agent.links);
          assert.deepEqual(links, ['ht:users']);
        });
      });
    });

    describe('Resource#fetch', function () {
      beforeEach(function () {
        this.agent = new Hyperagent.Resource({ url: 'http://example.com/' });
        this.ajaxCalls = [];
        Hyperagent.configure('ajax', function () {
          this.ajaxCalls.push(arguments);
        }.bind(this));
      });

      it('should mix in ajax options', function () {
        this.agent._load({ _links: {
          users: { href: '/users/' }
        } });

        this.agent.links.users.fetch({ ajax: {
          type: 'HEAD'
        } });

        assert.equal(this.ajaxCalls.length, 1);
        assert.equal(this.ajaxCalls[0][0].url, 'http://example.com/users/');
        assert.equal(this.ajaxCalls[0][0].type, 'HEAD');
      });

      it('should override ressource-level ajax options', function () {
        var agent = new Hyperagent.Resource({
          url: 'http://example.com/',
          ajax: { headers: { 'X-Awesome': '23' }, cache: false }
        });
        agent._load({ _links: {
          users: { href: '/users/' }
        } });

        agent.links.users.fetch({ ajax: {
          cache: true
        } });

        assert.equal(this.ajaxCalls.length, 1);
        assert.equal(this.ajaxCalls[0][0].url, 'http://example.com/users/');
        assert.isTrue(this.ajaxCalls[0][0].cache);
        assert.equal(this.ajaxCalls[0][0].headers['X-Awesome'], 23);
      });
    });

    describe('#related', function () {
      beforeEach(function () {
        this.agent = new Hyperagent.Resource({ url: 'http://example.com/' });
        this.ajaxCalls = [];
        Hyperagent.configure('ajax', function () {
          this.ajaxCalls.push(arguments);
        }.bind(this));
      });

      it('should follow links when there is no embedded', function () {
        this.agent._load({ _links: {
          user: { href: 'http://example.com/users/passy' }
        } });
        var link = this.agent.related('user');
        assert.equal(link.url(), 'http://example.com/users/passy');
      });

      it('should expand templates', function () {
        this.agent._load({ _links: {
          user: { href: 'http://example.com/users/{user}', templated: true }
        } });
        var link = this.agent.related('user', { user: 'passy' });
        assert.equal(link.url(), 'http://example.com/users/passy');
      });

      it('should return cached resource from embedded when available', function () {
        this.agent._load({ _embedded: {
          user: { _links: { self: { href: 'http://example.com/users/passy' }}}
        } });
        var link = this.agent.related('user');
        assert.equal(link.url(), 'http://example.com/users/passy');
      });

      it('should prefer embedded over links', function () {
        this.agent._load({
          _embedded: {
            user: { _links: { self: { href: 'http://example.com/users/passy' }}}
          },
          _links: {
            user: { href: 'http://example.com/users/fail' }
          } });
        var link = this.agent.related('user');
        assert.equal(link.url(), 'http://example.com/users/passy');
      });

    });

    describe('loadHooks', function () {
      afterEach(function () {
        Hyperagent.configure('loadHooks', []);
      });

      it('should have configurable loadHooks', function () {

        var myHook = function (object) {
          assert.equal(object._links.self.href, 'http://example.com/');
          this.awesome = true;
        };

        Hyperagent.configure('loadHooks', [myHook]);
        var agent = new Hyperagent.Resource('http://example.com/');
        agent._load({ _links: { self: { href: 'http://example.com/' } } });
        assert(agent.awesome);
      });
    });
  });
}());
