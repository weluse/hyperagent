import { Resource, LazyResource } from 'hyperagent/resource';
import Properties from 'hyperagent/properties';
import 'hyperagent/config' as config;

function configure(name, value) {
  config[name] = value;
}

export { Resource, Properties, LazyResource, configure };
