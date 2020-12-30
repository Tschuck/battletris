/* eslint-disable import/no-cycle */
import { GameStateChange } from '../gameHelper';
import { generateEmptyRows, generateRandomClears } from '../mapHelper';
import GameUser from '../GameUser';
import { ClassInterface } from './ClassInterface';

export default class Unknown implements ClassInterface {
  maxArmor = 100;

  maxMana = 100;

  abilities = [
    {
      mana: 20,
      tick: (user: GameUser): void => {
        user.map.pop();
        user.map.unshift(generateEmptyRows(1)[0]);
      },
    },
    {
      tickTimeout: 0,
      ticks: 0,
      mana: 30,
      tick: (user: GameUser): void => {
        const [newRow] = generateRandomClears([[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], 1);
        user.map.push(newRow);
        user.map.shift();
      },
    },
    {
      tickTimeout: 500,
      ticks: 10,
      mana: 50,
      tick: (user: GameUser): void => {
        user.handleStateChange(GameStateChange.TURN, []);
      },
    },
    {
      tickTimeout: 10_000,
      // use 2, will be directly executed once
      ticks: 2,
      mana: 80,
      tick: (): void => {
        // frontend will do the magic ;)
      },
    },
  ];
}
