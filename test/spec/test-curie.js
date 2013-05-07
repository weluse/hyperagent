/*global describe, it, Hyperagent, beforeEach, fixtures, assert, _ */
'use strict';
(function () {
  describe('Hyperagent.CurieStore', function () {
    beforeEach(function () {
      this.store = new Hyperagent.CurieStore();
    });

    it('stores and expands curies', function () {
      this.store.register('wiki', 'http://en.wikipedia.org/wiki/{rel}');
      var url = this.store.expand('wiki:Eierlegende_Wollmilchsau');
      assert.equal(url, 'http://en.wikipedia.org/wiki/Eierlegende_Wollmilchsau');
    });

    it('canExpand', function () {
      this.store.register('wiki', 'http://en.wikipedia.org/wiki/');
      assert.isTrue(this.store.canExpand('wiki:Eierlegende_Wollmilchsau'));
      assert.isFalse(this.store.canExpand('foo:Eierlegende_Wollmilchsau'));
    });

    it('expand returns the untouch value if cannot expand', function () {
      var value = 'wiki:autobahn';
      assert.equal(this.store.expand(value), value);
    });

    it('is empty by default', function () {
      assert.isTrue(this.store.empty());
    });

    it('is not empty if used', function () {
      this.store.register('wiki', 'http://en.wikipedia.org/wiki/');
      assert.isFalse(this.store.empty());
    });
  });
}());
