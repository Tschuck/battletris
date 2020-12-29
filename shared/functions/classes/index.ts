/* eslint-disable import/no-cycle */
import Classes from '../../enums/Classes';
import { AbilityInterface, ClassInterface } from './ClassInterface';
import Battletris from './Battletris';
import Sorcerer from './Sorcerer';
import Unknown from './Unknown';
import Warrior from './Warrior';

const classes: ClassInterface[] = [
  new Battletris(),
  new Unknown(),
  new Sorcerer(),
  new Warrior(),
];

const getClassIndex = (className: string): number => (Classes as any)[className.toUpperCase()];

export {
  AbilityInterface,
  classes,
  ClassInterface,
  getClassIndex,
};
