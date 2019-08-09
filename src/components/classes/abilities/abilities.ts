import Component, { mixins } from 'vue-class-component';
import { Vue, Prop, Watch } from 'vue-property-decorator';

@Component({ })
export default class BattletrisAbilities extends Vue {
  /**
   * name of the class for that the abilities should be shown
   */
  @Prop() className;

  /**
   * Battle user with current stats about ability usage
   */
  @Prop() battleUser;
}
