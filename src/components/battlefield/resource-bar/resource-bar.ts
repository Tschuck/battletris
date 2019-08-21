import Component, { mixins } from 'vue-class-component';
import { Vue, Prop, Watch } from 'vue-property-decorator';

import * as battletris from '../../../battletris';

@Component({ })
export default class BattletrisResourceBar extends Vue {
  /**
   * amount of mana / armor / ... that should be rendered (0 - 100)
   */
  @Prop() resource;

  /**
   * type of resource (mana/ armor)
   */
  @Prop() type;

  /**
   * background color of resource
   */
  @Prop() color;
}
