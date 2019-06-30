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
  classes = classes || (await promiseClient.action('battletris/config', {})).config.classes;

  return classes;
}

/**
 * Load all available rooms including the users from backend.
 */
async function getRooms() {
  return (await promiseClient.action('battletris/rooms', {})).rooms;
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
    (await promiseClient.action('battletris/get-sample-name', {})).name ||
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
    type: 'room-join',
    ...userConfig
  }));

  // save go localStorage
  window.localStorage['battletris-user'] = JSON.stringify(userConfig);
}

/**
 * Join a room an populate the userConfig to this room.
 *
 * @param      {string}  room        room to join
 * @param      {any}     userConfig  user configuration including name, className, ...
 */
async function joinRoom(room: string, userConfig: any) {
  await promiseClient.roomAdd(room);
  await populateConfig(room, userConfig);
}

/**
 * Remove the current user from a room.
 *
 * @param      {string}  room        room to join
 * @param      {any}     userConfig  user configuration including name, className, ...
 */
async function leaveRoom(room: string) {
  await promiseClient.roomLeave(room);
}

/**
 * Applies a theme to the current UI.
 *
 * @param      {string}  theme   The theme
 */
function setTheme(theme = window.localStorage['battletris-theme'] || 'light') {
  // overwrite body classes
  document.body.className = `battletris battletris-${ theme }`;

  // save current theme
  window.localStorage['battletris-theme'] = theme;
}

/**
 * Load a cookie.
 *
 * @param      {string}  cname   coockie value
 */
function getCookie(cname) {
  const name = cname + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

export {
  getClasses,
  getCookie,
  getRooms,
  getUserConfig,
  initialize,
  joinRoom,
  leaveRoom,
  populateConfig,
  promiseClient,
  setTheme,
  triggerListeners,
  watch,
  wsClient,
}
