/* eslint-disable import/no-cycle */
import { flattenMap, generateRandomAreaClear } from '../mapHelper';
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
      mana: 30,
      tick: (user: GameUser): void => {
        user.map = generateRandomAreaClear([[1, 1], [1, 1]], user.map);
      },
    },
    {
      tickTimeout: 0,
      ticks: 0,
      mana: 50,
      tick: (user: GameUser): void => {
        user.map = flattenMap(user.map);
      },
    },
    {
      tickTimeout: 0,
      ticks: 0,
      mana: 50,
      tick: (user: GameUser): void => {
        let xIndex = 0;
        user.map.forEach((y, yIndex) => {
          if (!(yIndex % 2) && yIndex) {
            xIndex += 1;
          }

          (user.map[yIndex][xIndex] as any) = undefined;
        });
      },
    },
  ];
}
