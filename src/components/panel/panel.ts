import Component, { mixins, } from 'vue-class-component';
import { promisify } from 'es6-promisify';
import { Vue } from 'vue-property-decorator';
import { Prop } from 'vue-property-decorator';

import Chat from '../chat/chat.vue';
import Configuration from '../config/config.vue';
import Users from '../users/users.vue';

@Component({
  components: {
    'battletris-chat': Chat,
    'battletris-config': Configuration,
    'battletris-users': Users,
  }
})
export default class BattletrisPanel extends Vue {
  /**
   * room name that should be watched
   */
  @Prop() room;

  /**
   * Show tavern back button
   */
  @Prop({
    default: false
  }) tavernLink;
}
