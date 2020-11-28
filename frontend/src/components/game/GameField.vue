<template>
  <div style="width: 100%; height: 100%;" ref="container" />
</template>

<script lang="ts">
import { onUnmounted, onMounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import Konva from 'konva';

import { formatGameUser, WsMessageType, Blocks } from '@battletris/shared';
import { GameUserInterface } from '@battletris/shared/functions/gameUser';
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
      roomId, userData, userId, userIndex,
    } = props as unknown as GameFieldProps;

    // vue param setup
    const gameConn = getCurrentConnection() as GameConnection;
    const isCurrUser = ref<boolean>(currUser.id === userId);
    const userElId = ref((userId).replace(/-/g, ''));
    const container = ref();

    // convas rendering
    let gameStage: Konva.Stage;
    let mapLayer: Konva.Layer;
    let stoneLayer: Konva.Layer;
    // current field specifications => will be set onMounted
    let width: number;
    let height: number;
    let colHeight: number;
    let colWidth: number;

    // ----------------------------------- konva setup ------------------------------------------ //
    /** Create the initial setup for the map */
    const getNewGridLayer = (yMax: number, xMax: number, useStroke = true) => {
      // setup the map layer
      const layer = new Konva.Layer();

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
            ...(useStroke ? {
              stroke: colorMap.STROKE,
              strokeWidth: 0.3,
            } : {}),
          }));
        }

        layer.add(rowGroup);
      }

      return layer;
    };
    const updateLayerSize = (layer: Konva.Layer) => {
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
    const updateLayerColors = (layer: Konva.Layer, mapDiff: number[][]) => {
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
    const updateStoneLayer = () => {
      // set new position
      stoneLayer.y(userData.y * colHeight);
      stoneLayer.x(userData.x * colWidth);
      // format the new block into the correct color
      const blockToDisplay = Blocks[userData.block][userData.rotation].map(
        (row) => row.map((col) => (col ? userData.block : 0)),
      );
      updateLayerColors(stoneLayer, blockToDisplay);
    };

    // declar resize watcher here, so we can use all game update functions
    const windowResizeWatch = () => {
      updateGameStage();
      updateLayerSize(mapLayer);
      updateLayerSize(stoneLayer);
      stoneLayer.x(userData.x * colWidth);
      stoneLayer.y(userData.y * colHeight);
      gameStage.draw();
    };
    onMounted(() => {
      gameStage = new Konva.Stage({ container: container.value });
      updateGameStage();

      // setup initial field
      mapLayer = getNewGridLayer(20, 10);
      stoneLayer = getNewGridLayer(4, 4, false);
      gameStage.add(mapLayer);
      gameStage.add(stoneLayer);

      // render initial data
      updateLayerColors(mapLayer, userData.map);
      updateStoneLayer();

      // resize layers sizes, when the window size has changed
      window.addEventListener('resize', windowResizeWatch);
    });
    // be sure to stop watching, when game was left
    onUnmounted(() => window.removeEventListener('resize', windowResizeWatch));

    // ----------------------------------- game handling ---------------------------------------- //
    const isSet = (value: number) => value !== undefined;
    const updatedOrPrevious = (value: number, previous: number) => (value !== undefined
      ? value : previous);
    gameConn.onMessage(async (type: WsMessageType, payload: any) => {
      switch (type) {
        case WsMessageType.GAME_USER_UPDATE: {
          // only update the map, if the current user is updated
          if (payload[userIndex]) {
            const {
              block,
              map,
              rotation,
              x,
              y,
            } = formatGameUser(payload[userIndex]);

            if (isSet(x) || isSet(y) || isSet(block) || isSet(rotation)) {
              userData.block = updatedOrPrevious(block, userData.block);
              userData.rotation = updatedOrPrevious(rotation, userData.rotation);
              userData.y = updatedOrPrevious(y, userData.y);
              userData.x = updatedOrPrevious(x, userData.x);

              updateStoneLayer();
            }

            console.log(map);

            // if map was updated, update the rows
            if (Array.isArray(map)) {
              updateLayerColors(mapLayer, map);
            }

            // console.log(`[${userData.y}][${userData.x}] - ${userData.block} => ${userData.rotation}`);
            gameStage.draw();
          }
          break;
        }
      }
    }, onUnmounted);

    return {
      container,
      isCurrUser,
      userElId,
    };
  },
})
export default class Game extends Vue {}
</script>
