'use strict'
const {Action, api} = require('actionhero')
const axios = require('axios')
const { roomHandler } = require('../battletris/roomHandler')

module.exports = class Rooms extends Action {
  constructor () {
    super()
    this.name = 'battletris/room-actions'
    this.description = 'battletris/room-actions'
    this.outputExample = { }
    this.inputs = {
      room: {
        required: true,
      },
      connectionId: {
        required: true
      },
      type: {
        required: true
      },
      payload: {
        required: false
      }
    };
  }

  async run (data) {
    await roomHandler(
      data.params.connectionId,
      data.params.room, 
      data.params.type, 
      data.params.payload, 
    );
  }
}
