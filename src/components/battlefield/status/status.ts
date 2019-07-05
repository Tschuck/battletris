import Component, { mixins } from 'vue-class-component';
import { Vue, Prop } from 'vue-property-decorator';

import * as battletris from '../../../battletris';

@Component({
  components: {
  }
})
export default class BattleUserStatus extends Vue {
  /**
   * user object to show the status for
   */
  @Prop() user;

  /**
   * active running battle
   */
  @Prop() battle;

  async created() {
  }
}
