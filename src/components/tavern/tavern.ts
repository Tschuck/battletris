import Component, { mixins } from 'vue-class-component';
import { promisify } from 'es6-promisify';
import { Vue } from 'vue-property-decorator';

import * as battletris from '../../battletris';
import Chat from '../chat/chat.vue';
import Loading from '../loading/loading.vue';
import Users from '../users/users.vue';

@Component({
  components: {
    'battletris-chat': Chat,
    'battletris-users': Users,
    'loading': Loading,
  }
})
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
  users: Array<any> = [ ];

  /**
   * Class definitions
   */
  classes = null;

  /**
   * chat messages
   */
  newMessage = '';
  messages: Array<any> = [ ];

  async created() {
    // watch for user updates
    this.listeners.push(battletris.watch('tavern/users', (data) => {
      this.users = data.message.users;
    }));

    this.listeners.push(battletris.watch('tavern/chat', (data) => {
      this.messages.unshift({
        from: data.from,
        text: data.message.text
      });
    }));

    // load classes defintion
    this.classes = await battletris.getClasses();

    // say everyone we are in the house
    await battletris.promiseClient.roomAdd('tavern');
    await battletris.populateConfig('tavern', this.$store.state.userConfig);

    this.loading = false;
  }

  async beforeDestroy() {
    await battletris.promiseClient.roomLeave('tavern');
    this.listeners.forEach(listener => listener());
  }

  /**
   * Use current configuration and send update events.
   */
  async useConfiguration() {
    await battletris.populateConfig('tavern', this.$store.state.userConfig);
  }

  /**
   * Send text message to the others.
   */
  async sendMessage() {
    await battletris.promiseClient.say('tavern', JSON.stringify({
      type: 'chat',
      text: this.newMessage,
    }));

    this.newMessage = '';
  }
}

