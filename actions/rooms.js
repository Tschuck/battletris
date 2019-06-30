'use strict'
const {Action, api} = require('actionhero')
const axios = require('axios')

module.exports = class Rooms extends Action {
  constructor () {
    super()
    this.name = 'battletris/rooms'
    this.description = 'battletris/rooms'
    this.outputExample = { }
    this.inputs = {
      room: {
        required: false,
      }
    };
  }

  async run (data) {
    if (data.params.room) {
      data.response.room = api.battletris.rooms[data.params.room];  
    } else {
      data.response.rooms = api.battletris.rooms;  
    }
  }
}
