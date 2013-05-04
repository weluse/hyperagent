import Agent from 'hyperagent/agent';
import Properties from 'hyperagent/properties';
import 'hyperagent/config' as config;

function configure(name, value) {
  config[name] = value;
}

export { Agent, Properties, configure };
