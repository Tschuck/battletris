// A simple Action

'use strict'
const {Action, api} = require('actionhero')
const axios = require('axios')

module.exports = class Users extends Action {
  constructor () {
    super()
    this.name = 'users'
    this.description = 'users'
    this.outputExample = { }
    this.inputs = {
      room: {
        required: true,
      },
    }
  }

  async run (data) {
    data.response.users = api.battletris.rooms[data.params.room];
  }
}
