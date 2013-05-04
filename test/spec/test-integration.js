/*global describe, it, assert, Hyperagent, beforeEach */
'use strict';
(function () {

  describe('Hyperagent Integration Test', function () {
    before(function () {
      this.ajaxCalls = [];
      this.ajaxResponses = [];

      var ajaxMock = function (options, cb) {
        this.ajaxCalls.push(options);

        // Could potentially re-use RSVP's async module here to get rid of the
        // 30ms delay.
        window.setTimeout(function () {
          cb(this.ajaxResponses.pop());
        }.bind(this), 0);
      };
      Hyperagent.configure('ajax', ajaxMock);
    });

    it('should successfully parse a sample response', function () {
    });
  });
}());
