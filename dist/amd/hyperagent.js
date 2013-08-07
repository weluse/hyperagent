define("/hyperagent",
  ["hyperagent/resource","hyperagent/properties","hyperagent/curie","hyperagent/config","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var Resource = __dependency1__.Resource;
    var LazyResource = __dependency1__.LazyResource;
    var LinkResource = __dependency1__.LinkResource;
    var Properties = __dependency2__.Properties;
    var CurieStore = __dependency3__.CurieStore;
    var _config = __dependency4__.config;

    function configure(name, value) {
      _config[name] = value;
    }


    __exports__.Resource = Resource;
    __exports__.Properties = Properties;
    __exports__.LazyResource = LazyResource;
    __exports__.LinkResource = LinkResource;
    __exports__.CurieStore = CurieStore;
    __exports__.configure = configure;
    __exports__._config = _config;
  });