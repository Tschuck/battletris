import Component, { mixins } from 'vue-class-component';
import { promisify } from 'es6-promisify';
import { Vue } from 'vue-property-decorator';

import * as battletris from '../../battletris';
import Chat from '../chat/chat.vue';
import Header from '../header/header.vue';
import Loading from '../loading/loading.vue';

@Component({ })
export default class Tavern extends Vue {
  /**
   * status flags
   */
  loading = true;
  error = '';

  /**
   * listeners for ws updates
   */
  listeners: Array<any> = [ ];

  /**
   * users joined to the tavern
   */
  rooms: any = null;

  /**
   * chat messages
   */
  newMessage = '';
  messages: Array<any> = [ ];

  async created() {
    // watch for room status
    this.listeners.push(battletris.watch('tavern/rooms', (data) => {
      // this.loading = true;
      this.rooms = data.message.rooms;
      // this.$nextTick(() => this.loading = false);
    }));

    this.rooms = await battletris.getRooms();

    // join tavern
    await battletris.joinRoom('tavern', this.$store.state.userConfig);

    this.loading = false;
  }

  /**
   * Clear all room watchers
   */
  async beforeDestroy() {
    // leave rooms
    await battletris.leaveRoom('tavern');
    // unsubscibe listeners
    this.listeners.forEach(listener => listener());
  }
}

