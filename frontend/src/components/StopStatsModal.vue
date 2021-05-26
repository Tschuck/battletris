<template>
  <Modal
    class="text-gray-300"
    :show="!!stopStats"
    @close="$emit('close')"
    v-if="stopStats"
  >
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl font-bold">{{ $t("game.finished") }}</h2>
      <p class="text-xs">
        {{ $t("classes.duration") }}:
        {{ stopStats.duration }}
        {{ $t("game.min-short") }}
      </p>
    </div>

    <div
      class="flex mt-3 bg-2"
      v-for="(userStat, index) in stopStats.users"
      :key="index"
    >
      <div
        class="w-3 bg-green-300 bg-opacity-50"
        v-if="userStat.isWinner"
      />
      <div class="w-3 bg-red-300 bg-opacity-50" v-else />
      <ClassLogo
        class="flex items-center justify-center p-2 ml-3"
        :className="userStat.className"
        :width="'50px'"
      />
      <div class="flex flex-col justify-center p-3">
        <h3 class="overflow-hidden">{{ userStat.name }}</h3>
        <div class="flex items-center justify-between mt-1">
          <span class="tooltip-box">
            <font-awesome-icon class="text-lg" icon="th-large" />
            {{ userStat.blockCount }}
            <Tooltip
              class="bg-1"
              :value="$t('classes.block-count-tooltip')"
              style="width: 200px"
            />
          </span>
          <span class="ml-3 tooltip-box">
            <font-awesome-icon class="text-lg" icon="chart-line" />
            {{ userStat.rowCount }}
            <Tooltip
              class="bg-1"
              :value="$t('classes.row-count-tooltip')"
              style="width: 200px"
            />
          </span>
        </div>
      </div>
      <span class="flex items-center justify-end flex-grow mr-5 font-bold" v-if="userStat.isWinner">{{
        $t("game.winner")
      }}</span>
    </div>

    <div class="mt-3 text-center">
      <button class="button" @click="$emit('close')">
        {{ $t("close") }}
      </button>
    </div>
  </Modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import Chat from './Chat.vue';
import Game from '../game/Game.vue';
import GameRegistration from '../game/GameRegistration.vue';
import Loading from './Loading.vue';
import ViewWrapper from './ViewWrapper.vue';
import Modal from './Modal.vue';
import Tooltip from './Tooltip.vue';
import ClassLogo from '../icons/ClassLogo.vue';

export interface StopStatsInterface {
  // game duration in minutes
  duration: number;
  // list of user stats
  users: {
    isWinner: boolean;
    name: string;
    blockCount: number;
    rowCount: number;
    className: string;
  }[];
}

@Component({
  components: {
    Chat,
    ClassLogo,
    Game,
    GameRegistration,
    Loading,
    Modal,
    Tooltip,
    ViewWrapper,
  },
  props: {
    stopStats: { },
  },
})
export default class StopStatsModal extends Vue {}
</script>
