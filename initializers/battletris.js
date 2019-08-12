// initializers/stuffInit.js

const { Initializer, api } = require('actionhero');
const webpackConfig = require('../webpack.config.js');
const webpack = require('webpack');
const ua = require('universal-analytics');
const { roomHandler, generateRoom, } = require('../battletris/roomHandler');
const Battle = require('../battletris/battle');

module.exports = class Battletris extends Initializer {
  constructor () {
    super()
    this.name = 'Battletris'
    this.loadPriority = 2000
    this.startPriority = 2000
    this.stopPriority = 2000
  }

  async initialize () {
    api.battletris = {
      battles: { },
      rooms: { },
    };

    // initialize analytics module
    api.analytics = {
      ga: ua(api.config.battletris.gaId)
    }

    const chatMiddleware = {
      name: 'chat middleware',
      priority: 1000,
      join: async (connection, room) => {
        // console.log(`join ${ room }: ${ connection.id }`)

        // announce all connections entering a room
        // await api.chatRoom.broadcast({}, room, 'I have joined the room: ' + connection.id)
      },
      leave: async (connection, room) => {
        // clear users
        await roomHandler(connection.id, room, 'room-leave');
      },
      /**
       * Will be executed once per client connection before delivering the message.
       */
      say: (connection, room, payload) => {
        return payload;
      },
      /**
       * Will be executed only once, when the message is sent to the server.
       */
      onSayReceive: async function(connection, room, payload) {
        return payload;
      }
    };

    // open all the chat rooms and 10 battlefields
    try {
      api.battletris.rooms[`tavern`] = generateRoom();
      await api.chatRoom.add('tavern', () => { });
    } catch (ex) {}
    for (let i = 0; i < api.config.battletris.battlefields; i++) {
      const roomName = `field${ i }`;

      try {
        api.battletris.rooms[roomName] = generateRoom();
        api.battletris.battles[roomName] = new Battle(roomName);
        await api.chatRoom.add(roomName, () => { });
      } catch (ex) { }
    }

    api.chatRoom.addMiddleware(chatMiddleware)
  }

  async stop() { }
}