define(
  ["hyperagent/resource","hyperagent/properties","hyperagent/curie","hyperagent/config","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, config, __exports__) {
    "use strict";
    var Resource = __dependency1__.Resource;
    var LazyResource = __dependency1__.LazyResource;
    var LinkResource = __dependency1__.LinkResource;
    var Properties = __dependency2__.Properties;
    var CurieStore = __dependency3__.CurieStore;

    function configure(name, value) {
      config[name] = value;
    }


    __exports__.Resource = Resource;
    __exports__.Properties = Properties;
    __exports__.LazyResource = LazyResource;
    __exports__.LinkResource = LinkResource;
    __exports__.CurieStore = CurieStore;
    __exports__.configure = configure;
  });