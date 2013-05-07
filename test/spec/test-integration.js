/*global describe, it, assert, Hyperagent, beforeEach, fixtures */
'use strict';
(function () {

  describe('Hyperagent Integration Test', function () {
    // Configure AJAX to return what we tell it to return.
    beforeEach(function () {
      this.ajaxCalls = [];
      this.ajaxResponses = [];

      var ajaxMock = function (options) {
        this.ajaxCalls.push(options);

        // Could potentially re-use RSVP's async module here to get rid of the
        // 4ms delay.
        window.setTimeout(function () {
          options.success(this.ajaxResponses.pop());
        }.bind(this), 0);
      }.bind(this);
      Hyperagent.configure('ajax', ajaxMock);
    });

    it('should successfully parse a sample response', function (done) {
      this.ajaxResponses.push(JSON.stringify(fixtures.fullDoc));

      var agent = new Hyperagent.Resource('https://example.com');
      assert.equal(this.ajaxCalls.length, 0);
      var promise = agent.fetch().then(function (result) {
        assert.equal(agent, result);
        assert.equal(agent.props.welcome, 'Welcome to a haltalk server.');
        assert.equal(agent.embedded['ht:post'].length, 2);
        assert.equal(agent.embedded['ht:post'][0].props.content,
          'having fun w/ the HAL Talk explorer');
      }).then(done, done);

      assert.equal(this.ajaxCalls.length, 1);
      assert.equal(this.ajaxCalls[0].url, 'https://example.com');
    });

    it('should fetch a linked resource on demand', function (done) {
      this.ajaxResponses.push(JSON.stringify(fixtures.subDoc));
      this.ajaxResponses.push(JSON.stringify(fixtures.fullDoc));

      var agent = new Hyperagent.Resource('http://haltalk.herokuapp.com/');
      assert.equal(this.ajaxCalls.length, 0);
      var promise = agent.fetch().then(function (result) {
        return agent.embedded['ht:post'][0].fetch();
      }).then(function (post) {
        assert.equal(this.ajaxCalls.length, 2);
        assert.equal(post.props.content, 'having fun w/ the HAL Talk explorer');
        assert.equal(post.url(), 'http://haltalk.herokuapp.com' + post.links.self.props.href);
        assert.equal(post.links['ht:author'].props.title, 'Mike Amundsen');
      }.bind(this)).then(done, done);
    });
  });
}());
