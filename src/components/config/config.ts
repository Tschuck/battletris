import Component, { mixins } from 'vue-class-component';
import { promisify } from 'es6-promisify';
import { Vue, Prop } from 'vue-property-decorator';

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
export default class Configuration extends Vue {
  /**
   * room name that should be watched
   */
  @Prop() room;

  /**
   * Disable formular and hide button
   */
  @Prop() disabled;

  /**
   * Class definitions
   */
  classes = null;

  /**
   * status flags
   */
  loading = true;

  /**
   * wait 2000ms before sending updates to other users
   */
  changeTimeout;

  /**
   * current selected theme
   */
  theme = '';

  /**
   * Usable setTheme function
   */
  setTheme = battletris.setTheme;

  async created() {
    // load classes defintion and rooms
    this.classes = await battletris.getClasses();
    this.theme = window.localStorage['battletris-theme'];

    this.loading = false;
  }

  /**
   * Use current configuration and send update events.
   */
  async useConfiguration(timeout = 1000) {
    if (this.changeTimeout) {
      window.clearTimeout(this.changeTimeout);
    }

    // send update
    this.changeTimeout = setTimeout(
      () => battletris.populateConfig(this.room, this.$store.state.userConfig),
      timeout
    );
  }
}

