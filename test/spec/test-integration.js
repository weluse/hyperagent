/*global describe, it, assert, Hyperagent, beforeEach, fixtures */
'use strict';
(function () {

  describe('Hyperagent Integration Test', function () {
    // Configure AJAX to return what we tell it to return.
    before(function () {
      var that = this;

      this.ajaxCalls = [];
      this.ajaxResponses = [];

      var ajaxMock = function (options) {
        that.ajaxCalls.push(options);

        // Could potentially re-use RSVP's async module here to get rid of the
        // 30ms delay.
        window.setTimeout(function () {
          options.success(that.ajaxResponses.pop());
        }, 0);
      };
      Hyperagent.configure('ajax', ajaxMock);
    });

    it('should successfully parse a sample response', function (done) {
      this.ajaxResponses.push(JSON.stringify(fixtures.fullDoc));

      var agent = new Hyperagent.Agent('https://example.com');
      assert.equal(this.ajaxCalls.length, 0);
      var promise = agent.fetch().then(function (result) {
        done();
        assert.equal(agent.props.welcome, 'Welcome to a haltalk server.');
      }, function (err) {
        assert.fail(err);
      });
      assert.equal(this.ajaxCalls.length, 1);
      assert.equal(this.ajaxCalls[0].url, 'https://example.com');
    });
  });
}());
