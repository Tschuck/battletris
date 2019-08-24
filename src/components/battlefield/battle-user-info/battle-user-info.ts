import Component, { mixins } from 'vue-class-component';
import { Vue, Prop, Watch } from 'vue-property-decorator';

import * as battletris from '../../../battletris';

@Component({ })
export default class BattletrisBattleHover extends Vue {
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
   * Show a minimized view
   *
   * @class      Prop (name)
   */
  @Prop() minimize;
}
