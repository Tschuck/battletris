import axios from 'axios';
import {
  initialize,
  promiseClient,
  triggerListeners,
  watch,
  wsClient,
} from './actionheroWrapper';

let classes;

/**
 * Load all available classes from backend and cache the value.
 */
async function getClasses() {
  classes = classes || (await promiseClient.action('classes', {})).classes;

  return classes;
}

/**
 * Return the latest user configuration.
 */
async function getUserConfig() {
  let config = window.localStorage['battletris-user'];

  try {
    config = JSON.parse(config);
  } catch (ex) {
    config = { };
  }

  config.name = config.name ||
    (await promiseClient.action('sampleName', {})).name ||
    'battletris user';
  config.className = config.className ||
    Object.keys(await getClasses())[0];

  // backup name, when prefilled
  window.localStorage['battletris-user'] = JSON.stringify(config);

  return config;
}

/**
 * Takes a user config and populates it to all other users in the room.
 *
 * @param      {string}  room        room to populate the data to
 * @param      {any}     userConfig  user configuration including name, className, ...
 */
async function populateConfig(room: string, userConfig: any) {
  await promiseClient.say(room, JSON.stringify({
    type: 'user-update',
    ...userConfig
  }));
}

export {
  getClasses,
  getUserConfig,
  initialize,
  populateConfig,
  promiseClient,
  triggerListeners,
  watch,
  wsClient,
}
