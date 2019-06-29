// A simple Action

'use strict'
const {Action, api} = require('actionhero')
const axios = require('axios')

module.exports = class Rooms extends Action {
 constructor () {
   super()
   this.name = 'rooms'
   this.description = 'rooms'
   this.outputExample = { }
 }

 async run (data) {
   data.response.rooms = api.battletris.rooms;
 }
}
