<template>
  <div style="width: 100%; height: 100%;" ref="container">

  </div>
</template>

<script lang="ts">
import { onUnmounted, onMounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import { mergeWith, update } from 'lodash';
import Konva from 'konva';

import { formatGameUser, WsMessageType } from '@battletris/shared';
import { GameUserInterface } from '@battletris/shared/functions/gameUser';
import ClassLogo from '../general/ClassLogo.vue';
import GameConnection, { getCurrentConnection } from '../../lib/GameConnection';
import currUser from '../../lib/User';

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
    const gameConn = getCurrentConnection() as GameConnection;
    const isCurrUser = ref<boolean>(currUser.id === props.userId);
    const userElId = ref((props.userId as string).replace(/-/g, ''));
    const container = ref();
    const colorMap = [
      '#242c31',
      'red',
    ];
    let gameStage: Konva.Stage;
    let mapLayer: Konva.Layer;
    const gameUser = props.userData as GameUserInterface;

    // setup general game board
    onMounted(() => {
      const width = container.value.clientWidth;
      const height = container.value.clientHeight;
      const colHeight = height / 20;
      const colWidth = width / 10;

      gameStage = new Konva.Stage({
        container: container.value,
        width,
        height,
      });

      mapLayer = new Konva.Layer();

      gameUser.map.forEach((row: number[], y: number) => {
        const rowGroup = new Konva.Group({
          x: 0,
          y: y * colHeight,
        });

        row.forEach((col: number, x) => {
          rowGroup.add(new Konva.Rect({
            x: x * colWidth,
            y: 0,
            width: colWidth,
            height: colHeight,
            fill: '#242c31',
            stroke: '#1a2024',
            strokeWidth: 2,
          }));
        });

        // add the shape to the layer
        mapLayer.add(rowGroup);
      });

      // add the layer to the stage
      gameStage.add(mapLayer);
    });

    gameConn.onMessage(async (type: WsMessageType, payload: any) => {
      switch (type) {
        case WsMessageType.GAME_USER_UPDATE: {
          // only update the map, if the current user is updated
          if (payload[props.userIndex as number]) {
            const userUpdate = formatGameUser(payload[props.userIndex as number]);
            // if map was updated, update the rows
            if (Array.isArray(userUpdate?.map)) {
              userUpdate.map.forEach((updatedRow: []|null, y: number) => {
                // if the row was updated, iterate over the cols
                if (updatedRow) {
                  // set the corresponding col color
                  updatedRow.forEach((col, x) => {
                    mapLayer.children[y].children[x].fill(colorMap[col ? 1 : 0]);
                  });
                }
              });
            }

            gameStage.draw();
          }
          break;
        }
      }
    }, onUnmounted);

    return {
      container,
      gameUser,
      isCurrUser,
      userElId,
    };
  },
})
export default class Game extends Vue {}
</script>
