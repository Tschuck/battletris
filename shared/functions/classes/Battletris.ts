/* eslint-disable import/no-cycle */
import GameUser from '../GameUser';
import { BaseClass } from './BaseClass';

export default class BattletrisGameClass extends BaseClass {
  baseArmor = 0;

  baseMana = 0;

  armorScaling = 0;

  manaScaling = 0;

  abilities = [
    // heal armor abilities
    {
      tickTimeout: 500,
      ticks: 8,
      mana: 0,
      tick: (user: GameUser): void => {
        user.armor += 1; // 8
      },
    },
    {
      tickTimeout: 500,
      ticks: 6,
      mana: 0,
      tick: (user: GameUser): void => {
        user.armor += 3; // 18
      },
    },
    {
      tickTimeout: 500,
      ticks: 4,
      mana: 0,
      tick: (user: GameUser): void => {
        user.armor += 10; // 40
      },
    },
    {
      tickTimeout: 500,
      ticks: 3,
      mana: 0,
      tick: (user: GameUser): void => {
        user.armor += 20; // 60
      },
    },
    // damage armor abilities
    {
      tickTimeout: 500,
      ticks: 8,
      mana: 0,
      tick: (user: GameUser): void => {
        user.armor -= 1; // 8
      },
    },
    {
      tickTimeout: 500,
      ticks: 6,
      mana: 0,
      tick: (user: GameUser): void => {
        user.armor -= 3; // 18
      },
    },
    {
      tickTimeout: 500,
      ticks: 4,
      mana: 0,
      tick: (user: GameUser): void => {
        user.armor -= 10; // 40
      },
    },
    {
      tickTimeout: 500,
      ticks: 3,
      mana: 0,
      tick: (user: GameUser): void => {
        user.armor -= 20; // 60
      },
    },
  ];
}
