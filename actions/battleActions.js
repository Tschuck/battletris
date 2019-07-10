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
    if (api.battletris.battles[data.params.room]) {
      try {
        const update = api.battletris.battles[data.params.room].userAction(
          data.params.connectionId,
          data.params.key,
        );

        data.response.battle = update;
      } catch (ex) {
        console.error(ex);
        console.trace();        
        data.response.error = ex.message;
      }
    } else {
      data.response.error = 'Please insert a valid room!';
    }
  }
}