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

  /**
   * was the configuration opened the first time? Show some explanations
   */
  showExplanations = false;

  async created() {
    // load classes defintion and rooms
    this.classes = this.$store.state.classes;
    this.theme = window.localStorage['battletris-theme'];
    this.loading = false;

    if (this.$store.state.userConfig.initial) {
      this.$nextTick(() => (this.$refs.configModal as any).show());

      // show initial instructions
      this.showExplanations = true;

      // clear initial state and save it
      delete this.$store.state.userConfig.initial;
      battletris.updateUserConfig(this.$store.state.userConfig);
    }
  }

  /**
   * Activate the given class name.
   *
   * @param      {any}  $event  click event
   */
  useClass(className: string, $event: any) {
    this.$store.state.userConfig.className = className;
    this.useConfiguration(0);
  }

  /**
   * Use current configuration and send update events.
   */
  useConfiguration(timeout = 1000) {
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

