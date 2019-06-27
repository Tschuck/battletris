// A simple Action

'use strict'
const {Action, api} = require('actionhero')
const axios = require('axios')

module.exports = class Classes extends Action {
 constructor () {
   super()
   this.name = 'classes'
   this.description = 'classes'
   this.outputExample = { }
 }

 async run (data) {
   data.response.classes = api.config.battletris.classes;
 }
}