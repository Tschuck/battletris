// A simple Action

'use strict'
const {Action, api} = require('actionhero')
const axios = require('axios')

module.exports = class Rooms extends Action {
  constructor () {
    super()
    this.name = 'battletris/battles'
    this.description = 'battletris/battles'
    this.outputExample = { }
    this.inputs = {
      room: {
        required: false,
      }
    };
  }

  async run (data) {
    if (data.params.room) {
      data.response.battle = api.battletris.battles[data.params.room];  
    } else {
      data.response.battles = api.battletris.battles;  
    }
  }
}
