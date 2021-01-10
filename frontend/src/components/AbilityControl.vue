<template>
  <div class="relative">
    <div
      class="absolute top-0 left-0 z-10 flex justify-between w-full p-1"
      :class="{
        'no-mana': userMana < mana && !cooldown,
        'cooldown-active': cooldown,
      }"
    >
      <div class="text-xs">{{ mana }}</div>
      <div class="text-xs font-bold">{{ keyText }}</div>
    </div>
    <div
      v-if="cooldown"
      class="absolute bottom-0 left-0 right-0 z-20 flex justify-between w-full p-1 font-xs"
    >
      <countdown class="w-full text-center" :interval="1000" :time="cooldown - dateNow()">
        <template slot-scope="props">
          <span class="text-center">{{ props.seconds }}s</span>
        </template>
      </countdown>
    </div>
    <Control
      ref="control"
      class="medium tooltip-box"
      :value="keyValue"
      @keydown="$emit('keydown', $event)"
    >
      <AbilityLogo
        :class="{
          'no-mana': userMana < mana && !cooldown,
          'cooldown-active': cooldown,
        }"
        class="p-3"
        :className="className"
        :abilityIndex="abilityIndex"
      />
      <AbilityTooltip :className="className" :abilityIndex="abilityIndex" />
    </Control>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';
import { classes } from '@battletris/shared/functions/classes';
import AbilityTooltip from './AbilityTooltip.vue';
import AbilityLogo from '../icons/AbilityLogo.vue';
import Control from './Control.vue';

@Component({
  components: {
    AbilityLogo,
    AbilityTooltip,
    Control,
  },
  props: {
    abilityIndex: { type: Number },
    className: { type: String },
    keyText: { type: String },
    keyValue: { type: Number },
    userMana: { type: Number },
    cooldown: { type: Number },
  },
  setup(props) {
    const control = ref();
    const mana = ref(
      classes[props.className as string].abilities[props.abilityIndex as number]
        .mana,
    );

    // proxy control mouse down and up events
    const mouseDown = (touch: number) => control.value.mouseDown(touch);
    const mouseUp = (touch: number) => control.value.mouseUp(touch);

    // get current date time
    const dateNow = () => Date.now();

    return {
      control,
      dateNow,
      mana,
      mouseDown,
      mouseUp,
    };
  },
})
export default class AbilityControl extends Vue {}
</script>

<style lang="postcss">
.no-mana {
  opacity: 0.5;
}
.cooldown-active {
  opacity: 0.1;
}
</style>
