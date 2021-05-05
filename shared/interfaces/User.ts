import KeyMapInterface from '../functions/keymaps/KeyMapInterface';
import { MatchInterface } from './MatchStats';

export default interface UserInterface {
  activeKeyMap: string;
  className: string;
  id: string;
  keyMaps: KeyMapInterface[];
  matches: MatchInterface[];
  name: string;
}
