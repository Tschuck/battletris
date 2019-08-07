import Component, { mixins } from 'vue-class-component';
import { Vue, Prop, Watch } from 'vue-property-decorator';

import * as battletris from '../../../battletris';

@Component({ })
export default class BattletrisManaBar extends Vue {
  /**
   * amount of mana that should be rendered (0 - 100)
   */
  @Prop() mana;
}
