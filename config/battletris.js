exports['default'] = {
  battletris: (api) => {
    return {
      // class definitions
      classes: require('../battletris/classes'),
      // amount of battlefields
      battlefields: 20,
      // seconds until the game starts, after all users has accepted
      startCounter: 1,
      // run game loop every Xms
      gameLoopSpeed: 1000,
      // "user speed", moves blocks down, ...
      userSpeed: 1100,
      // increase speed after Xms
      increaseInterval: 30 * 1000,
      // reduce the speed timeout with the amount of ms
      increaseSteps: 100,
      // google analytics id
      gaId: 'UA-145312365-1'
    };
  }
}
