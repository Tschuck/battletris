import Konva from 'konva';
import { cloneDeep } from 'lodash';
import {
  Blocks, gameHelper,
} from '@battletris/shared';
import { getRotationBlockIndex } from '@battletris/shared/functions/gameHelper';
import FrontendGameUser from './GameUser';
import StoneLayer from './StoneLayer';

const animationSpeed = 0.05;
// const animationSpeed = 0;
export const colorMap = {
  STROKE: '#1a2024',
  STONES: [
    'transparent',
    '#CCD4BF',
    '#E7CBA9',
    '#EEBAB2',
    '#BEB4C5',
    '#F27348',
    '#8C7386',
    '#E8D595',
  ],
};

export interface RenderConfig {
  // enable animation
  animation: boolean;

  // enable preview rendering (TODO: implement)
  preview: boolean;
}

export default class GameRenderer {
  /** element to render Konva in */
  private element: HTMLDivElement;

  /** block height */
  colHeight!: number;

  /** block height */
  colWidth!: number;

  /** field height */
  height!: number;

  /** field width */
  width!: number;

  /** konva game stage */
  gameStage!: Konva.Stage;

  /** layer to render the map to */
  mapLayer!: Konva.Layer;

  /** layer for block rendering */
  stoneLayer!: StoneLayer;

  /** layer for block preview rendering */
  previewLayer!: StoneLayer;

  /** current user instance */
  user: FrontendGameUser;

  /** user specific configuration */
  config: RenderConfig;

  constructor(element: HTMLDivElement, user: FrontendGameUser, config: RenderConfig) {
    this.element = element;
    this.user = user;
    this.config = config;

    this.init();
  }

  /** initialize the whole rendering logic */
  init() {
    // setup
    this.gameStage = new Konva.Stage({ container: this.element });
    this.updateGameStage();

    // setup initial field
    this.mapLayer = this.getNewGridLayer(new Konva.Layer(), 20, 10, {
      stroke: colorMap.STROKE,
      strokeWidth: 0.2,
    }) as Konva.Layer;

    this.updateLayerColors(this.mapLayer, this.user.map);
    this.gameStage.add(this.mapLayer);

    // setup initial stone layers and react on changes
    this.onStoneChange();
    this.watchForUserUpdates();

    // resize layers sizes, when the window size has changed
    window.addEventListener('resize', this.windowResizeWatch.bind(this));
  }

  watchForUserUpdates() {
    // overwrite game user "event hooks", so we can react with the game renderer
    this.user.onMapChange = () => {
      // draw the updated rows again
      this.updateLayerColors(this.mapLayer, this.user.map);
      this.mapLayer.draw();
    };
    this.user.onStoneChange = () => this.onStoneChange();
    this.user.onStoneMove = () => {
      // set initial position
      this.positionStoneLayer(this.stoneLayer, false);
      // only render preview for acting user
      this.positionStoneLayer(this.previewLayer, true);
    };
  }

  /** remove resize listeners */
  destroy() {
    window.removeEventListener('resize', this.windowResizeWatch);
  }

  /** Create the initial setup for the map */
  getNewGridLayer(
    layer: Konva.Layer|Konva.Group,
    yMax: number,
    xMax: number,
    rectOptions: Konva.RectConfig = {},
  ) {
    for (let y = 0; y < yMax; y += 1) {
      const rowGroup = new Konva.Group({
        x: 0,
        y: y * this.colHeight,
      });

      for (let x = 0; x < xMax; x += 1) {
        rowGroup.add(new Konva.Rect({
          fill: colorMap.STONES[0],
          height: this.colHeight,
          width: this.colWidth,
          x: x * this.colWidth,
          y: 0,
          ...rectOptions,
        }));
      }

      layer.add(rowGroup);
    }

    return layer;
  }

  updateLayerSize(layer: Konva.Layer|Konva.Group) {
    layer.children.toArray().forEach((row, y: number) => {
      row.height(this.colHeight);
      row.y(y * this.colHeight);
      row.children.toArray().forEach((col, x: number) => {
        col.height(this.colHeight);
        col.width(this.colWidth);
        col.x(x * this.colWidth);
      });
    });
  }

  updateGameStage() {
    const width = this.element.clientWidth;
    const height = this.element.clientHeight;
    this.colHeight = height / 20;
    this.colWidth = width / 10;
    // ensure squares
    if (this.colWidth > this.colHeight) {
      this.colWidth = this.colHeight;
    } else if (this.colHeight > this.colWidth) {
      this.colHeight = this.colWidth;
    }
    // set width and height with the correct calculated values
    this.width = this.colWidth * 10;
    this.height = this.colHeight * 20;

    this.gameStage.width(this.width);
    this.gameStage.height(this.height);
  }

  /** update the map with a map diff object from the game process */
  updateLayerColors(layer: Konva.Layer|Konva.Group, mapDiff: number[][]) {
    mapDiff.forEach((updatedRow: number[], y: number) => {
      // if the row was updated, iterate over the cols
      if (updatedRow) {
        // set the corresponding col color
        updatedRow.forEach((col, x) => {
          layer.children[y].children[x].fill(colorMap.STONES[col || 0]);
        });
      }
    });
  }

  /** create a new stone layer for the current block. */
  createStoneLayer(rectOptions: Konva.RectConfig = {}) {
    // format the new block into the correct color
    // use stone roation 0, will be handled by drawing
    const newBlock = cloneDeep(Blocks[this.user.block][0]).map(
      (row) => row.map((col) => (col ? this.user.block : 0)),
    );

    // create a new layer in the correct size
    const layer = new StoneLayer({
      // width: newBlock.length * this.colWidth,
      // height: newBlock.length * this.colHeight,
    });
    const rotatingGroup = new Konva.Group({
      width: newBlock.length * this.colWidth,
      height: newBlock.length * this.colHeight,
    });
    layer.add(rotatingGroup);
    // create stone map within the inner group. so we can spin it seperatly
    this.getNewGridLayer(rotatingGroup, newBlock.length, newBlock.length, rectOptions);
    // set the layer colors
    this.updateLayerColors(rotatingGroup, newBlock);

    return layer;
  }

  /** move a stone layer to a specific postion */
  positionStoneLayer(layer: StoneLayer, isPreview = false, duration = animationSpeed) {
    if (!layer) {
      return;
    }

    const x = this.user.x * this.colWidth;
    let y: number;

    // if its not a preview stone, so we can just use user stone position
    if (!isPreview) {
      y = this.user.y * this.colHeight;
    } else {
      // calculate lowest y position that is possible
      y = gameHelper.getPreviewY(
        this.user.map,
        Blocks[this.user.block][getRotationBlockIndex(this.user.rotation)],
        this.user.y,
        this.user.x,
      ) * this.colHeight;
    }

    layer.transitionRotate(this.user.rotation * 90, duration);
    layer.transitionMove(x, y, duration);
  }

  /** removes old stone layers, create new ones for the latest block and add them to the stage */
  onStoneChange() {
    // ensure that the layers for the stones are not duplicated
    if (this.stoneLayer) {
      this.stoneLayer.remove();
    }
    if (this.previewLayer) {
      this.previewLayer.remove();
    }
    // create new layers
    this.stoneLayer = this.createStoneLayer();
    // only show preview layer for the acting user
    if (this.user.isCurrUser) {
      this.previewLayer = this.createStoneLayer({ opacity: 0.2 });
    }

    // apply offset for correct rotation
    [this.stoneLayer, this.previewLayer].forEach((layer) => {
      if (layer) {
        // in case of a block, children null will be always the group for rotating
        const offsetX = layer.children[0].getClientRect().width / 2;
        const offsetY = layer.children[0].getClientRect().height / 2;
        layer.children[0].position({ x: offsetX, y: offsetY });
        layer.children[0].offset({ x: offsetX, y: offsetY });
      }
    });
    // set initial position
    this.positionStoneLayer(this.stoneLayer, false, 0);
    this.positionStoneLayer(this.previewLayer, true, 0);
    // add them to the stage
    this.gameStage.add(this.stoneLayer);
    this.previewLayer && this.gameStage.add(this.previewLayer);
  }

  // declar resize watcher here, so we can use all game update functions
  windowResizeWatch() {
    this.updateGameStage();
    this.updateLayerSize(this.mapLayer);
    this.updateLayerSize(this.stoneLayer.children[0] as Konva.Group);
    this.updateLayerSize(this.previewLayer.children[0] as Konva.Group);
    this.stoneLayer.x(this.user.x * this.colWidth);
    this.stoneLayer.y(this.user.y * this.colHeight);
    this.gameStage.draw();
  }
}
