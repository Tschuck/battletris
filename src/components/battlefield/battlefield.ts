import Component, { mixins } from 'vue-class-component';
import { Vue } from 'vue-property-decorator';

import * as battletris from '../../battletris';
import Loading from '../loading/loading.vue';
import Panel from '../panel/panel.vue';
import Map from './map/map.vue';
import BattleUserStatus from './status/status.vue';

@Component({
  components: {
    'battletris-map': Map,
    'battletris-panel': Panel,
    'battletris-user-status': BattleUserStatus,
    'loading': Loading,
  }
})
export default class BattleField extends Vue {
  /**
   * Status flags
   */
  loading = true;
  reloading = false;
  error = '';

  /**
   * listeners for ws updates
   */
  listeners: Array<any> = [ ];
  keyHandler;

  /**
   * Opened room, save it to the variable, else, we cannot handle correct roomLeave
   */
  room = '';
  roomDetails = null;
  battle = null;

  /**
   * Connection id
   */
  connectionId = '';

  /**
   * Rendered battle maps mapped to connection id's
   */
  battleMaps: any = { };

  /**
   * dynamically update when increment has changed the value
   */
  optionalIncrementKeys = [
    'startCounter',
    'status',
  ];

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

    // bind key handler
    this.keyHandler = ((e) => this.handleUserKey(e)).bind(this);
    window.addEventListener('keydown', this.keyHandler);

    this.loading = false;
  }

  /**
   * Clear listeners
   */
  async beforeDestroy() {
    await battletris.leaveRoom(this.room);
    this.listeners.forEach(listener => listener());
    window.removeEventListener('keydown', this.keyHandler);
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

    // just refresh the ui using the latest value
    // if (status === 'accept') {
    //   this.reloading = true;
    //   setTimeout(() => this.reloading = false);
    // }
  }

  /**
   * Handle a full battle update.
   *
   * @param      {any}  battle  The battle
   */
  handleBattleUpdate(battle: any) {
    if (this.battle) {
      this.handleBattleIncrement(battle);
    }

    // just update the battle after the old field was cleared
    this.battle = battle;
  }

  /**
   * Handle incremental battle data updates
   *
   * @param      {any}  battle  battle obj
   */
  handleBattleIncrement(battle) {
    // update general data
    this.optionalIncrementKeys.forEach(key => {
      if (battle[key]) {
        this.battle[key] = battle[key];
      }
    });

    // parse duration to seconds
    if (battle.duration) {
      this.$set(this.battle, 'duration', Math.round(battle.duration / 1000));
    }

    // update user maps
    if (battle.users) {
      Object.keys(battle.users).forEach(connectionId => {
        if (this.battleMaps[connectionId] &&
            this.battleMaps[connectionId].$refs &&
            this.battle.users[connectionId]) {
          Object.keys(battle.users[connectionId]).forEach(key => {
            // if map or activeBlock was changed, trigger battle map update
            if (key === 'map' || key === 'activeBlock') {
              this.battleMaps[connectionId].drawBlockMap(
                battle.users[connectionId][key],
                this.battle.users[connectionId][key],
                // important: the moving active block consists only of a map of 0 and zero, apply the
                // activeBlock type
                key === 'activeBlock' ? battle.users[connectionId][key].type : null,
              );
            }

            // update user content for next round, could be undefined by joining a room
            this.battle.users[connectionId][key] = battle.users[connectionId][key];
          });
        }
      });
    }
  }

  /**
   * Send user key to backend.
   */
  handleUserKey($event: any) {
    if (this.battle.status === 'started') {
      battletris.promiseClient.action('battletris/battles-actions', {
        room: this.room,
        connectionId: this.connectionId,
        key: $event.keyCode,
      });

      // stop event handling
      $event.stopPropagation();
      $event.preventDefault();
      return false;
    }
  }
}
