/* eslint-disable import/no-cycle */
import { AbilityInterface, ClassInterface } from './ClassInterface';
import Battletris from './Battletris';
import Sorcerer from './Sorcerer';
import Unknown from './Unknown';
import Warrior from './Warrior';

enum ClassesIndex {
  BATTLETRIS = 0,
  UNKNOWN = 1,
  SORCERER = 2,
  WARRIOR = 3,
}

const classes: Record<string, ClassInterface> = {
  battletris: new Battletris(),
  unknown: new Unknown(),
  sorcerer: new Sorcerer(),
  warrior: new Warrior(),
};

const classList: ClassInterface[] = [
  classes.battletris,
  classes.unknown,
  classes.sorcerer,
  classes.warrior,
];

const getClassIndex = (className: string): number => (ClassesIndex as any)[className.toUpperCase()];

export {
  AbilityInterface,
  classes,
  ClassesIndex,
  ClassInterface,
  classList,
  getClassIndex,
};
