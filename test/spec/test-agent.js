/*global describe, it, chai, Hyperagent */
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
  });
})();
