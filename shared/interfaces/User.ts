import { MatchInterface } from './MatchStats';

export default interface UserInterface {
  id: string;

  className: string;

  matches: MatchInterface[];

  name: string;
}
