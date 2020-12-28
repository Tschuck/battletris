/* eslint-disable import/no-cycle */
import { AbilityInterface, ClassInterface } from './ClassInterface';
import Sorcerer from './Sorcerer';
import Unknown from './Unknown';
import Warrior from './Warrior';

const classes: ClassInterface[] = [
  new Unknown(),
  new Sorcerer(),
  new Warrior(),
];

export {
  AbilityInterface,
  ClassInterface,
  classes,
};
