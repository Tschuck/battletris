/* eslint-disable import/no-cycle */
import { GameStateChange } from '../gameHelper';
import GameUser from '../GameUser';
import { BaseClass } from './BaseClass';

/*
  // use this calculation for adjusting the scaling values:
  checkMaxValues = (value, scaling, level = 15) => value + (value * scaling * level);
  checkMaxValues(30, 0.1);
*/

export default class Sorcerer extends BaseClass {
  baseArmor = 30; // max: 52.5

  baseMana = 50; // max: 275

  armorScaling = 0.05;

  manaScaling = 0.3;

  abilities = [
    {
      mana: 35,
      cooldown: 5_000,
      onActivate: (from: GameUser, to: GameUser): void => {
        to.handleStateChange(GameStateChange.FALL_DOWN);
      },
    },
    {
      tickTimeout: 10_000,
      ticks: 2,
      mana: 50,
      onActivate: (user: GameUser): void => {
        user.speedAdjust = -1 * (user.speed / 2);
      },
      onBeforeEnd: (user: GameUser): void => {
        user.speedAdjust = 0;
      },
    },
    {
      tickTimeout: 10_000,
      ticks: 2,
      mana: 100,
      onStateChange: (
        user: GameUser,
        userEvent: number[]|undefined,
        key: GameStateChange,
      ): GameStateChange => {
        // it was a technical user event
        if (!userEvent || !userEvent[1]) {
          return key;
        }

        // reverse controls
        if (key === GameStateChange.TURN) {
          return GameStateChange.DOWN;
        }
        if (key === GameStateChange.DOWN) {
          return GameStateChange.TURN;
        }
        if (key === GameStateChange.LEFT) {
          return GameStateChange.RIGHT;
        }
        if (key === GameStateChange.RIGHT) {
          return GameStateChange.LEFT;
        }

        return key;
      },
    },
    {
      tickTimeout: 10_000,
      ticks: 2,
      mana: 150,
      onStateChange: (
        user: GameUser,
        userEvent: number[]|undefined,
        key: GameStateChange,
      ): GameStateChange|undefined => {
        // it was a technical user event
        if (!userEvent || !userEvent[1]) {
          return key;
        }
      },
    },
  ];
}
