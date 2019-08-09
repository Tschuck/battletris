import BattleField from './battlefield/battlefield.vue';
import BattletrisAbilities from './classes/abilities/abilities.vue';
import BattletrisAbilityImg from './classes/ability-img/ability-img.vue';
import Chat from './chat/chat.vue';
import ClassImg from './classes/class-img/class-img.vue';
import Controls from './battlefield/controls/controls.vue';
import Header from './header/header.vue';
import Loading from './loading/loading.vue';
import ManaBar from './battlefield/mana-bar/mana-bar.vue';
import Map from './battlefield/map/map.vue';
import Opponent from './battlefield/opponent/opponent.vue';
import Status from './battlefield/status/status.vue';
import Tavern from './tavern/tavern.vue';

export default [
  { name: 'battletris-abilities', component: BattletrisAbilities, },
  { name: 'battletris-ability-img', component: BattletrisAbilityImg, },
  { name: 'battletris-battlefield', component: BattleField, },
  { name: 'battletris-chat', component: Chat, },
  { name: 'battletris-class-img', component: ClassImg, },
  { name: 'battletris-controls', component: Controls, },
  { name: 'battletris-header', component: Header, },
  { name: 'battletris-loading', component: Loading, },
  { name: 'battletris-mana-bar', component: ManaBar, },
  { name: 'battletris-map', component: Map, },
  { name: 'battletris-opponent', component: Opponent, },
  { name: 'battletris-tavern', component: Tavern, },
  { name: 'battletris-user-status', component: Status, },
];

