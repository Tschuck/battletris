<template>
  <div class="flex flex-col items-center">
    <div class="flex justify-center" v-if="showAbilities">
      <AbilityControl
        ref="q"
        class="mr-3 medium tooltip-box"
        :className="className"
        :abilityIndex="0"
        :keyValue="81"
        :userMana="userMana"
        :cooldown="cooldowns[0]"
        keyText="Q"
        @keydown="$emit('keydown', $event)"
      />
      <AbilityControl
        ref="w"
        class="mr-3 medium tooltip-box"
        :className="className"
        :abilityIndex="1"
        :keyValue="87"
        :userMana="userMana"
        :cooldown="cooldowns[1]"
        keyText="W"
        @keydown="$emit('keydown', $event)"
      />
      <AbilityControl
        ref="e"
        class="mr-3 medium tooltip-box"
        :className="className"
        :abilityIndex="2"
        :keyValue="69"
        :userMana="userMana"
        :cooldown="cooldowns[2]"
        keyText="E"
        @keydown="$emit('keydown', $event)"
      />
      <AbilityControl
        ref="r"
        class="mr-3 medium tooltip-box"
        :className="className"
        :abilityIndex="3"
        :keyValue="82"
        :userMana="userMana"
        :cooldown="cooldowns[3]"
        keyText="R"
        @keydown="$emit('keydown', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Control from './Control.vue';
import AbilityLogo from '../icons/AbilityLogo.vue';
import Tooltip from './Tooltip.vue';
import AbilityTooltip from './AbilityTooltip.vue';
import AbilityControl from './AbilityControl.vue';

@Component({
  components: {
    AbilityControl,
    AbilityLogo,
    AbilityTooltip,
    Control,
    Tooltip,
  },
  props: {
    showAbilities: {
      type: Boolean,
      default: true,
    },
    showKeys: {
      type: Boolean,
      default: true,
    },
    className: {
      type: String,
    },
    userMana: {
      type: Number,
    },
    cooldowns: {},
  },
})
export default class Controls extends Vue {}
</script>
