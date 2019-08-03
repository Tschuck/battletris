import Component, { mixins } from 'vue-class-component';
import { Vue } from 'vue-property-decorator';
import * as mapHandler from '../../../battletris/mapHandler';

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
   * Block for previewing the user the next dock position
   */
  previewBlock: Array<Array<any>> = [[]];

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
    if (!battle) {
      return;
    }

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
          const renderPreview = () => {
            if (this.$store.state.userConfig.blockPreview &&
                connectionId === this.connectionId &&
                battle.status === 'started') {
              // current battle user will not be updated at this point, just redraw the preview with
              // the latest value, from the current new battle update or from the previous battle
              // instance
              const newPreviewBlock = mapHandler.getDockPreview(
                battle.users[this.connectionId].map || this.battle.users[this.connectionId].map,
                battle.users[this.connectionId].activeBlock || this.battle.users[this.connectionId].activeBlock,
              );

              // only render preview block after the 4th level
              if (newPreviewBlock.y > 4) {
                // draw the block preview
                this.battleMaps[this.connectionId].drawBlockMap(
                  newPreviewBlock,
                  this.previewBlock,
                  -3,
                );

                // update the current preview block, after the old one was cleared and the new one drawed
                this.previewBlock = newPreviewBlock;
              } else {
                // clear the block
                this.battleMaps[this.connectionId].drawBlockMap(
                  this.previewBlock,
                  null,
                  -1,
                );
                this.previewBlock = null;
              }
            }
          };

          // generate preview block for next dock position; IMPORTANT: run this function before
          // rendering the map / activeBlock, instead the block will be overwritten
          renderPreview();

          // // if activeBlock was changed, redraw it
          if (battle.users[connectionId].activeBlock) {
            this.battleMaps[connectionId].drawBlockMap(
              battle.users[connectionId].activeBlock,
              this.battle.users[connectionId].activeBlock,
              // important: the moving active block consists only of a map of 0 and zero, apply the
              // activeBlock type
              battle.users[connectionId].activeBlock.type,
            );
          }

          // at first, check for a new map and redraw it
          if (battle.users[connectionId].map) {
            this.battleMaps[connectionId].drawBlockMap(
              battle.users[connectionId].map,
              this.battle.users[connectionId].map,
            );

            // just rerender preview, it would be broken, after the old map was cleared
            renderPreview();
          }

          // apply all changed keys to the users status
          Object.keys(battle.users[connectionId]).forEach(key =>
            // update user content for next round, could be undefined by joining a room
            this.$set(this.battle.users[connectionId], key, battle.users[connectionId][key])
          );
        }
      });
    }
  }

  /**
   * Calculate the size of the opponent div container.
   */
  getUserContainerSize() {
    let usersInARow = Math.round(Object.keys(this.battle.users)
      .filter(userId => userId !== this.connectionId)
      .length / 2);

    // allow at least 3 users in a row, then break
    usersInARow = usersInARow > 3 ? 3 : usersInARow;

    return usersInARow * 300;
  }
}
