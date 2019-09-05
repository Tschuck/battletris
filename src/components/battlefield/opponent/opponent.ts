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

  /**
   * Hide the full content to force map rerender on userId change.
   */
  rerender = false;

  /**
   * Watch for userId changes to rerender the battle map.
   *
   * @class      Watch (name)
   */
  @Watch('userId')
  onChildChanged(val: string, oldVal: string) {
    this.rerender = true;
    this.$nextTick(() => this.rerender = false);
  }

  created() {
    this.connectionId = battletris.wsClient.id;
  }

  initialized() {
    this.$emit('init', this);
  }
}
