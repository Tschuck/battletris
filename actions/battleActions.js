'use strict'
const {Action, api} = require('actionhero')
const axios = require('axios')

module.exports = class Rooms extends Action {
  constructor () {
    super()
    this.name = 'battletris/battles-actions'
    this.description = 'battletris/battles-actions'
    this.outputExample = { }
    this.inputs = {
      room: {
        required: true,
      },
      connectionId: {
        required: true
      },
      key: {
        required: true,
      }
    };
  }

  async run (data) {
    api.battletris.battleInstances[data.params.room].userAction(
      data.params.connectionId,
      data.params.key,
    );
  }
}