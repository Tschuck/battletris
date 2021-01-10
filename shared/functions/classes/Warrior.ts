/* eslint-disable import/no-cycle */
import { flattenMap, generateRandomAreaClear } from '../mapHelper';
import GameUser from '../GameUser';
import { BaseClass } from './BaseClass';

/*
  // use this calculation for adjusting the scaling values:
  checkMaxValues = (value, scaling, level = 15) => value + (value * scaling * level);
  checkMaxValues(30, 0.1);
*/
export default class Warrrior extends BaseClass {
  baseArmor = 50; // max: 275

  baseMana = 20; // max: 275

  armorScaling = 0.3;

  manaScaling = 0.1;

  abilities = [
    {
      mana: 20,
      onActivate: (from: GameUser, to: GameUser): void => {
        // class index, ability index, activation time, from index, execution time
        to.block = from.block;
        to.rotation = from.rotation;
        from.setNewBlock();
      },
    },
    {
      mana: 30,
      onActivate: (from: GameUser, to: GameUser): void => {
        to.map = generateRandomAreaClear([[1, 1], [1, 1]], to.map);
      },
    },
    {
      mana: 50,
      onActivate: (from: GameUser, to: GameUser): void => {
        let xIndex = 0;
        to.map.forEach((y, yIndex) => {
          if (!(yIndex % 2) && yIndex) {
            xIndex += 1;
          }

          (to.map[yIndex][xIndex] as any) = undefined;
        });
      },
    },
    {
      mana: 50,
      onActivate: (from: GameUser, to: GameUser): void => {
        to.map = flattenMap(to.map);
      },
    },
  ];
}
