'use strict'
const {Action, api} = require('actionhero')
const axios = require('axios')
const NameGen = require('../battletris/namegen');

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
    const generator = NameGen.compile("sV i");
    data.response.name = generator.toString();
  }
}