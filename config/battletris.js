exports['default'] = {
  battletris: (api) => {
    const demoSkills = [
      {
        cooldown: 5000,
        costs: 20,
        duration: 2000,
        name: 'clear-line',
        type: 'add-line',
      },
      {
        cooldown: 5000,
        costs: 20,
        duration: 2000,
        name: 'clear-line',
        type: 'clear-line',
      },
    ];

    const classes = {
      rouge: {
        skills: demoSkills
      },
      warlord: {
        skills: demoSkills
      },
      warrior: {
        skills: demoSkills
      },
      wizard: {
        skills: demoSkills
      }
    };

    return {
      // class definitions
      classes,
      // amount of battlefields
      battlefields: 5,
      // run game loop every Xms
      gameLoopTimeout: 1000,
      // increase speed after Xms
      increaseInterval: 30 * 1000,
      // reduce the speed timeout with the amount of ms
      increaseSteps: 100,
    };
  }
}
