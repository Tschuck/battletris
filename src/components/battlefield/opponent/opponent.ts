import Component, { mixins } from 'vue-class-component';
import { Vue, Prop, Watch } from 'vue-property-decorator';

import * as battletris from '../../../battletris';

@Component({ })
export default class BattletrisOpponent extends Vue {
  /**
   * user object to show the status for
   */
  @Prop() userId;

  /**
   * active running battle
   */
  @Prop() battle;

  /**
   * active running battle
   */
  @Prop() roomDetails;

  /**
   * Current battletris map.
   */
  map: any;

  /**
   * Currents user connection id
   */
  connectionId = '';

  created() {
    this.connectionId = battletris.wsClient.id;
  }

  initialized() {
    this.$emit('init', this);
  }
}
