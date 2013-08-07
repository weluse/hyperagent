"use strict";
var __dependency1__ = require("hyperagent/resource");
var Resource = __dependency1__.Resource;
var LazyResource = __dependency1__.LazyResource;
var LinkResource = __dependency1__.LinkResource;
var Properties = require("hyperagent/properties").Properties;
var CurieStore = require("hyperagent/curie").CurieStore;
var _config = require("hyperagent/config").config;

function configure(name, value) {
  _config[name] = value;
}


exports.Resource = Resource;
exports.Properties = Properties;
exports.LazyResource = LazyResource;
exports.LinkResource = LinkResource;
exports.CurieStore = CurieStore;
exports.configure = configure;
exports._config = _config;