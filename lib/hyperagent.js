import Agent from 'hyperagent/agent';
import Properties from 'hyperagent/properties';
import config from 'hyperagent/config';

function configure(name, value) {
  config[name] = value;
}

export { Agent, Properties, configure };
