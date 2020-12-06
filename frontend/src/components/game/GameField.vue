<template>
  <div style="width: 100%; height: 100%;" class="flex flex-col">
    <div ref="container" class="flex-grow" />

    <div>
      <div>blockCount: {{blockCount}}</div>
      <div>rowCount: {{rowCount}}</div>
      <div>speed: {{speed}}</div>

      <div v-if="isCurrUser">
        <div>latency: {{latency.join('ms, ')}}</div>
      </div>

      <countdown :interval="100" :time="nextBlockMove">
        <template slot-scope="props">next down move: {{ props.milliseconds }}</template>
      </countdown>
    </div>
  </div>
</template>

<script lang="ts">
import {
  onUnmounted, onMounted, ref,
} from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import Konva from 'konva';

import { formatGameUser, WsMessageType, Blocks } from '@battletris/shared';
import { GameUserInterface, getPreviewY } from '@battletris/shared/functions/gameHelper';
import { cloneDeep } from 'lodash';
import ClassLogo from '../general/ClassLogo.vue';
import GameConnection, { getCurrentConnection } from '../../lib/GameConnection';
import currUser from '../../lib/User';

interface GameFieldProps {
  roomId: string;
  userData: GameUserInterface;
  userId: string;
  userIndex: number;
}

const colorMap = {
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

const animationSpeed = 0.07;

@Component({
  components: {
    ClassLogo,
  },
  props: {
    roomId: { type: String },
    userData: { },
    userId: { type: String },
    userIndex: { type: Number },
  },
  setup(props) {
    const {
      userData, userId, userIndex,
    } = props as unknown as GameFieldProps;

    // vue param setup
    const gameConn = getCurrentConnection() as GameConnection;
    const isCurrUser = ref<boolean>(currUser.id === userId);
    const userElId = ref((userId).replace(/-/g, ''));
    const container = ref();
    const enableAnimation = ref(true);
    // stat values
    const blockCount = ref(userData.blockCount);
    const rowCount = ref(userData.rowCount);
    const speed = ref(userData.speed);
    const nextBlockMove = ref(Date.now());
    const latency = ref<number[]>([]);

    // convas rendering
    let gameStage: Konva.Stage;
    let mapLayer: Konva.Layer;
    let stoneLayer: Konva.Layer;
    let previewLayer: Konva.Layer;
    // current field specifications => will be set onMounted
    let width: number;
    let height: number;
    let colHeight: number;
    let colWidth: number;
    // meassure performance
    let lastKeyPressTime: number;

    // ----------------------------------- konva setup ------------------------------------------ //
    /** Create the initial setup for the map */
    const getNewGridLayer = (
      layer: Konva.Layer|Konva.Group,
      yMax: number,
      xMax: number,
      rectOptions: Konva.RectConfig = {},
    ) => {
      for (let y = 0; y < yMax; y += 1) {
        const rowGroup = new Konva.Group({
          x: 0,
          y: y * colHeight,
        });

        for (let x = 0; x < xMax; x += 1) {
          rowGroup.add(new Konva.Rect({
            fill: colorMap.STONES[0],
            height: colHeight,
            width: colWidth,
            x: x * colWidth,
            y: 0,
            ...rectOptions,
          }));
        }

        layer.add(rowGroup);
      }

      return layer;
    };
    const updateLayerSize = (layer: Konva.Layer|Konva.Group) => {
      layer.children.toArray().forEach((row, y: number) => {
        row.height(colHeight);
        row.y(y * colHeight);
        row.children.toArray().forEach((col, x: number) => {
          col.height(colHeight);
          col.width(colWidth);
          col.x(x * colWidth);
        });
      });
    };
    const updateGameStage = () => {
      width = container.value.clientWidth;
      height = container.value.clientHeight;
      colHeight = height / 20;
      colWidth = width / 10;
      // ensure squares
      if (colWidth > colHeight) {
        colWidth = colHeight;
      } else if (colHeight > colWidth) {
        colHeight = colWidth;
      }

      gameStage.width(width);
      gameStage.height(height);
    };
    /** update the map with a map diff object from the game process */
    const updateLayerColors = (layer: Konva.Layer|Konva.Group, mapDiff: number[][]) => {
      mapDiff.forEach((updatedRow: number[], y: number) => {
        // if the row was updated, iterate over the cols
        if (updatedRow) {
          // set the corresponding col color
          updatedRow.forEach((col, x) => {
            layer.children[y].children[x].fill(colorMap.STONES[col || 0]);
          });
        }
      });
    };
    /** create a new stone layer for the current block. */
    const createStoneLayer = (rectOptions: Konva.RectConfig = {}) => {
      // format the new block into the correct color
      // use stone roation 0, will be handled by drawing
      const newBlock = cloneDeep(Blocks[userData.block][0]).map(
        (row) => row.map((col) => (col ? userData.block : 0)),
      );

      // create a new layer in the correct size
      const layer = new Konva.Layer({
        width: newBlock.length * colWidth,
        height: newBlock.length * colHeight,
      });
      const rotatingGroup = new Konva.Group({
        width: newBlock.length * colWidth,
        height: newBlock.length * colHeight,
      });
      layer.add(rotatingGroup);
      // create stone map within the inner group. so we can spin it seperatly
      getNewGridLayer(rotatingGroup, newBlock.length, newBlock.length, rectOptions);
      // set the layer colors
      updateLayerColors(rotatingGroup, newBlock);

      return layer;
    };
    /** move a stone layer to a specific postion */
    const positionStoneLayer = (layer: Konva.Layer, isPreview = false, duration = animationSpeed) => {
      const x = userData.x * colWidth;
      let y;

      // if its not a preview stone, so we can just use user stone position
      if (!isPreview) {
        y = userData.y * colHeight;
      } else {
        // calculate lowest y position that is possible
        y = getPreviewY(
          userData.map,
          Blocks[userData.block][userData.rotation % 4],
          userData.y,
          userData.x,
        ) * colHeight;
      }

      layer.children[0].to({
        duration: enableAnimation.value ? duration : 0,
        rotation: userData.rotation * 90,
      });

      // animate the positioning and rotation
      layer.to({
        duration: enableAnimation.value ? duration : 0,
        x,
        y,
      });
    };
    /** removes old stone layers, create new ones for the latest block and add them to the stage */
    const onStoneChange = () => {
      // ensure that the layers for the stones are not duplicated
      if (stoneLayer) {
        stoneLayer.remove();
      }
      if (previewLayer) {
        previewLayer.remove();
      }
      // create new layers
      stoneLayer = createStoneLayer();
      previewLayer = createStoneLayer({ opacity: 0.2 });
      // apply offset for correct rotation
      [stoneLayer, previewLayer].forEach((layer) => {
        // in case of a block, children null will be always the group for rotating
        const offsetX = layer.children[0].getClientRect().width / 2;
        const offsetY = layer.children[0].getClientRect().height / 2;
        layer.children[0].position({ x: offsetX, y: offsetY });
        layer.children[0].offset({ x: offsetX, y: offsetY });
      });
      // set initial position
      positionStoneLayer(stoneLayer, false, 0);
      positionStoneLayer(previewLayer, true, 0);
      // add them to the stage
      gameStage.add(stoneLayer);
      gameStage.add(previewLayer);
    };

    // declar resize watcher here, so we can use all game update functions
    const windowResizeWatch = () => {
      updateGameStage();
      updateLayerSize(mapLayer);
      updateLayerSize(stoneLayer.children[0] as Konva.Group);
      updateLayerSize(previewLayer.children[0] as Konva.Group);
      stoneLayer.x(userData.x * colWidth);
      stoneLayer.y(userData.y * colHeight);
      gameStage.draw();
    };
    onMounted(() => {
      gameStage = new Konva.Stage({ container: container.value });
      updateGameStage();

      // setup initial field
      mapLayer = getNewGridLayer(new Konva.Layer(), 20, 10, {
        stroke: colorMap.STROKE,
        strokeWidth: 0.1,
      }) as Konva.Layer;

      updateLayerColors(mapLayer, userData.map);
      gameStage.add(mapLayer);

      // setup initial stone layers
      onStoneChange();

      // resize layers sizes, when the window size has changed
      window.addEventListener('resize', windowResizeWatch);
    });

    // ----------------------------------- game handling ---------------------------------------- //
    const isSet = (value: number) => value !== undefined;
    const updatedOrPrevious = (value: number, previous: number) => (value !== undefined
      ? value : previous);
    gameConn.onMessage(async (type: WsMessageType, payload: any) => {
      switch (type) {
        case WsMessageType.GAME_USER_UPDATE: {
          // only update the map, if the current user is updated
          if (payload[userIndex]) {
            const updatedUser = formatGameUser(payload[userIndex]);

            // detect latency of input
            if (lastKeyPressTime && isCurrUser) {
              latency.value.unshift(Date.now() - lastKeyPressTime);
              if (latency.value.length > 10) {
                latency.value.pop();
              }
              lastKeyPressTime = 0;
            }

            // update stats
            if (updatedUser.rowCount) {
              rowCount.value = updatedUser.rowCount;
            }
            if (updatedUser.blockCount) {
              blockCount.value = updatedUser.blockCount;
            }
            if (updatedUser.speed) {
              speed.value = updatedUser.speed;
            }

            // map updates
            const {
              block,
              map,
              rotation,
              x,
              y,
            } = updatedUser;

            // if map was updated, update the rows
            if (Array.isArray(map)) {
              // update the user map to the lastet version, so we can create the preview stone
              userData.map = userData.map.map((row, index) => (map[index] ? map[index] : row));
              // draw the updated rows again
              updateLayerColors(mapLayer, map);
              mapLayer.draw();
            }

            // if block was updated, redraw the stone layer
            if (isSet(block) || isSet(x) || isSet(y) || isSet(rotation)) {
              // move down the
              userData.rotation = updatedOrPrevious(rotation, userData.rotation);
              userData.y = updatedOrPrevious(y, userData.y);
              userData.x = updatedOrPrevious(x, userData.x);

              if (isSet(block)) {
                userData.block = updatedOrPrevious(block, userData.block);
                onStoneChange();
              } else {
                // set initial position
                positionStoneLayer(stoneLayer, false);
                positionStoneLayer(previewLayer, true);
                // update next block move timer
                if (userData.y) {
                  nextBlockMove.value = Date.now() + speed.value;
                }
              }
            }
          }
          break;
        }
      }
    }, onUnmounted);

    // listen for keypress
    const keyDownHandler = ($event: KeyboardEvent) => {
      lastKeyPressTime = Date.now();
      gameConn.send(WsMessageType.GAME_INPUT, $event.keyCode);
    };
    if (isCurrUser.value) {
      window.addEventListener('keydown', keyDownHandler);
    }

    // be sure to stop watching, when game was left
    onUnmounted(() => {
      window.removeEventListener('resize', windowResizeWatch);
      window.removeEventListener('keydown', keyDownHandler);
    });

    return {
      blockCount,
      container,
      enableAnimation,
      isCurrUser,
      latency,
      nextBlockMove,
      rowCount,
      speed,
      userElId,
    };
  },
})
export default class Game extends Vue {}
</script>
