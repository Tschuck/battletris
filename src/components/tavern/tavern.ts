import Component, { mixins } from 'vue-class-component';
import { promisify } from 'es6-promisify';
import { Vue } from 'vue-property-decorator';

import * as battletris from '../../battletris';

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
  users: Array<any> = [ ];

  async created() {
    // watch for user updates
    this.listeners.push(battletris.watch('tavern/users', (data) => {
      this.users = data.message.users;
    }));

    // say everyone we are in the house
    await battletris.promiseClient.roomAdd('tavern');
    await battletris.populateConfig('tavern', this.$store.state.userConfig);

    this.loading = false;
  }

  async beforeDestroy() {
    await battletris.promiseClient.roomLeave('tavern');
    this.listeners.forEach(listener => listener());
  }
}

