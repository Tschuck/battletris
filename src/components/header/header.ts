import Component, { mixins } from 'vue-class-component';
import { promisify } from 'es6-promisify';
import { Vue, Prop } from 'vue-property-decorator';

import * as battletris from '../../battletris';

@Component({ })
export default class Header extends Vue {
  /**
   * room name that should be watched
   */
  @Prop() room;

  /**
   * Pass a list of users directly and listen for updates
   */
  @Prop() users;

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
