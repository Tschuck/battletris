'use strict'
const {Action, api} = require('actionhero')
const axios = require('axios')
const _ = require('lodash')

module.exports = class Config extends Action {
  constructor () {
    super()
    this.name = 'battletris/config'
    this.description = 'battletris/config'
    this.outputExample = { }
  }
 
  async run (data) {
    const config = _.cloneDeep(api.config.battletris);

    // clear functions from abilities that will be passed to ui
    Object.keys(config.classes).forEach(className => {
      config.classes[className].forEach(ability => {
        delete ability.execute;
      });
    });

    data.response.config = config;
  }
}