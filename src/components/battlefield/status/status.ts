import Component, { mixins } from 'vue-class-component';
import { Vue, Prop, Watch } from 'vue-property-decorator';

import * as battletris from '../../../battletris';

@Component({ })
export default class BattleUserStatus extends Vue {
  /**
   * user object to show the status for
   */
  @Prop() user;

  /**
   * active running battle
   */
  @Prop() battle;
}
