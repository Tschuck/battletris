import Component, { mixins, } from 'vue-class-component';
import { promisify } from 'es6-promisify';
import { Vue } from 'vue-property-decorator';
import { Prop } from 'vue-property-decorator';

import * as battletris from '../../battletris';

@Component({ })
export default class Loading extends Vue {
  /**
   * Display error message after loading
   */
  @Prop() error;
}
