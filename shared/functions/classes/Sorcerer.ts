/* eslint-disable import/no-cycle */
import { GameStateChange, UserStateChange } from '../keymaps/stateChanges';
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
      tickTimeout: 10_000,
      ticks: 2,
      cooldown: 20_000,
      mana: 50,
      onActivate: (from: GameUser, to: GameUser): void => {
        to.speedAdjust = -1 * (to.speed / 2);
      },
      onBeforeEnd: (from: GameUser, to: GameUser): void => {
        to.speedAdjust = 0;
      },
    },
    {
      mana: 100,
      cooldown: 10_000,
      onActivate: (from: GameUser, to: GameUser): void => {
        to.handleStateChange(UserStateChange.HARD_DROP);
      },
    },
    {
      tickTimeout: 10_000,
      ticks: 2,
      mana: 100,
      onStateChange: (
        user: GameUser,
        userEvent: number[]|undefined,
        key: GameStateChange|UserStateChange,
      ): GameStateChange|UserStateChange => {
        // it was a technical user event
        if (!userEvent || !userEvent[1]) {
          return key;
        }

        // reverse controls
        if (key === UserStateChange.TURN_RIGHT) {
          return UserStateChange.SOFT_DROP;
        }
        if (key === UserStateChange.SOFT_DROP) {
          return UserStateChange.TURN_LEFT;
        }
        if (key === UserStateChange.LEFT) {
          return UserStateChange.RIGHT;
        }
        if (key === UserStateChange.RIGHT) {
          return UserStateChange.LEFT;
        }

        return key;
      },
    },
    {
      tickTimeout: 10_000,
      ticks: 2,
      mana: 250,
      onStateChange: (
        user: GameUser,
        userEvent: number[]|undefined,
        key: GameStateChange|UserStateChange,
      ): GameStateChange|UserStateChange|undefined => {
        // it was a technical user event
        if (!userEvent || !userEvent[1]) {
          return key;
        }
      },
    },
  ];
}
