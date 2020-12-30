/* eslint-disable import/no-cycle */
import GameUser from '../GameUser';
import { ClassInterface } from './ClassInterface';

export default class Warrior implements ClassInterface {
  maxArmor = 150;

  maxMana = 50;

  abilities = [
    {
      mana: 20,
      tick: (user: GameUser, userEvent: number[]|undefined): void => {
        // class index
        // ability index
        // activation time
        // from index
        // execution time
        const [,,,,, activeBlock, rotation] = userEvent || [];
        user.block = activeBlock;
        user.rotation = rotation;
      },
    },
    {
      tickTimeout: 0,
      ticks: 0,
      mana: 20,
      tick: (user: GameUser) => {
        console.log(`Sorcerer w: ${user.id}`);
      },
    },
    {
      tickTimeout: 0,
      ticks: 0,
      mana: 20,
      tick: (user: GameUser) => {
        console.log(`Sorcerer e: ${user.id}`);
      },
    },
    {
      tickTimeout: 0,
      ticks: 0,
      mana: 20,
      tick: (user: GameUser) => {
        console.log(`Sorcerer r: ${user.id}`);
      },
    },
  ];
}
