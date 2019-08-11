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

/**
 * Documentation for ability entries.
 */
const demoSkill = {
  type: 'insert-lines', // type of the ability
  config: {
    cooldown: 5000, // after how many ms can the user reactivate this ability
    costs: 20, // mana costs
    duration: 2000, // ms of the ability to take effect
    map: [ // ability specific map (e.g. used to append this line at the bottom)
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1 ]
    ],
    map: 'activeBlock', // map can be also the active block
    pos: { // position of the ability should take effect
      // choose following types:
      //   - manual:  hardcoded starting point 
      //   - free:    prevers empty space
      //   - blocked: prevers a blocked space
      type: 'manual',
      x: 0,
      y: 19,
    }
  }
};

module.exports = {
  unkown: [
    {
      type: 'insert-lines',
      config: {
        costs: 20,
        map: [ [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ] ],
        pos: { y: 20, },
      }
    },
    {
      type: 'remove-lines',
      config: {
        costs: 20,
        map: [ [ ] ],
        pos: { y: 20, },
      }
    },
  ],
  rouge: [
  ],
  warlord: [
  ],
  warrior: [
  ],
  wizard: [
  ],
};
