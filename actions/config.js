// A simple Action

'use strict'
const {Action, api} = require('actionhero')
const axios = require('axios')

module.exports = class Config extends Action {
  constructor () {
    super()
    this.name = 'battletris/config'
    this.description = 'battletris/config'
    this.outputExample = { }
  }
 
  async run (data) {
    data.response.config = api.config.battletris;
  }
}