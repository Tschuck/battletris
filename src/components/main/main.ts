import Component, { mixins } from 'vue-class-component';
import { promisify } from 'es6-promisify';
import { Vue } from 'vue-property-decorator';

import * as battletris from '../../battletris';
import Loading from '../loading/loading.vue';

@Component({
  components: {
    'loading': Loading
  }
})
export default class Main extends Vue {
  /**
   * status flags
   */
  loading = true;
  error = '';

  async created() {
    battletris.setTheme();

    try {
      await battletris.initialize();
      this.$store.state.userConfig = await battletris.getUserConfig();
    } catch (ex) {
      this.error = ex.message;
    }

    this.loading = false;
  }
}
