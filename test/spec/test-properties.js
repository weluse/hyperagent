/*global describe, it, chai, Hyperagent, beforeEach */
'use strict';
(function () {
  var assert = chai.assert;

  describe('Hyperagent.Properties', function () {

    it('should expose properties', function () {
      var props = new Hyperagent.Properties({
        title: 'hello world',
        a_list: [1, 2, 3]
      });

      assert(props.title, 'hello world');
      assert.deepEqual(props.a_list, [1, 2, 3]);
    });

    it('should ignore _link, _embedded properties', function () {
      var props = new Hyperagent.Properties({
        _links: 'do not touch',
        _embed: 'ignore me',
        title: 'hello world'
      });

      assert.isUndefined(props._links);
      assert.isUndefined(props._embedded);
      assert(props.title, 'hello world');
    });
  });
}());
