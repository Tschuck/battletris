// initializers/stuffInit.js

const { Initializer, api } = require('actionhero');
const webpackConfig = require('../webpack.config.js');
const webpack = require('webpack');
const userHandler = require('../battletris/userHandler');

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
      rooms: { },
    };

    var chatMiddleware = {
      name: 'chat middleware',
      priority: 1000,
      join: async (connection, room) => {
        // console.log(`join ${ room }: ${ connection.id }`)

        // announce all connections entering a room
        // await api.chatRoom.broadcast({}, room, 'I have joined the room: ' + connection.id)
      },
      leave: async (connection, room) => {
        // console.log(`leave ${ room }: ${ connection.id }`)
        // clear users
        await userHandler(connection, room, { type: 'room-leave', });
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
        await userHandler(connection, room, payload.message);
        return payload;
      }
    };

    // open all the chat rooms and 10 battlefields
    try {
      api.battletris.rooms[`tavern`] = { };
      api.chatRoom.add('tavern', () => { });
    } catch (ex) {}
    for (let i = 0; i < 30; i++) {
      try {
        api.battletris.rooms[`field${ i }`] = { };
        await api.chatRoom.add(`field${ i }`, () => { });
      } catch (ex) { }
    }

    api.chatRoom.addMiddleware(chatMiddleware)
  }

  async stop() { }
}