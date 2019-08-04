import Component, { mixins } from 'vue-class-component';
import { promisify } from 'es6-promisify';
import { Vue, Prop } from 'vue-property-decorator';

import * as battletris from '../../battletris';
import Loading from '../loading/loading.vue';

@Component({
  components: {
    'loading': Loading,
  }
})
export default class Chat extends Vue {
  /**
   * room name that should be watched
   */
  @Prop() room;

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
  users: Array<any> = [ ];

  /**
   * chat messages
   */
  newMessage = '';
  messages: Array<any> = [ ];

  async created() {
    // watch for user updates
    this.listeners.push(battletris.watch(`${ this.room }/room`, (data) => {
      this.users = data.message.room.users;
    }));

    this.listeners.push(battletris.watch(`${ this.room }/chat`, (data) => {
      this.messages.unshift({
        from: data.from,
        text: data.message.text
      });
    }));

    this.loading = false;
  }

  async beforeDestroy() {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Send text message to the others.
   */
  async sendMessage() {
    if (this.newMessage.length > 0) {
      await battletris.promiseClient.say(this.room, JSON.stringify({
        type: 'chat',
        text: this.newMessage,
      }));

      this.newMessage = '';
    }
  }
}

