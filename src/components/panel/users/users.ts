import Component, { mixins } from 'vue-class-component';
import { promisify } from 'es6-promisify';
import { Vue, Prop } from 'vue-property-decorator';

import * as battletris from '../../../battletris';
import Loading from '../../loading/loading.vue';

@Component({
  components: {
    'loading': Loading,
  }
})
export default class Users extends Vue {
  /**
   * room name that should be watched
   */
  @Prop() room;

  /**
   * Pass a list of users directly and listen for updates
   */
  @Prop() users;

  /**
   * show nes container
   */
  @Prop({
    default: true
  }) container;

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
  userList: any = { };

  async created() {
    if (this.users) {
      this.userList = this.users;
    } else {
      // watch for user updates
      this.listeners.push(battletris.watch(`${ this.room }/users`, (data) =>
        this.userList = data.message.users
      ));
    }

    this.loading = false;
  }

  async beforeDestroy() {
    this.listeners.forEach(listener => listener());
  }
}

