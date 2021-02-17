import { GameStateChange, UserStateChange } from '../keymaps/stateChanges';
// eslint-disable-next-line import/no-cycle
import GameUser from '../GameUser';

interface AbilityInterface {
  /** timeout to activate ticks */
  tickTimeout?: number;

  /** how often the ability should be activated? */
  ticks?: number;

  /** amount of needed mana */
  mana: number;

  /** milliseconds for that the ability cannot be activated */
  cooldown?: number;

  /**
   * function that is executed, on each effect loop tick.
   *
   * @user GameUser game user to apply effect to
   * @tick amount of previous ticks
   */
  tick?: (
    user: GameUser,
    userEvent: number[]|undefined,
  ) => void;

  /**
   * function that is executed, before the ability is activated.
   *
   * @user GameUser game user to apply effect to
   * @tick amount of previous ticks
   */
  onActivate?: (
    from: GameUser,
    to: GameUser,
    userEvent: number[]|undefined,
  ) => void;

  /**
   * function that is executed, before the ability is activated.
   *
   * @user GameUser game user to apply effect to
   * @tick amount of previous ticks
   */
  onBeforeEnd?: (
    from: GameUser,
    to: GameUser,
    userEvent: number[]|undefined,
  ) => void;

  /**
   * function that is executed, on each state change
   *
   * @user GameUser game user to apply effect to
   * @userEvent user event for the key
   * @key pressed key
   */
  onStateChange?: (
    user: GameUser,
    userEvent: number[]|undefined,
    key: GameStateChange|UserStateChange,
  ) => GameStateChange|UserStateChange|undefined;
}

interface ClassInterface {
  /** maximum amount of armor */
  baseArmor: number;

  /** maximum amount of mana */
  baseMana: number;

  /** amount of exp needed to level up */
  baseExp: number;

  /** base armor will scale with with this level with each level up */
  armorScaling: number;

  /** base mana will scale with with this level with each level up */
  manaScaling: number;

  /** base exp will scale with with this level with each level up */
  expScaling: number;

  abilities: AbilityInterface[];
}

class BaseClass implements ClassInterface {
  abilities: AbilityInterface[] = [];

  baseArmor = 0;

  baseMana = 0;

  baseExp = 100;

  armorScaling = 0;

  manaScaling = 0;

  expScaling = 0;

  /** General calculation function for exp, armor and mana */
  calculateForLevel(baseValue: number, scaling: number, level: number): number {
    return Math.ceil(baseValue + (baseValue * scaling * level));
  }

  /** Calculate the max mana for a specific level */
  getArmorForLevel(level: number): number {
    return this.calculateForLevel(this.baseArmor, this.armorScaling, level);
  }

  /** Calculate the max armor for a specific level */
  getManaForLevel(level: number): number {
    return this.calculateForLevel(this.baseMana, this.manaScaling, level);
  }

  /** Calculate the max armor for a specific level */
  getExpForLevel(level: number): number {
    return this.calculateForLevel(this.baseExp, this.expScaling, level);
  }
}

export {
  AbilityInterface,
  BaseClass,
  ClassInterface,
};
