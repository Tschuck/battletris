import Component, { mixins } from 'vue-class-component';
import { Vue } from 'vue-property-decorator';

import * as battletris from '../../../battletris';
import Loading from '../loading/loading.vue';
import Panel from '../panel/panel.vue';
import Map from './map/map.vue';

@Component({
  components: {
    'battletris-map': Map,
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
  roomDetails = null;

  async created() {

    this.loading = false;
  }

  async beforeDestroy() {
    this.listeners.forEach(listener => listener());
  }
}
