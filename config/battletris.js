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

    return { classes };
  }
}
