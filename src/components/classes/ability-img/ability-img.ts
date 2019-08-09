import Component, { mixins } from 'vue-class-component';
import { Vue, Prop, Watch } from 'vue-property-decorator';

@Component({ })
export default class BattletrisAbilityImg extends Vue {
  /**
   * name of the class for that the img should be shown
   */
  @Prop() className;

  /**
   * Index of the ability for that the img should be shown
   */
  @Prop() abilityIndex;

  /**
   * height of the shown svg
   */
  @Prop() height;

  /**
   * width of the shown svg
   */
  @Prop() width;

  /**
   * color of the shown svg
   */
  @Prop({ default: 'var(--battletris-ability-icon-color)' }) color;
}