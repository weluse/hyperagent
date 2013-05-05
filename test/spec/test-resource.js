/*global describe, it, chai, Hyperagent, beforeEach, fixtures */
'use strict';
(function () {
  var assert = chai.assert;

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

    describe('Resource.props', function () {
      beforeEach(function () {
        this.agent = new Hyperagent.Resource({ url: 'http://example.com/' });
      });

      it('should propagate properties via _parse', function () {
        this.agent._parse(JSON.stringify({ title: 'Hello World' }));
        assert(this.agent.props.title, 'Hello World');
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

        assert(this.agent.embedded.single.loaded);
        assert(this.agent.embedded.orders[0].loaded);
      });
    });
  });
}());
