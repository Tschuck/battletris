/* eslint-disable import/no-cycle */
import { UserStateChange } from '../keymaps/stateChanges';
import { generateEmptyRows, generateRandomClears } from '../mapHelper';
import GameUser from '../GameUser';
import { BaseClass } from './BaseClass';

/*
  // use this calculation for adjusting the scaling values:
  checkMaxValues = (value, scaling, level = 15) => value + (value * scaling * level);
  checkMaxValues(30, 0.1);
*/

export default class Unknown extends BaseClass {
  baseArmor = 30; // 120

  baseMana = 30; // 120

  armorScaling = 0.2;

  manaScaling = 0.2;

  abilities = [
    {
      mana: 25,
      cooldown: 3_000,
      onActivate: (from: GameUser, to: GameUser): void => {
        to.map.pop();
        to.map.unshift(generateEmptyRows(1)[0]);
      },
    },
    {
      mana: 35,
      cooldown: 3_000,
      onActivate: (from: GameUser, to: GameUser): void => {
        const [newRow] = generateRandomClears([[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], 1);
        to.map.push(newRow);
        to.map.shift();
      },
    },
    {
      tickTimeout: 500,
      ticks: 10,
      cooldown: 10_000,
      mana: 50,
      tick: (user: GameUser): void => {
        user.handleStateChange(UserStateChange.TURN_LEFT, []);
      },
    },
    {
      tickTimeout: 10_000,
      cooldown: 10_000,
      ticks: 2,
      mana: 120,
      tick: (): void => {
        // frontend will do the magic ;)
      },
    },
  ];
}
