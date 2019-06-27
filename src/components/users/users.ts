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
export default class Users extends Vue {
  /**
   * room name that should be watched
   */
  @Prop() roomName;

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
  users: any = { };

  async created() {
    // watch for user updates
    this.listeners.push(battletris.watch(`${ this.roomName }/users`, (data) => {
      this.users = data.message.users;
    }));

    this.loading = false;
  }

  async beforeDestroy() {
    this.listeners.forEach(listener => listener());
  }
}

