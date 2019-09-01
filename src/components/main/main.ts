import Component, { mixins } from 'vue-class-component';
import { promisify } from 'es6-promisify';
import { Vue } from 'vue-property-decorator';

import * as battletris from '../../battletris';
import Loading from '../loading/loading.vue';

@Component({ })
export default class Main extends Vue {
  /**
   * status flags
   */
  loading = true;
  error = '';

  async created() {
    try {
      await battletris.initialize();
      this.$store.state.userConfig = await battletris.getUserConfig();
      this.$store.state.classes = await battletris.getClasses();

      // check if user class is available, else use the first one
      const classNames = Object.keys(this.$store.state.classes);
      if (classNames.indexOf(this.$store.state.userConfig.className) === -1) {
        this.$store.state.userConfig.className = classNames[0];
      }
    } catch (ex) {
      this.error = ex.message;
    }

    this.loading = false;
  }
}
