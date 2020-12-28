/* eslint-disable import/no-cycle */
import { GameStateChange } from '../gameHelper';
import { generateEmptyRows } from '../mapHelper';
import GameUser from '../GameUser';
import { ClassInterface } from './ClassInterface';

export default class Unknown implements ClassInterface {
  maxArmor = 50;

  maxMana = 200;

  abilities = [
    {
      mana: 20,
      tick: (user: GameUser) => {
        user.map.pop();
        user.map.unshift(generateEmptyRows(1)[0]);
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
      tickTimeout: 500,
      ticks: 10,
      mana: 50,
      tick: (user: GameUser) => {
        user.handleStateChange(GameStateChange.TURN, []);
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
