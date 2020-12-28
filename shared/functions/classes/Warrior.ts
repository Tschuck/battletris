/* eslint-disable import/no-cycle */
import GameUser from '../GameUser';
import { ClassInterface } from './ClassInterface';

export default class Warrior implements ClassInterface {
  maxArmor = 50;

  maxMana = 200;

  abilities = [
    {
      duration: 0,
      tickTimeout: 0,
      ticks: 0,
      mana: 20,
      tick: (user: GameUser) => {
        console.log(`Sorcerer q: ${user.id}`);
      },
    },
    {
      duration: 0,
      tickTimeout: 0,
      ticks: 0,
      mana: 20,
      tick: (user: GameUser) => {
        console.log(`Sorcerer w: ${user.id}`);
      },
    },
    {
      duration: 0,
      tickTimeout: 0,
      ticks: 0,
      mana: 20,
      tick: (user: GameUser) => {
        console.log(`Sorcerer e: ${user.id}`);
      },
    },
    {
      duration: 0,
      tickTimeout: 0,
      ticks: 0,
      mana: 20,
      tick: (user: GameUser) => {
        console.log(`Sorcerer r: ${user.id}`);
      },
    },
  ];
}
