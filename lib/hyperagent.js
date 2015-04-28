import { Resource, LazyResource, EmbeddedResource, LinkResource } from 'hyperagent/resource';
import { Properties } from 'hyperagent/properties';
import { CurieStore } from 'hyperagent/curie';
import { config as _config } from 'hyperagent/config';

function configure(name, value) {
  _config[name] = value;
}

export { Resource, Properties, LazyResource, EmbeddedResource, LinkResource, CurieStore, configure, _config };
