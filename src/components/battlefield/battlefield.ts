import Component, { mixins } from 'vue-class-component';
import { Vue } from 'vue-property-decorator';
import * as mapHandler from '../../../battletris/mapHandler';
import { mergeWith } from 'lodash';

import * as battletris from '../../battletris';

@Component({ })
export default class BattleField extends Vue {
  /**
   * Status flags
   */
  loading = true;
  error = '';

  /**
   * left panel displayed stuff
   */
  leftPanelIndex = 0;

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
   * Array of empty elements to render all game fields everytime
   */
  userArray = [ null, null, null, null, null, null, ];

  /**
   * Currents user connection id
   */
  connectionId = '';

  /**
   * Rendered battle maps mapped to connection id's
   */
  battleMaps: any = { };

  /**
   * Block for previewing the user the next dock position
   */
  previewBlock: any = [[]];

  /**
   * dynamically update when increment has changed the value
   */
  optionalIncrementKeys = [
    'config',
    'startCounter',
    'status',
  ];

  /**
   * Allow key pressing only each 50 milliseconds
   */
  keyTimeout = { };

  async created() {
    this.room = this.$route.params.room;
    this.connectionId = battletris.wsClient.id;

    // watch for room join / leave updates
    this.watch('room', (data) => {
      this.roomDetails = data.message.room
    });

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

    // watch for battle join / leave
    this.watch('battle', (data) => this.handleBattleUpdate(data.message.battle));

    // watch for incremental battle updates
    this.watch('battle-increment', (data) => this.handleBattleIncrement(data.message.battle));

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
   * Send user key to backend.
   */
  handleUserKey($event: any) {
    if (this.battle.status === 'started') {
      // only send key press event, when no key press timeout is running
      if (!this.keyTimeout[$event.keyCode]) {
        // execute the battle action and directly use the result for the update
        (async () => {
          const update = await battletris.promiseClient.action('battletris/battles-actions', {
            room: this.room,
            connectionId: this.connectionId,
            key: $event.keyCode,
          });

          this.handleBattleIncrement(update.battle);
        })();

        // wait 50 milliseconds until sending next key code
        this.keyTimeout[$event.keyCode] = setTimeout(() => {
          delete this.keyTimeout[$event.keyCode];
        }, 30);
      } else {
        console.log('key timeout')
      }

      // stop event handling
      $event.stopPropagation();
      $event.preventDefault();
      return false;
    }
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
    // just update the battle after the old field was cleared
    this.battle = battle;
    this.handleBattleIncrement(battle);
  }

  /**
   * Handle incremental battle data updates
   *
   * @param      {any}  battle  battle obj
   */
  handleBattleIncrement(battle) {
    if (!battle) {
      return;
    }

    this.battle = mergeWith(this.battle, battle, (objValue, srcValue) => {
      if (Array.isArray(srcValue)) {
        return srcValue;
      }
    });

    // update user maps
    if (battle.users) {
      Object.keys(battle.users).forEach(connectionId => {
        if (this.battleMaps[connectionId] &&
            this.battleMaps[connectionId].$refs &&
            this.battle.users[connectionId]) {
          if (battle.users[connectionId].cooldowns) {
            this.$set(this.battle.users[connectionId], 'cooldowns', this.battle.users[connectionId].cooldowns);
          }

          // clear previous map
          this.battleMaps[connectionId].clearBlockMap();

          if (this.$store.state.userConfig.blockPreview &&
              connectionId === this.connectionId &&
              this.battle.status === 'started') {
            // current battle user will not be updated at this point, just redraw the preview with
            // the latest value, from the current new battle update or from the previous battle
            // instance
            this.previewBlock = mapHandler.getDockPreview(
              this.battle.users[this.connectionId].map,
              this.battle.users[this.connectionId].activeBlock,
            );

            // only render preview block after the 4th level
            if (this.previewBlock.y > 4) {
              // draw the block preview
              this.battleMaps[this.connectionId].drawBlockMap(
                this.previewBlock,
                -3,
              );
            }
          }

          // draw the current block
          this.battleMaps[connectionId].drawBlockMap(
            this.battle.users[connectionId].activeBlock,
            // important: the moving active block consists only of a map of 0 and zero, apply the
            // activeBlock type
            this.battle.users[connectionId].activeBlock.type,
          );

          // redraw the map
          this.battleMaps[connectionId].drawBlockMap(
            this.battle.users[connectionId].map,
          );
        }
      });
    }
  }
}
