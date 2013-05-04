/*global describe, it, chai, Hyperagent, beforeEach */
'use strict';
(function () {
  var assert = chai.assert;

  describe('Agent', function () {
    it('should initialize', function () {
      var agent = new Hyperagent.Agent('http://example.com/');
      assert(agent.fetch);
    });

    it('should accept options hash', function () {
      var agent = new Hyperagent.Agent({
        url: 'http://example.com/'
      });
      assert(agent.fetch);
    });

    it('should return its url', function () {
      var agent = new Hyperagent.Agent('http://example.com/');
      assert(agent.url(), 'http://example.com/');
    });

    it('should return its url from an options hash', function () {
      var agent = new Hyperagent.Agent({ url: 'http://example.com/' });
      assert(agent.url(), 'http://example.com/');
    });

    it('should not be loaded by default', function () {
      var agent = new Hyperagent.Agent({ url: 'http://example.com/' });
      assert.isFalse(agent.loaded);
    });

    describe('Agent.props', function () {
      beforeEach(function () {
        this.agent = new Hyperagent.Agent({ url: 'http://example.com/' });
      });

      it('should propagate properties via _parse', function () {
        // XXX: This is actually an invalid HAL document, so it should reaise an
        // error.
        this.agent._parse(JSON.stringify({ title: 'Hello World' }));
        assert(this.agent.props.title, 'Hello World');
      });

      it('should be loaded after parsing', function () {
        // XXX: This is actually an invalid HAL document, so it should reaise an
        // error.
        this.agent._parse(JSON.stringify({ title: 'Hello World' }));
        assert(this.agent.loaded);
      });
    });
  });
})();
