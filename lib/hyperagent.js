import Agent from 'hyperagent/agent';
import config from 'hyperagent/config';

function configure(name, value) {
  config[name] = value;
}

export { Agent, configure };
