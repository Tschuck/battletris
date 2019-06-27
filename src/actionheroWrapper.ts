import axios from 'axios';
declare let ActionheroWebsocketClient: any;

// setup actionhero client
const wsClient = new ActionheroWebsocketClient();
const listeners = { };

/**
 * Wrap a actionhero client call for automated promises
 *
 * @return     {Promise<any>}  result of the action
 */
const actionHeroPromiseWrapper = (funcName, ...args) => {
  return new Promise((resolve, reject) => {
    args.push((data) => {
      if (data && data.error) {
        reject(new Error(data.error));
      } else {
        resolve(data);
      }
    });

    wsClient[funcName].apply(wsClient, args);
  })
};

// create ws client and crearte promisify wrappers
const promiseClient = {
  action: actionHeroPromiseWrapper.bind(null, 'action'),
  connect: actionHeroPromiseWrapper.bind(null, 'connect'),
  roomAdd: actionHeroPromiseWrapper.bind(null, 'roomAdd'),
  roomLeave: actionHeroPromiseWrapper.bind(null, 'roomLeave'),
  say: actionHeroPromiseWrapper.bind(null, 'say'),
};

/**
 * Initialize the websocket connection.
 */
async function initialize() {
  await promiseClient.connect();

  // watch for all events
  wsClient.on('connected',    triggerListeners.bind(null, 'connected'));
  wsClient.on('disconnected', triggerListeners.bind(null, 'disconnected'));
  wsClient.on('error',        triggerListeners.bind(null, 'error'));
  wsClient.on('reconnect',    triggerListeners.bind(null, 'reconnect'));
  wsClient.on('reconnecting', triggerListeners.bind(null, 'reconnecting'));
  wsClient.on('alert',        triggerListeners.bind(null, 'alert'));
  wsClient.on('api',          triggerListeners.bind(null, 'api'));
  wsClient.on('welcome',      triggerListeners.bind(null, 'welcome'));
  wsClient.on('say',          triggerListeners.bind(null, 'say'));
}

/**
 * Simply watch for updates.
 *
 * @param      {string}    eventName  client event name
 * @param      {Function}  callback   callback function to call
 */
function watch(eventName: string, callback: Function) {
  listeners[eventName] = listeners[eventName] || [ ];
  listeners[eventName].push(callback);

  return () => listeners[eventName].splice(listeners[eventName].indexOf(callback), 1);
}

/**
 * Trigger ui listeners.
 *
 * @param      {<type>}  eventName  The event name
 * @param      {<type>}  data       The data
 */
function triggerListeners(eventName, data) {
  const events = [ eventName, data.room ];

  if (data && data.message) {
    try {
      data.message = JSON.parse(data.message);
    } catch (ex) { }

    // if sub type was specified, trigger also subtype
    if (data && data.message && data.message.type) {
      events.push(`${ data.room }/${ data.message.type }`);
      events.push(`${ eventName }/${ data.message.type }`);
    }
  }

  // submiot events
  events.forEach(event => {
    if (listeners[event]) {
      listeners[event].forEach(listener => listener(data));
    }
  });
}

export {
  initialize,
  promiseClient,
  triggerListeners,
  watch,
  wsClient,
};
