/* eslint-disable import/no-cycle */
import { GameStateChange } from '../gameHelper';
import GameUser from '../GameUser';
import { ClassInterface } from './ClassInterface';

export default class Sorcerer implements ClassInterface {
  maxArmor = 50;

  maxMana = 150;

  abilities = [
    {
      mana: 55,
      cooldown: 5_000,
      onActivate: (from: GameUser, to: GameUser): void => {
        to.handleStateChange(GameStateChange.FALL_DOWN);
      },
    },
    {
      tickTimeout: 10_000,
      ticks: 2,
      mana: 80,
      tick: (user: GameUser, userEvent: number[]|undefined = []): void => {
        // reduce speed on first tick, increase it back on second tick
        if (userEvent[4] === 1) {
          user.speed /= 2;
        } else {
          user.speed *= 2;
        }
      },
    },
    {
      tickTimeout: 10_000,
      ticks: 2,
      mana: 100,
      onStateChange: (
        user: GameUser,
        userEvent: number[]|undefined,
        key: GameStateChange,
      ): GameStateChange => {
        // it was a technical user event
        if (!userEvent || !userEvent[1]) {
          return key;
        }

        // reverse controls
        if (key === GameStateChange.TURN) {
          return GameStateChange.DOWN;
        }
        if (key === GameStateChange.DOWN) {
          return GameStateChange.TURN;
        }
        if (key === GameStateChange.LEFT) {
          return GameStateChange.RIGHT;
        }
        if (key === GameStateChange.RIGHT) {
          return GameStateChange.LEFT;
        }

        return key;
      },
    },
    {
      tickTimeout: 10_000,
      ticks: 2,
      mana: 150,
      onStateChange: (
        user: GameUser,
        userEvent: number[]|undefined,
        key: GameStateChange,
      ): GameStateChange|undefined => {
        // it was a technical user event
        if (!userEvent || !userEvent[1]) {
          return key;
        }
      },
    },
  ];
}
