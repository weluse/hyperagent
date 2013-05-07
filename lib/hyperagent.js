import { Resource, LazyResource, LinkResource } from 'hyperagent/resource';
import Properties from 'hyperagent/properties';
import CurieStore from 'hyperagent/curie';
import 'hyperagent/config' as config;

function configure(name, value) {
  config[name] = value;
}

export { Resource, Properties, LazyResource, LinkResource, CurieStore, configure };
