import { Resource, LazyResource, LinkResource } from 'hyperagent/resource';
import Properties from 'hyperagent/properties';
import CurieStore from 'hyperagent/curie';
import 'hyperagent/config' as _config;

function configure(name, value) {
  _config[name] = value;
}

export { Resource, Properties, LazyResource, LinkResource, CurieStore, configure, _config };
