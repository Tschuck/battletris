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
      data.response.battle = api.battletris.battles[data.params.room].getJSON();
    } else {
      const battles = {};

      Object
        .keys(api.battletris.battles)
        .forEach(battleKey => battles[battleKey] = api.battletris.battles[battleKey].getJSON());

      data.response.battles = battles;  
    }
  }
}