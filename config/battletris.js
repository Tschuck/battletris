// get current node env
const env = process.env.NODE_ENV;

exports['default'] = {
  battletris: (api) => {
    return {
      // class definitions
      classes: require('../battletris/classes'),
      // amount of battlefields
      battlefields: 20,
      // seconds until the game starts, after all users has accepted
      startCounter: env === 'production' ? 9 : 1,
      // run game loop every Xms
      gameLoopSpeed: 500,
      // "user speed", moves blocks down, ...
      userSpeed: 1100,
      // increase speed after X ms
      increaseInterval: 30 * 1000,
      // reduce the speed timeout with the amount of ms
      increaseSteps: 50,
    };
  }
}
