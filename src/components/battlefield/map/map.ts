import Component, { mixins } from 'vue-class-component';
import { GPU } from 'gpu.js';
import { Vue, Prop, Watch } from 'vue-property-decorator';

import * as battletris from '../../../battletris';

@Component({ })
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
   * canvas getContext 2d
   */
  renderCtx: any;

  /**
   * body computed style
   */
  computedStyle: any;

  /**
   * style block values
   */
  blockStyles: any = { };

  /**
   * send instance to parent component
   */
  created() {
    this.$emit('init', this);
  }

  async mounted() {
    // map room for fast access
    this.room = this.$route.params.room;
    this.renderCtx = (<any>this.$refs.canvas).getContext('2d');
    this.computedStyle = getComputedStyle(document.body);

    // preload color styles, so they do not must be loaded during runtime
    this.blockStyles['block-border'] = this.computedStyle.getPropertyValue('--battletris-block-border');
    for (let i = -3; i < 7; i++) {
      this.blockStyles[i] = this.computedStyle.getPropertyValue(`--battletris-block-bg-${ i }`);
    }

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
    const $el = (<any>this.$el);

    this.fieldSize.width = $el.offsetWidth - 5 > 400 ? 400 : $el.offsetWidth - 5;
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
   * Overdraw the full block map
   */
  clearBlockMap() {
    this.renderCtx.fillStyle = this.blockStyles[-1];
    this.renderCtx.fillRect(0, 0, this.fieldSize.width, this.fieldSize.height);
  }

  /**
   * Draw a a map of blocks
   *
   * @param      {any}     newMap  new map to draw
   * @param      {any}     oldMap  old map, that should be resetted
   * @param      {number}  type    optional type (especially the color), that should be applied to
   *                               all the blocks
   */
  drawBlockMap(newMap: any, type?: any) {
    const colSize = this.fieldSize.width / 10;
    this.renderCtx.strokeStyle = this.blockStyles['block-border'];
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

        this.renderCtx.fillStyle = this.blockStyles[type || type === 0 ? type : col.type];
        this.renderCtx.fillRect(x * colSize, y * colSize, colSize, colSize);
        this.renderCtx.strokeRect(x * colSize, y * colSize, colSize, colSize);
      }
    }));
  }
}
