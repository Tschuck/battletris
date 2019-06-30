import Component, { mixins } from 'vue-class-component';
import { Vue, Prop } from 'vue-property-decorator';

import * as battletris from '../../../battletris';
import Loading from '../../loading/loading.vue';

@Component({
  components: {
    'loading': Loading,
  }
})
export default class Map extends Vue {
  /**
   * Battle user object
   */
  @Prop() user;

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

  /**
   * Empty field definition
   */
  emptyField: Array<any> = [ ];

  async created() {
    this.room = this.$route.params.room;

    if (!this.user) {
      for (let y = 0; y < 20; y++) {
        this.emptyField.push([...Array(10)]);
      }
    }

    this.loading = false;
  }

  async beforeDestroy() {
    this.listeners.forEach(listener => listener());
  }
}
