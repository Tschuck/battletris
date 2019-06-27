// A simple Action

'use strict'
const {Action, api} = require('actionhero')
const axios = require('axios')

module.exports = class SampleName extends Action {
 constructor () {
   super()
   this.name = 'sampleName'
   this.description = 'sampleName'
   this.outputExample = {
     exampleName: 'battletris'
   }
 }

 async run (data) {
   data.response.name = (await axios.get('http://names.drycodes.com/1')).data[0]
 }
}