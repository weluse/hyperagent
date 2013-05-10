"use strict";
var config = require("hyperagent/config");
var __dependency1__ = require("hyperagent/resource");
var Resource = __dependency1__.Resource;
var LazyResource = __dependency1__.LazyResource;
var LinkResource = __dependency1__.LinkResource;
var Properties = require("hyperagent/properties").Properties;
var CurieStore = require("hyperagent/curie").CurieStore;

function configure(name, value) {
  config[name] = value;
}


exports.Resource = Resource;
exports.Properties = Properties;
exports.LazyResource = LazyResource;
exports.LinkResource = LinkResource;
exports.CurieStore = CurieStore;
exports.configure = configure;