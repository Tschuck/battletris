/* eslint-disable import/no-cycle */
import { GameStateChange } from '../gameHelper';
import GameUser from '../GameUser';
import { ClassInterface } from './ClassInterface';

export default class Sorcerer implements ClassInterface {
  maxArmor = 50;

  maxMana = 200;

  abilities = [
    {
      tickTimeout: 0,
      ticks: 0,
      mana: 20,
      tick: (user: GameUser): void => {
        user.handleStateChange(GameStateChange.FALL_DOWN);
      },
    },
    {
      tickTimeout: 10_000,
      ticks: 2,
      mana: 50,
      tick: (user: GameUser, tick: number): void => {
        // reduce speed on first tick, increase it back on second tick
        if (tick === 1) {
          user.speed -= 800;
        } else {
          user.speed += 800;
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
      mana: 100,
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
