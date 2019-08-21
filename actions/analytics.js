'use strict'
const {Action, api} = require('actionhero')
const axios = require('axios')
const Throttle = require('promise-parallel-throttle');

module.exports = class Rooms extends Action {
  constructor () {
    super()
    this.name = 'battletris/analytics'
    this.description = 'battletris/analytics'
    this.outputExample = { }
    this.inputs = {
      patterns: {
        required: true,
      },
      useHour: {
        required: false,
      }
    };
  }
  async run (data) {
    const analytics = { };
    let patterns = data.params.patterns;

    if (!Array.isArray(data.params.patterns)) {
      patterns = JSON.parse(patterns);
    }

    // iterate over all redis key patterns and load the data for it
    await Throttle.all(patterns.map(pattern => async () => {
      let keys = pattern.endsWith('*') ?
        (await api.redis.clients.client.keys(`battletris:${ pattern }`)) :
        [ `battletris:${ pattern }` ];

      // iterate over all keys and load the data
      await Throttle.all(keys.map(key => async () => {
        // generate correct analytics keys to generate a good looking nested format
        const [ namespace, year, month, day, hour ] = key.split(':');
        // ensure to use utc time
        let date = new Date((new Date(year, month, day, data.params.useHour ? hour : 0))
          .toISOString()).getTime();

        // load entries from redis
        const entries = await api.redis.clients.client.lrange(key, 0, -1);
        // parse to valid JSON
        entries.forEach((entry, index) => entries[index] = JSON.parse(entry));

        // build correct analytics object structure
        analytics[date] = (analytics[date] || [ ]).concat(entries);
      }), { maxInProgress: 10 });
    }));

    data.response.analytics = analytics;
    data.response.runningBattles = Object
      .keys(api.battletris.battles)
      .filter(room => api.battletris.battles[room].status === 'started')
      .length;
  }
}