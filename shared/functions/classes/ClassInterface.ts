import { GameStateChange } from '../gameHelper';
// eslint-disable-next-line import/no-cycle
import GameUser from '../GameUser';

interface AbilityInterface {
  /** timeout to activate ticks */
  tickTimeout?: number;

  /** how often the ability should be activated? */
  ticks?: number;

  /** amount of needed mana */
  mana: number;

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
   * function that is executed, on each state change
   *
   * @user GameUser game user to apply effect to
   * @userEvent user event for the key
   * @key pressed key
   */
  onStateChange?: (
    user: GameUser,
    userEvent: number[]|undefined,
    key: GameStateChange,
  ) => GameStateChange|undefined;
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
