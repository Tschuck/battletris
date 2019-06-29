import Component, { mixins } from 'vue-class-component';
import { Vue } from 'vue-property-decorator';

import * as battletris from '../../battletris';
import Loading from '../loading/loading.vue';
import Panel from '../panel/panel.vue';

@Component({
  components: {
    'battletris-panel': Panel,
    'loading': Loading,
  }
})
export default class BattleField extends Vue {
  /**
   * Status flags
   */
  loading = true;
  error = '';

  /**
   * listeners for ws updates
   */
  listeners: Array<any> = [ ];

  /**
   * Opened room, save it to the variable, else, we cannot handle correct roomLeave
   */
  room = '';

  async created() {
    this.room = this.$route.params.room;

    // say everyone we are in the house
    await battletris.joinRoom(this.room, this.$store.state.userConfig);

    this.loading = false;
  }

  async beforeDestroy() {
    await battletris.leaveRoom(this.room);
    this.listeners.forEach(listener => listener());
  }
}
