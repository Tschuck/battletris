import Component, { mixins } from 'vue-class-component';
import { Vue } from 'vue-property-decorator';

import * as battletris from '../../battletris';
import Loading from '../loading/loading.vue';
import Panel from '../panel/panel.vue';
import Map from './map/map.vue';

@Component({
  components: {
    'battletris-map': Map,
    'battletris-panel': Panel,
    'loading': Loading,
  }
})
export default class BattleField extends Vue {
  /**
   * Status flags
   */
  loading = true;
  error = '';

  /**
   * listeners for ws updates
   */
  listeners: Array<any> = [ ];

  /**
   * Opened room, save it to the variable, else, we cannot handle correct roomLeave
   */
  room = '';
  roomDetails = null;
  battle = null;

  /**
   * Used for iterate to maxUsers
   */
  fillUserCounter = [ ];

  /**
   * Connection id
   */
  connectionId = '';

  async created() {
    this.room = this.$route.params.room;
    this.connectionId = battletris.wsClient.id;

    // watch for room join / leave updates
    this.watch('room', (data) => {
      this.roomDetails = data.message.room
    });

    // watch for battle join / leave
    this.watch('battle', (data) => this.handleBattleUpdate(data.message.battle));

    // watch for incremental battle updates
    this.watch('battle-increment', (data) => this.handleBattleIncrement(data.message.battle));

    // say everyone we are in the house
    await battletris.joinRoom(this.room, this.$store.state.userConfig);

    // load initial room data
    this.roomDetails = (await battletris.promiseClient.action('battletris/rooms', {
      room: this.room
    })).room;

    // request initial battle data
    await this.handleBattleUpdate((await battletris.promiseClient.action('battletris/battles', {
      room: this.room
    })).battle);

    this.loading = false;
  }

  /**
   * Clear listeners
   */
  async beforeDestroy() {
    await battletris.leaveRoom(this.room);
    this.listeners.forEach(listener => listener());
  }

  /**
   * Add a listener and watch for battletris channel updates
   *
   * @param      {event}     name    event name
   * @param      {Function}  func    function to execute
   */
  watch(name, func) {
    this.listeners.push(battletris.watch(`${ this.room }/${ name }`, func));
  }

  /**
   * Join / leave the battle
   */
  async setBattleStatus(status: string) {
    await battletris.roomAction(this.room, `battle-${ status }`);
  }

  /**
   * Handle a full battle update.
   *
   * @param      {any}  battle  The battle
   */
  handleBattleUpdate(battle: any) {
    this.battle = battle;
    this.fillUserCounter = [...Array(
      this.roomDetails.config.maxUsers -
      Object.keys(this.battle.users).length
    )];
    this.handleBattleIncrement(battle);
  }

  /**
   * Handle incremental battle data updates
   *
   * @param      {any}  battle  battle obj
   */
  handleBattleIncrement(battle) {
    if (battle.duration) {
      this.$set(this.battle, 'duration', Math.round(battle.duration / 1000));
    }
    this.battle.startCounter = battle.startCounter;
    this.battle.status = battle.status;
  }
}
