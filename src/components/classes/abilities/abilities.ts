import Component, { mixins } from 'vue-class-component';
import { Vue, Prop, Watch } from 'vue-property-decorator';

@Component({
})
export default class BattletrisAbilities extends Vue {
  /**
   * name of the class for that the abilities should be shown
   */
  @Prop() className;

  /**
   * Battle user with current stats about ability usage
   */
  @Prop() battleUser;

  /**
   * Show less and smaller information
   */
  @Prop() minimize;

  /**
   * Current date time, will be updated each second.
   */
  dateNow = Date.now();
  dateNowInterval;

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
