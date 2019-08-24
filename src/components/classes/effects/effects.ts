import Component, { mixins } from 'vue-class-component';
import { Vue, Prop, Watch } from 'vue-property-decorator';

@Component({ })
export default class BattletrisEffects extends Vue {
  /**
   * Battle user with current stats about ability usage
   */
  @Prop() battleUser;

  /**
   * Current date time, will be updated each second.
   */
  dateNow = Date.now();
  dateNowInterval;
  /**
   * Card size
   */
  @Prop({
    default: '40px'
  }) size;

  /**
   * Show only icons
   */
  @Prop() minimize;

  /**
   * Bind date watcher to be able to update cooldown times
   */
  created() {
    this.dateNowInterval = setInterval(() => this.dateNow = Date.now(), 1000);
  }

  /**
   * Clear date watcher.
   */
  beforeDestroy() {
    clearInterval(this.dateNowInterval);
  }
}
