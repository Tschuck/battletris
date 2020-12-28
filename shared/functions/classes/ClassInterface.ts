import GameUser from '../GameUser';

interface AbilityInterface {
  /** how long is the ability active? (just for displaying) */
  duration: number;

  /** timeout to activate ticks */
  tickTimeout: number;

  /** how often the ability should be activated? */
  ticks: number;

  /** amount of needed mana */
  mana: number;

  /** function that is executed, on each effect loop tick */
  tick: (user: GameUser, executionTime: number) => void;
}

interface ClassInterface {
  /** maximum amount of armor */
  maxArmor: number;

  /** maximum amount of mana */
  maxMana: number;

  abilities: {
    q: AbilityInterface;

    w: AbilityInterface;

    e: AbilityInterface;

    r: AbilityInterface;
  };
}

export {
  AbilityInterface,
  ClassInterface,
};
