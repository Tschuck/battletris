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
