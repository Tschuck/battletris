// eslint-disable-next-line import/no-cycle
import GameUser from '../GameUser';

interface AbilityInterface {
  /** timeout to activate ticks */
  tickTimeout?: number;

  /** how often the ability should be activated? */
  ticks?: number;

  /** amount of needed mana */
  mana: number;

  /** function that is executed, on each effect loop tick */
  tick: (user: GameUser) => void;
}

interface ClassInterface {
  /** maximum amount of armor */
  maxArmor: number;

  /** maximum amount of mana */
  maxMana: number;

  abilities: AbilityInterface[];
}

export {
  AbilityInterface,
  ClassInterface,
};
