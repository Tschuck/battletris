import Component, { mixins } from 'vue-class-component';
import { Vue, Prop, Watch } from 'vue-property-decorator';

import * as battletris from '../../../battletris';
import Loading from '../../loading/loading.vue';

@Component({
  components: {
    'loading': Loading,
  }
})
export default class Map extends Vue {
  /**
   * Status flags
   */
  loading = true;
  error = '';

  /**
   * listeners for ws updates
   */
  listeners: Array<any> = [ ];

  /**
   * Opened room, save it to the variable, else, we cannot handle correct roomLeave
   */
  room = '';

  /**
   * Empty field definition
   */
  emptyField: Array<any> = [ ];

  /**
   * field size specifications
   */
  fieldSize = { width: 0, height: 0, };

  /**
   * send instance to parent component
   */
  created() {
    this.$emit('init', this);
  }

  async mounted() {
    // map room for fast access
    this.room = this.$route.params.room;

    // set the correct map size
    this.handleMapSize();

    this.loading = false;
  }

  async beforeDestroy() {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Gets the correct canvas width / height.
   */
  handleMapSize() {
    const $el = (<any>this.$el)

    this.fieldSize.width = $el.offsetWidth - 5;
    this.fieldSize.height = this.fieldSize.width * 2;

    // never size the height greater than the container
    if (this.fieldSize.height > $el.offsetHeight) {
      this.fieldSize.height = $el.offsetHeight - 3;
      this.fieldSize.width = this.fieldSize.height / 2;
    }

    (<any>this.$refs.canvas).width = this.fieldSize.width;
    (<any>this.$refs.canvas).height = this.fieldSize.height;
  }

  /**
   * Draw a a map of blocks
   *
   * @param      {any}     newMap  new map to draw
   * @param      {any}     oldMap  old map, that should be resetted
   * @param      {number}  type    optional type (especially the color), that should be applied to
   *                               all the blocks
   */
  drawBlockMap(newMap: any, oldMap?: any, type?: any) {
    // reset the old map by applying type = -1
    if (oldMap) {
      this.drawBlockMap(oldMap, null, -1);
    }

    // draw the new map
    if (newMap) {
      const bodyStyle = getComputedStyle(document.body);
      const colSize = this.fieldSize.width / 10;
      const ctx = (<any>this.$refs.canvas).getContext('2d');
      ctx.strokeStyle = bodyStyle.getPropertyValue('--battletris-block-border');
      // the basic map is the plain array definition, active block will include map and active
      // position
      const map = Array.isArray(newMap.map) ? newMap.map : newMap;
      // use default values for base map
      const xStart = newMap.x || 0;
      const yStart = newMap.y || 0;

      // iterate through the map
      map.forEach((row, rowIndex) => row.forEach((col, colIndex) => {
        if (col) {
          // specify draw position
          const x = xStart + colIndex;
          const y = yStart + rowIndex;

          ctx.fillStyle = bodyStyle.getPropertyValue(
            `--battletris-block-bg-${ type || type === 0 ? type : col.type }`
          );
          ctx.fillRect(x * colSize, y * colSize, colSize, colSize);
          ctx.strokeRect(x * colSize, y * colSize, colSize, colSize);
        }
      }));
    }
  }
}
