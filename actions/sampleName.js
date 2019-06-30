'use strict'
const {Action, api} = require('actionhero')
const axios = require('axios')

module.exports = class SampleName extends Action {
  constructor () {
    super()
    this.name = 'battletris/get-sample-name'
    this.description = 'battletris/get-sample-name'
    this.outputExample = {
      exampleName: 'battletris'
    }
  }
 
  async run (data) {
    data.response.name = (await axios.get('http://names.drycodes.com/1?separator=space')).data[0]
  }
}