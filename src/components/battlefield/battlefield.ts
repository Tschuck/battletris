import FPSMeter from 'fpsmeter';
import * as mapHandler from '../../../battletris/mapHandler';
import Component, { mixins } from 'vue-class-component';
import { mergeWith } from 'lodash';
import { Vue } from 'vue-property-decorator';

import * as battletris from '../../battletris';

// just use this, to be able to use FPSMeter
const fpsMeter = FPSMeter;

@Component({ })
export default class BattleField extends Vue {
  /**
   * Status flags
   */
  loading = true;
  error = '';
  stopped = false;

  /**
   * left panel displayed stuff
   */
  leftPanelIndex = 0;

  /**
   * listeners for ws updates
   */
  listeners: Array<any> = [ ];
  keyDownHandler;
  keyUpHandler;

  /**
   * Opened room, save it to the variable, else, we cannot handle correct roomLeave
   */
  room = '';

  /**
   * Chat room details including user names, ...
   */
  roomDetails = null;

  /**
   * Current battle object
   */
  battle = null;

  /**
   * Last battle data update, don't update older data! Could be possible by overtaking requests
   */
  battleDataDate = Date.now();

  /**
   * Connection for maps that should be rerendered
   */
  battleUsersToUpdate: Array<string> = [ ];

  /**
   * Don't render multiple times.
   */
  animationTimeout: number;

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
   * Block that is used to positionate battle status hover preview
   */
  battleStatusBlock: any = null;

  /**
   * Allow key pressing only each 50 milliseconds
   */
  keyTimeout = { };
  keyPressed = false;

  /**
   * fps meter
   */
  fpsMeter;

  /**
   * estimated server response times
   */
  responseTimes = [ ];
  estimatedResponseTime = 0;

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
    this.watch('battle-increment', (data) => this.handleBattleIncrement(
      data.message.battle,
      data.message.date,
    ));

    // bind key handler
    this.keyDownHandler = ((e) => this.handleUserKey(e)).bind(this);
    this.keyUpHandler = ((e) => this.keyPressed = false).bind(this);
    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);

    // use this for usually known game loop (is currently not required)
    // this.renderBattleIncrements();

    this.loading = false;
  }

  /**
   * Bind ipfs meter.
   */
  mounted() {
    setTimeout(() => {
      this.fpsMeter = new (<any>window).FPSMeter(
        document.querySelectorAll('.fps-meter')[0],
        {
          show: 'fps',
          theme: 'transparent',
        }
      );
    }, 1000);
  }

  /**
   * Clear listeners
   */
  async beforeDestroy() {
    // cancel game loop
    this.stopped = true;

    // stop fps meter
    this.fpsMeter.destroy();

    // leave room and destroy key listeners
    await battletris.leaveRoom(this.room);
    this.listeners.forEach(listener => listener());
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);
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
  async handleUserKey($event: any) {
    if (this.battle.status === 'started') {
      // only send key press event, when no key press timeout is running
      if (!this.keyTimeout[$event.keyCode]) {
        // execute the battle action and directly use the result for the update
        (async () => {
          const startDate = Date.now();
          const update = await battletris.promiseClient.action('battletris/battles-actions', {
            connectionId: this.connectionId,
            key: $event.keyCode,
            keyPressed: this.keyPressed,
            room: this.room,
          });

          // set key pressed, so when handleUserKey is triggered again, we can detect if the key was
          // released or not (e.g. for tab pressed events)
          this.keyPressed = true;

          // estimate response times
          this.responseTimes.unshift(Date.now() - startDate);
          this.responseTimes = this.responseTimes.splice(0, 10);
          this.estimatedResponseTime = Math.round(
            this.responseTimes.reduce((previous, current) => current += previous) /
            this.responseTimes.length
          );

          this.handleBattleIncrement(update.battle, update.date);
        })();

        // wait 50 milliseconds until sending next key code
        this.keyTimeout[$event.keyCode] = setTimeout(() => {
          delete this.keyTimeout[$event.keyCode];
        }, 30);
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
  handleBattleIncrement(battle: any, date?: number) {
    // - reject if no battle was send
    // - only merge battle, when it's newer data
    if (!battle || (date && this.battleDataDate > date)) {
      return;
    } else if (date) {
      // update last battle data date
      this.battleDataDate = date;
    }

    this.battle = mergeWith(this.battle, battle, (objValue, srcValue) => {
      if (Array.isArray(srcValue)) {
        return srcValue;
      }
    });

    // update user maps
    if (battle.users) {
      // mark updated users to be rerendered
      Object.keys(battle.users).forEach(connectionId => {
        if (this.battleUsersToUpdate.indexOf(connectionId) === -1) {
          this.battleUsersToUpdate.push(connectionId);
        }
      });

      this.renderBattleIncrements();
    }
  }

  /**
   * Takes the current battle and the as updated flagged users and rerender the maps.
   */
  renderBattleIncrements() {
    if (!this.animationTimeout && !this.stopped) {
      this.fpsMeter && this.fpsMeter.tickStart();
      this.animationTimeout = requestAnimationFrame(() => {
        this.battleUsersToUpdate.forEach(connectionId => {
          if (this.battleMaps[connectionId] &&
              this.battleMaps[connectionId].$refs &&
              this.battle.users[connectionId]) {
            console.log(JSON.stringify(this.battle.users[connectionId].activeBlock))
            // clear previous map
            this.battleMaps[connectionId].clearBlockMap();

            if (connectionId === this.connectionId && this.battle.status === 'started') {
              if (this.$store.state.userConfig.blockPreview) {
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

              if (this.$store.state.userConfig.battleHover) {
                // analyze the highest field position to show battle status hover (use one full line
                // to check this)
                this.battleStatusBlock = mapHandler.getDockPreview(
                  this.battle.users[this.connectionId].map,
                  {
                    y: 0,
                    x: 0,
                    map: [[ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]]
                  },
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

        // reset battle users to update
        this.battleUsersToUpdate = [ ];

        // let the user render the next animation frame
        delete this.animationTimeout;

        // finish fps meter tick
        this.fpsMeter && this.fpsMeter.tick();
      });
    }
  }
}
