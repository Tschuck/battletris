/* eslint-disable import/no-cycle */
import GameUser from '../GameUser';
import { ClassInterface } from './ClassInterface';

export default class BattletrisGameClass implements ClassInterface {
  maxArmor = 0;

  maxMana = 0;

  abilities = [
    // heal armor abilities
    {
      tickTimeout: 500,
      ticks: 5,
      mana: 0,
      tick: (user: GameUser): void => {
        user.armor += 2; // => 5 * 2 = 10
      },
    },
    {
      tickTimeout: 500,
      ticks: 5,
      mana: 0,
      tick: (user: GameUser): void => {
        user.armor += 4; // => 5 * 3 = 20
      },
    },
    {
      tickTimeout: 500,
      ticks: 5,
      mana: 0,
      tick: (user: GameUser): void => {
        user.armor += 6; // => 5 * 6 = 30
      },
    },
    {
      tickTimeout: 500,
      ticks: 5,
      mana: 0,
      tick: (user: GameUser): void => {
        user.armor += 10; // => 5 * 10 = 50
      },
    },
    // damage armor abilities
    {
      tickTimeout: 500,
      ticks: 5,
      mana: 0,
      tick: (user: GameUser): void => {
        user.armor -= 2; // => 5 * 2 = 10
      },
    },
    {
      tickTimeout: 500,
      ticks: 5,
      mana: 0,
      tick: (user: GameUser): void => {
        user.armor -= 4; // => 5 * 3 = 20
      },
    },
    {
      tickTimeout: 500,
      ticks: 5,
      mana: 0,
      tick: (user: GameUser): void => {
        user.armor -= 6; // => 5 * 6 = 30
      },
    },
    {
      tickTimeout: 500,
      ticks: 5,
      mana: 0,
      tick: (user: GameUser): void => {
        user.armor -= 10; // => 5 * 10 = 50
      },
    },
  ];
}
