exports['default'] = {
  battletris: (api) => {
    const demoSkills = [
      {
        cooldown: 5000,
        costs: 20,
        duration: 2000,
        type: 'clear-line',
        target: 'self'
      },
      {
        cooldown: 5000,
        costs: 20,
        duration: 2000,
        type: 'add-line',
        target: 'index'
      },
      {
        cooldown: 5000,
        costs: 20,
        duration: 2000,
        target: 'all'
      },
      {
        cooldown: 5000,
        costs: 20,
        duration: 2000,
        type: 'add-line',
      },
    ];

    const classes = {
      unkown: demoSkills,
      rouge: demoSkills,
      warlord: demoSkills,
      warrior: demoSkills,
      wizard: demoSkills
    };

    return {
      // class definitions
      classes,
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
    };
  }
}


/**
 * - classes
  - ideas
    - 4 spells (qwer)
    - Mana
  - Mage
    - levitate (hold stone) (1 stone, ~s, 20m)
    - transform (change stone) (30m)
    - fireball (throws a hole into the enemies stones) (50m)
    - 
  - Rouge
    - speed (increase speed for yourself) (5s, 20m)
    - steal (steal stone from enemy) (30m)
    - invisible (you cannot be targeted, remove all debuffs) (5s, 20m)
    - stun (player cannot interact) (3s, 50m)
  - Hunter
    - trap (positionate trap at enemies field, row must be removed multiple times) (~s, 20m)
    - poison (enemy stones falls faster) (10s, 20m)
    - pet attack (...)
    -
  - Warrior
    - Shield (blocks abillities, can be stacked 3 times) (~s, 20m)
    - Earth Quake (enemy field wobbles) (10s, 50m)
    - 
    - cleave (remove up to 3 vertical lines) (80m)
  - Warlord
    - confuse (invert keys, drop does not working) (5s, 20m)
    - spin (enemy stone spins) (5s, 20m)
    - dot (clear random blocks) (5s, 50m)
    - 
  - Priest
    - heal (fill spaces) (20m)
    - meditate (fill up mana) (5s, no mana)
    - blend (enemy does not see anything) (30m)
    - 
 */
