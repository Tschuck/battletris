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
      },
      keyPressed: {
        required: false,
      },
    };
  }

  async run (data) {
    const battle = api.battletris.battles[data.params.room];

    if (battle) {
      try {
        // run user action
        battle.userAction(data.params.connectionId, data.params.key, data.params.keyPressed);

        // return last battle update, so the user gets updated directly
        data.response.battle = battle.getUserStateIncrement(false);
        data.response.date = Date.now();

        // update all the other players
        battle.sendBattleIncrement();
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